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
      const license = licenseRes.rows[0];
      let expiresAt = null;
      try {
        const VERIFY_KEY = process.env.MISSION_CONTROL_PUBLIC_KEY || JWT_SECRET;
        const decodedPayload = jwt.verify(license.jwt_token, VERIFY_KEY);
        expiresAt = decodedPayload?.exp ? decodedPayload.exp * 1000 : null;
      } catch (jwtErr) {
        // If expired, we don't handle it here, the global middleware or /api/license/status handles marking it expired
      }

      res.json({ status: 'active', expiresAt });
    } catch (err) {
      // 42P01 is undefined_table, which is expected before initial setup
      if (err.code === '42P01') {
         return res.json({ status: 'setup_required' });
      }
      console.error('Initialization error:', err);
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
        [adminEmail.toLowerCase().trim(), passwordHash, adminName, 'SUPER_ADMIN', 'SUPER_ADMIN', ['GLOBAL']]
      );

      await pool.query('COMMIT');

      // Auto-register client with Mission Control
      const MISSION_CONTROL_URL = process.env.MISSION_CONTROL_URL || 'https://rmslicense.techhansatechnology.com';
      const registerEndpoint = MISSION_CONTROL_URL.endsWith('/') ? `${MISSION_CONTROL_URL}api/public/register-client` : `${MISSION_CONTROL_URL}/api/public/register-client`;
      
      try {
        await fetch(registerEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: adminName,
            propertyName: hotelName,
            contact: contactNumber,
            email: adminEmail
          })
        });
        console.log('[Telemetry] Client synced with Mission Control successfully.');
      } catch (err) {
        console.error('[Telemetry] Failed to sync client with Mission Control:', err.message);
        // Non-fatal error
      }

      res.json({ status: 'success', userId: userRes.rows[0].id });
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: 'Setup failed.' });
    }
  });

  // 3. License Request API (Phase 2)
  app.post('/api/license/request', async (req, res) => {
    console.log("hget")
    const hardwareId = getHardwareId();
    const MISSION_CONTROL_URL = process.env.MISSION_CONTROL_URL || 'https://rmslicense.techhansatechnology.com';
    
    // Extract macAddress and hostname required by Mission Control ActivationRequest schema
    let macAddress = '00:00:00:00:00:00';
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (!iface.internal && iface.mac !== '00:00:00:00:00:00') {
          macAddress = iface.mac;
          break;
        }
      }
      if (macAddress !== '00:00:00:00:00:00') break;
    }
    const hostname = os.hostname();
    
    console.log(`[Telemetry] Sending license request to Mission Control for hardware: ${hardwareId}`);
    
    try {
      const endpoint = MISSION_CONTROL_URL.endsWith('/') ? `${MISSION_CONTROL_URL}api/activation-requests` : `${MISSION_CONTROL_URL}/api/activation-requests`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hardwareId,
          macAddress,
          hostname,
          networkInfo: { city: 'Local', country: 'Local' }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Mission Control responded with status: ${response.status}`);
      }
      
      res.json({ status: 'success', message: 'Activation request sent.', hardwareId });
    } catch (err) {
      console.error('[Telemetry] Mission Control request failed:', err.message);
      // Return 502 Bad Gateway if we can't reach the SaaS server
      res.status(502).json({ error: 'Failed to contact Mission Control.', details: err.message });
    }
  });

  // 4. License Polling / Status (Phase 4)
  app.get('/api/license/status', async (req, res) => {
    try {
      let licenseRes = await pool.query("SELECT * FROM licenses WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1");
      const hardwareId = getHardwareId();

      // If no active license locally, attempt to pull from Mission Control
      if (licenseRes.rows.length === 0) {
        try {
          const MISSION_CONTROL_URL = process.env.MISSION_CONTROL_URL || 'https://rmslicense.techhansatechnology.com';
          const endpoint = MISSION_CONTROL_URL.endsWith('/') ? `${MISSION_CONTROL_URL}api/activation-requests/${hardwareId}/status` : `${MISSION_CONTROL_URL}/api/activation-requests/${hardwareId}/status`;
          
          const pullRes = await fetch(endpoint);
          if (pullRes.ok) {
            const pullData = await pullRes.json();
            if (pullData.status === 'APPROVED' && pullData.licenseKey) {
              console.log(`[Telemetry] Successfully pulled approved license from Mission Control for hardware: ${hardwareId}`);
              await pool.query("INSERT INTO licenses (jwt_token, hardware_id, status) VALUES ($1, $2, 'ACTIVE')", [pullData.licenseKey, hardwareId]);
              // Re-query to seamlessly proceed with the new license
              licenseRes = await pool.query("SELECT * FROM licenses WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1");
            }
          }
        } catch (pullErr) {
          console.error('[Telemetry] Failed to pull license from Mission Control:', pullErr.message);
        }

        // If still no license after pull attempt, keep it locked
        if (licenseRes.rows.length === 0) {
          return res.json({ status: 'locked' });
        }
      }
      
      const license = licenseRes.rows[0];
      
      if (license.hardware_id !== hardwareId) {
        return res.json({ status: 'locked', error: 'Hardware mismatch' });
      }

      let decodedPayload;
      try {
        const VERIFY_KEY = process.env.MISSION_CONTROL_PUBLIC_KEY || JWT_SECRET;
        decodedPayload = jwt.verify(license.jwt_token, VERIFY_KEY);
      } catch (jwtErr) {
        if (jwtErr.name === 'TokenExpiredError') {
          await pool.query("UPDATE licenses SET status = 'EXPIRED' WHERE id = $1", [license.id]);
          return res.json({ status: 'locked', error: 'License expired' });
        }
        return res.json({ status: 'locked', error: 'Invalid license signature' });
      }

      const adminRes = await pool.query("SELECT * FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1");
      if (adminRes.rows.length > 0) {
        const user = adminRes.rows[0];
        const token = jwt.sign(
          { userId: user.id, accessLevel: user.access_level, department: user.department, hotelId: user.hotel_id, role: user.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({ 
          status: 'active', 
          token, 
          user: { id: user.id, email: user.email, role: user.role, name: user.name },
          expiresAt: decodedPayload?.exp ? decodedPayload.exp * 1000 : null
        });
      }

      res.json({ status: 'active', expiresAt: decodedPayload?.exp ? decodedPayload.exp * 1000 : null });
    } catch (err) {
      if (err.code === '42P01') {
        return res.json({ status: 'locked' }); // Treat missing tables as locked
      }
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
      
      const license = licenseRes.rows[0];
      try {
        const VERIFY_KEY = process.env.MISSION_CONTROL_PUBLIC_KEY || JWT_SECRET;
        const decodedPayload = jwt.verify(license.jwt_token, VERIFY_KEY);
        
        // Attach license data to request for downstream module gating
        req.licenseData = decodedPayload;
        next();
      } catch (jwtErr) {
        if (jwtErr.name === 'TokenExpiredError') {
          // Automatically mark as expired in DB
          await pool.query("UPDATE licenses SET status = 'EXPIRED' WHERE id = $1", [license.id]);
          return res.status(403).json({ error: 'System Locked. License has expired.' });
        }
        return res.status(403).json({ error: 'System Locked. Invalid license signature.' });
      }
    } catch (err) {
       if (err.code === '42P01') {
         return res.status(403).json({ error: 'System Locked. Schema incomplete.' });
       }
       next(err);
    }
  });
};
