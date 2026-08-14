const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const os = require('os');

module.exports = function (app, pool, JWT_SECRET) {
  const PUBLIC_KEY = process.env.MISSION_CONTROL_PUBLIC_KEY || 'default_public_key';
  
  // Hardware Fingerprinting
  const getHardwareId = () => {
    const cpus = os.cpus();
    const cpuModel = cpus.length > 0 ? cpus[0].model : 'UnknownCPU';
    const interfaces = os.networkInterfaces();
    let mac = 'UnknownMAC';
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (!iface.internal && iface.mac !== '00:00:00:00:00:00') {
          mac = iface.mac;
          break;
        }
      }
      if (mac !== 'UnknownMAC') break;
    }
    return `${cpuModel}-${mac}`.replace(/\s+/g, '_');
  };

  // 1. Boot Status API
  app.get('/api/setup/init', async (req, res) => {
    try {
      // Auto-create necessary tables so it doesn't crash on existing deployments
      await pool.query(`
        CREATE TABLE IF NOT EXISTS hotel_settings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            hotel_name VARCHAR(255) NOT NULL,
            contact_number VARCHAR(100),
            address TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS licenses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            jwt_token TEXT NOT NULL,
            hardware_id VARCHAR(255) NOT NULL,
            status VARCHAR(50) DEFAULT 'ACTIVE',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const userCountRes = await pool.query('SELECT COUNT(*) FROM users');
      const userCount = parseInt(userCountRes.rows[0].count, 10);
      
      if (userCount === 0) {
        return res.json({ status: 'setup_required' });
      }

      const licenseRes = await pool.query("SELECT * FROM licenses WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1");
      if (licenseRes.rows.length === 0) {
        return res.json({ status: 'locked' });
      }

      res.json({ status: 'active' });
    } catch (err) {
      console.error('Initialization error:', err);
      // 42P01 is undefined_table
      if (err.code === '42P01') {
         return res.json({ status: 'locked' });
      }
      res.status(500).json({ error: 'Failed to initialize' });
    }
  });

  // 2. Setup Submit API (Phase 1)
  app.post('/api/setup/submit', async (req, res) => {
    const { hotelName, contactNumber, address, adminEmail, adminPassword, adminName } = req.body;
    try {
      const userCountRes = await pool.query('SELECT COUNT(*) FROM users');
      if (parseInt(userCountRes.rows[0].count, 10) > 0) {
        return res.status(400).json({ error: 'Setup already completed.' });
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

      await pool.query('BEGIN');
      
      await pool.query(
        'INSERT INTO hotel_settings (hotel_name, contact_number, address) VALUES ($1, $2, $3)',
        [hotelName, contactNumber, address]
      );

      const userRes = await pool.query(
        "INSERT INTO users (email, password_hash, name, role, access_level, department) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        [adminEmail, passwordHash, adminName, 'SUPER_ADMIN', 'SUPER_ADMIN', ['GLOBAL']]
      );

      await pool.query('COMMIT');
      res.json({ status: 'success', userId: userRes.rows[0].id });
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: 'Setup failed.' });
    }
  });

  // 3. License Request API (Phase 2)
  app.post('/api/license/request', async (req, res) => {
    const { requestedExpiryDate } = req.body;
    const hardwareId = getHardwareId();
    // Simulate sending to Mission Control
    console.log(`[Telemetry] Sending license request to Mission Control for hardware: ${hardwareId}, expiry: ${requestedExpiryDate}`);
    
    // In a real scenario, make axios/fetch call to Mission Control.
    res.json({ status: 'success', message: 'Activation request sent.', hardwareId });
  });

  // 4. License Polling / Status (Phase 4)
  app.post('/api/license/inject-mock', async (req, res) => {
     // Mock endpoint to unlock system during testing without real Mission Control
     const hardwareId = getHardwareId();
     const mockJwt = jwt.sign({ hardwareId, modules: ['ALL'] }, JWT_SECRET, { expiresIn: '365d' });
     await pool.query("INSERT INTO licenses (jwt_token, hardware_id, status) VALUES ($1, $2, $3)", [mockJwt, hardwareId, 'ACTIVE']);
     res.json({ status: 'success' });
  });

  app.get('/api/license/status', async (req, res) => {
    try {
      const licenseRes = await pool.query("SELECT * FROM licenses WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1");
      if (licenseRes.rows.length === 0) {
        return res.json({ status: 'locked' });
      }
      
      const license = licenseRes.rows[0];
      const hardwareId = getHardwareId();
      
      if (license.hardware_id !== hardwareId) {
        return res.json({ status: 'locked', error: 'Hardware mismatch' });
      }

      const adminRes = await pool.query("SELECT * FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1");
      if (adminRes.rows.length > 0) {
        const user = adminRes.rows[0];
        const token = jwt.sign(
          { userId: user.id, accessLevel: user.access_level, department: user.department, hotelId: user.hotel_id, role: user.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({ status: 'active', token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
      }

      res.json({ status: 'active' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to check license' });
    }
  });

  // 5. Global Lockdown Middleware
  app.use(async (req, res, next) => {
    // Exempt routes
    if (req.path.startsWith('/api/setup') || req.path.startsWith('/api/license') || req.path.startsWith('/api/auth/login')) {
      return next();
    }
    
    try {
      const licenseRes = await pool.query("SELECT * FROM licenses WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1");
      if (licenseRes.rows.length === 0) {
         return res.status(403).json({ error: 'System Locked. No valid license.' });
      }
      next();
    } catch (err) {
       if (err.code === '42P01') {
         return res.status(403).json({ error: 'System Locked. Schema incomplete.' });
       }
       next(err);
    }
  });
};
