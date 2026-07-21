const express = require('express');
const cors = require('cors');
const pool = require('./db/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'techkriti_grand_super_secret_key_2026';

app.use(cors());
app.use(express.json());

// Logging middleware to track incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// 1. Register a new user
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Email, password, name, and role are required' });
  }

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, passwordHash, name, role]
    );

    res.status(201).json({
      status: 'success',
      data: { user: result.rows[0] }
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// 2. Login an existing user (Fetches directly from PostgreSQL tables)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query your users table directly for the provided email string
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = result.rows[0];

    // Security Gate 1: If the email doesn't exist in your DB rows, deny access
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Security Gate 2: Extract the password hash from the row and compare it
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If both pass, sign a real security token with their DB-stored role
    const token = jwt.sign(
      { userId: user.id, role: user.role.toUpperCase() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Track active shift session and audit trail
    await pool.query('INSERT INTO staff_shifts (user_id) VALUES ($1)', [user.id]);
    await logAuditAction(user.id, 'Staff Login', `User logged into dashboard: ${user.email} (${user.role})`);

    res.json({
      status: 'success',
      token,
      user: { id: user.id, email: user.email, role: user.role.toUpperCase(), name: user.name }
    });
  } catch (err) {
    console.error('Login database connection fetch error:', err);
    res.status(500).json({ error: 'Internal server error during credential lookup' });
  }
});

// ==========================================
// ROLE SECURITY MIDDLEWARE
// ==========================================

const logAuditAction = async (userId, action, details) => {
  try {
    let name = 'System / Guest';
    let role = 'System';
    if (userId) {
      const uRes = await pool.query('SELECT name, role FROM users WHERE id = $1', [userId]);
      if (uRes.rows.length > 0) {
        name = uRes.rows[0].name;
        role = uRes.rows[0].role;
      }
    }
    await pool.query(
      'INSERT INTO system_audit_logs (user_name, user_role, action, details) VALUES ($1, $2, $3, $4)',
      [name, role, action, details]
    );
  } catch (err) {
    console.error('Audit trail logging error:', err);
  }
};

// Universal token validation bouncer
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verifiedData = jwt.verify(token, JWT_SECRET);
    req.user = verifiedData;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
};

// 3. Logout — records logout_time on the most recent active shift for this user
app.post('/api/auth/logout', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    // Update the most recent open shift (logout_time IS NULL) for this user
    await pool.query(
      `UPDATE staff_shifts SET logout_time = NOW()
       WHERE id = (
         SELECT id FROM staff_shifts
         WHERE user_id = $1 AND logout_time IS NULL
         ORDER BY login_time DESC LIMIT 1
       )`,
      [userId]
    );
    await logAuditAction(userId, 'Staff Logout', `User logged out of dashboard`);
    res.json({ status: 'success', message: 'Session closed and logout time recorded.' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Failed to record logout time' });
  }
});

// Granular permission wrapper
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied. Insufficient access clearance.' });
    }
    next();
  };
};

// Kept for backward compatibility with older components
const verifyStaffToken = [verifyToken, requireRole(['ADMIN', 'RECEPTION', 'FRONT_DESK', 'HOUSEKEEPING'])];

// ==========================================
// CORE & DASHBOARD ENDPOINTS
// ==========================================

// 1. Health Check Route
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'OK', dbTime: result.rows[0] });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// 2. GET all rooms (Public Landing Page)
app.get('/api/rooms', async (req, res) => {
  try {
    const query = `
      SELECT r.id AS room_id, r.room_number, r.status, rt.name AS room_type, 
             rt.base_price, rt.capacity_adult, rt.capacity_child
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      ORDER BY r.room_number ASC;
    `;
    const result = await pool.query(query);
    res.json({ status: 'success', results: result.rows.length, data: { rooms: result.rows } });
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch rooms' });
  }
});

// 2b. GET aggregated room classes (Public Landing Page - one card per room type)
app.get('/api/room-classes', async (req, res) => {
  try {
    const query = `
      SELECT 
        rt.id AS room_type_id,
        rt.name,
        rt.base_price,
        rt.capacity_adult,
        rt.capacity_child,
        COUNT(r.id) AS total_rooms,
        COUNT(r.id) FILTER (WHERE r.status = 'AVAILABLE') AS available_rooms
      FROM room_types rt
      LEFT JOIN rooms r ON r.room_type_id = rt.id
      GROUP BY rt.id, rt.name, rt.base_price, rt.capacity_adult, rt.capacity_child
      ORDER BY rt.base_price ASC;
    `;
    const result = await pool.query(query);
    res.json({ status: 'success', results: result.rows.length, data: { roomClasses: result.rows } });
  } catch (err) {
    console.error('Error fetching room classes:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch room classes' });
  }
});

// 3. Front Desk Operational Overview
app.get('/api/front-desk/overview', verifyToken, requireRole(['FRONT_DESK', 'ADMIN', 'RECEPTION']), async (req, res) => {
  try {
    // Aggregating live metric values from relational database tables
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM bookings WHERE DATE(check_in_date) = CURRENT_DATE AND status = 'CONFIRMED') as arrivals,
        (SELECT COUNT(*) FROM bookings WHERE DATE(check_out_date) = CURRENT_DATE AND status = 'CONFIRMED') as departures,
        (SELECT ROUND((COUNT(*)::float / (SELECT COUNT(*) FROM rooms)) * 100) FROM rooms WHERE status = 'OCCUPIED') as occupancy,
        (SELECT COUNT(*) FROM rooms WHERE status = 'AVAILABLE') as available
    `;
    const statsRes = await pool.query(statsQuery);
    const liveStats = statsRes.rows[0];

    const guestsQuery = `
      SELECT b.id, g.name, r.room_number, b.status, TO_CHAR(b.created_at, 'HH:MI AM') as time
      FROM bookings b
      JOIN guests g ON b.guest_id = g.id
      JOIN rooms r ON b.room_id = r.id
      ORDER BY b.created_at DESC LIMIT 5;
    `;
    const guestsRes = await pool.query(guestsQuery);

    res.json({
      stats: [
        { label: "Today's Arrivals", value: liveStats.arrivals || "0", icon: "KeySquare", color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Today's Departures", value: liveStats.departures || "0", icon: "ArrowRightLeft", color: "text-orange-600", bg: "bg-orange-50" },
        { label: "Current Occupancy", value: `${liveStats.occupancy || 0}%`, icon: "Users", color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Available Rooms", value: liveStats.available || "0", icon: "CheckCircle2", color: "text-zinc-600", bg: "bg-zinc-100" }
      ],
      recentGuests: guestsRes.rows
    });
  } catch (err) {
    console.error('Front desk processing fault:', err);
    res.status(500).json({ error: 'Failed to balance metrics compilation matrix' });
  }
});

// ==========================================
// EXPANDED FRONT DESK OPERATIONAL ENDPOINTS
// ==========================================

// 1. DYNAMIC GUEST LOOKUP (Now uses a catch-all active status filter)
app.get('/api/front-desk/guests/search', verifyToken, requireRole(['FRONT_DESK', 'ADMIN', 'RECEPTION']), async (req, res) => {
  const { q } = req.query;

  try {
    let query;
    let params = [];

    // LEFT JOIN ensures we get the guest even if they don't have a room.
    // The NOT IN clause ensures we catch ALL active statuses (Booked, Pending, Checked In, etc.)
    if (!q || q.trim() === '') {
      query = `
        SELECT g.id, g.name, g.email, g.phone, r.room_number, rt.name as room_type
        FROM guests g
        LEFT JOIN bookings b ON g.id = b.guest_id AND b.status NOT IN ('CHECKED_OUT', 'CANCELLED')
        LEFT JOIN rooms r ON b.room_id = r.id
        LEFT JOIN room_types rt ON r.room_type_id = rt.id
        ORDER BY g.id DESC LIMIT 10;
      `;
    } else {
      query = `
        SELECT g.id, g.name, g.email, g.phone, r.room_number, rt.name as room_type
        FROM guests g
        LEFT JOIN bookings b ON g.id = b.guest_id AND b.status NOT IN ('CHECKED_OUT', 'CANCELLED')
        LEFT JOIN rooms r ON b.room_id = r.id
        LEFT JOIN room_types rt ON r.room_type_id = rt.id
        WHERE g.name ILIKE $1 OR g.email ILIKE $1 OR g.phone ILIKE $1
        ORDER BY g.id DESC LIMIT 10;
      `;
      params = [`%${q}%`];
    }

    const result = await pool.query(query, params);
    res.json({ status: 'success', data: { guests: result.rows } });
  } catch (err) {
    console.error('Guest lookup database mismatch:', err);
    res.status(500).json({ error: 'Database search failure' });
  }
});

// 2. FETCH ACTIVE OPERATIONAL STAYS (Catch-all active filter)
app.get('/api/front-desk/stays', verifyToken, requireRole(['FRONT_DESK', 'ADMIN', 'RECEPTION']), async (req, res) => {
  try {
    const query = `
      SELECT b.id AS booking_id, b.check_in_date, b.check_out_date, b.status AS booking_status, b.total_price,
             g.name AS guest_name, g.email AS guest_email, g.phone AS guest_phone,
             r.id AS room_id, r.room_number, rt.name AS room_type
      FROM bookings b
      JOIN guests g ON b.guest_id = g.id
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE b.status NOT IN ('CHECKED_OUT', 'CANCELLED') -- Automatically catches ANY active stay
      ORDER BY b.check_in_date ASC;
    `;
    const result = await pool.query(query);
    res.json({ status: 'success', data: { stays: result.rows } });
  } catch (err) {
    console.error('Error fetching operational stays:', err);
    res.status(500).json({ error: 'Failed to access reservation states' });
  }
});
// 3. TRANSACTION ACTION: CHECK-OUT GUEST & SET ROOM TO DIRTY

app.post('/api/front-desk/bookings/:id/checkout', verifyToken, requireRole(['FRONT_DESK', 'ADMIN', 'RECEPTION']), async (req, res) => {
  console.log(`\n🛎️ ---> CHECKOUT INITIATED FOR BOOKING ID: ${req.params.id}`);

  try {
    const { id } = req.params;

    console.log("STEP 1: Fetching room_id connected to this booking...");
    const bookingRes = await pool.query('SELECT room_id FROM bookings WHERE id = $1', [id]);

    if (bookingRes.rows.length === 0) {
      console.log("❌ ERROR: Booking not found in database.");
      return res.status(404).json({ error: 'Reservation record missing' });
    }

    const roomId = bookingRes.rows[0].room_id;
    console.log(`STEP 2: Found room_id: ${roomId}. Updating booking status to CHECKED_OUT...`);
    await pool.query("UPDATE bookings SET status = 'CHECKED_OUT' WHERE id = $1", [id]);

    console.log("STEP 3: Booking updated. Updating room status to DIRTY...");
    await pool.query("UPDATE rooms SET status = 'DIRTY' WHERE id = $1", [roomId]);

    // Log audit trail
    await logAuditAction(req.user.userId, 'Process Check-Out', `Successfully checked out booking ID: ${id}`);

    console.log("✅ STEP 4: Success! Sending response to frontend.");
    res.json({ status: 'success', message: 'Guest successfully checked out.' });

  } catch (err) {
    console.error('\n🚨 *** CRITICAL BACKEND CRASH *** 🚨');
    console.error(err);
    res.status(500).json({ error: 'Checkout failed', details: err.message });
  }
});

// 4. TRANSACTION ACTION: UPDATE ROOM LOGISTIC CHANGE
app.patch('/api/front-desk/bookings/:id/change-room', verifyToken, requireRole(['FRONT_DESK', 'ADMIN', 'RECEPTION']), async (req, res) => {
  const { id } = req.params;
  const { new_room_id } = req.body;

  try {
    // Get current room to free it back to AVAILABLE
    const currentBooking = await pool.query('SELECT room_id FROM bookings WHERE id = $1', [id]);
    const oldRoomId = currentBooking.rows[0]?.room_id;

    // Swap rooms atomically
    await pool.query('UPDATE bookings SET room_id = $1 WHERE id = $2', [new_room_id, id]);
    if (oldRoomId) await pool.query("UPDATE rooms SET status = 'AVAILABLE' WHERE id = $1", [oldRoomId]);
    await pool.query("UPDATE rooms SET status = 'OCCUPIED' WHERE id = $1", [new_room_id]);

    res.json({ status: 'success', message: 'Room allocation shifted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to modify database room structural parameters' });
  }
});
// 5. GET AVAILABLE ROOMS FOR MANUAL BOOKING
app.get('/api/front-desk/rooms/available', verifyToken, requireRole(['FRONT_DESK', 'ADMIN']), async (req, res) => {
  try {
    const query = `
      SELECT r.id, r.room_number, rt.name as room_type, rt.base_price 
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.status = 'AVAILABLE'
      ORDER BY r.room_number ASC;
    `;
    const result = await pool.query(query);
    res.json({ status: 'success', data: { rooms: result.rows } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch available rooms' });
  }
});

// Helper function to push inventory changes to your Channel Admin
const pushInventoryUpdateToOTA = async (roomTypeId, dateFrom, dateTo) => {
  try {
    // 1. Calculate how many rooms of this type are left
    const countRes = await pool.query(`
      SELECT COUNT(id) as remaining FROM rooms 
      WHERE room_type_id = $1 AND status = 'AVAILABLE'
    `, [roomTypeId]);

    const remainingInventory = countRes.rows[0].remaining;

    // 2. Make an HTTP request to your Channel Admin (e.g., Channex, SiteMinder)
    /* await fetch('https://api.yourchannelAdmin.com/v1/inventory', {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${process.env.CHANNEL_Admin_API_KEY}\` },
      body: JSON.stringify({
        room_type_id: roomTypeId,
        start_date: dateFrom,
        end_date: dateTo,
        available_count: remainingInventory
      })
    });
    */
    console.log(`📡 [OTA SYNC] Pushed new inventory count (${remainingInventory}) to Channel Admin for RoomType ${roomTypeId}`);
  } catch (err) {
    console.error('Failed to sync inventory to OTA:', err);
  }
};

// 6. CREATE GUEST AND BOOKING ATOMICALLY
app.post('/api/front-desk/bookings/manual', verifyToken, requireRole(['FRONT_DESK', 'ADMIN']), async (req, res) => {
  const { guest_name, guest_email, guest_phone, guest_id_number, room_id, check_in_date, check_out_date, total_price } = req.body;

  try {
    // 1. Insert Guest or get existing
    let guestRes = await pool.query('SELECT id FROM guests WHERE email = $1', [guest_email.toLowerCase().trim()]);
    let guestId;

    if (guestRes.rows.length === 0) {
      const newGuest = await pool.query(
        'INSERT INTO guests (name, email, phone, id_number) VALUES ($1, $2, $3, $4) RETURNING id',
        [guest_name, guest_email.toLowerCase().trim(), guest_phone, guest_id_number || null]
      );
      guestId = newGuest.rows[0].id;
    } else {
      guestId = guestRes.rows[0].id;
      // Update ID number if provided and not present
      if (guest_id_number) {
        await pool.query('UPDATE guests SET id_number = $1 WHERE id = $2 AND id_number IS NULL', [guest_id_number, guestId]);
      }
    }

    // 2. Insert Booking
    await pool.query(
      `INSERT INTO bookings (guest_id, room_id, check_in_date, check_out_date, total_price, status) 
       VALUES ($1, $2, $3, $4, $5, 'CHECKED_IN')`,
      [guestId, room_id, check_in_date, check_out_date, total_price]
    );

    // 3. Set Room to Occupied
    await pool.query("UPDATE rooms SET status = 'OCCUPIED' WHERE id = $1", [room_id]);

    // 4. (NEW) Trigger background OTA Sync!
    // We don't await this so it doesn't slow down the receptionist's UI
    const roomTypeRes = await pool.query('SELECT room_type_id FROM rooms WHERE id = $1', [room_id]);
    pushInventoryUpdateToOTA(roomTypeRes.rows[0].room_type_id, check_in_date, check_out_date);

    res.status(201).json({ status: 'success', message: 'Walk-in booking created and checked in!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Reservation booking transaction failed' });
  }
});

// 7. TRANSACTION ACTION: EXTEND STAY & RECALCULATE PRICE
app.patch('/api/front-desk/bookings/:id/extend', verifyToken, requireRole(['FRONT_DESK', 'ADMIN', 'RECEPTION']), async (req, res) => {
  const { id } = req.params;
  const { new_check_out_date } = req.body;

  try {
    // 1. Get current booking details to recalculate the price
    const bookingRes = await pool.query('SELECT check_in_date, room_id FROM bookings WHERE id = $1', [id]);
    if (bookingRes.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    const { check_in_date, room_id } = bookingRes.rows[0];

    // 2. Get the room's base price from the database
    const roomRes = await pool.query(
      'SELECT rt.base_price FROM rooms r JOIN room_types rt ON r.room_type_id = rt.id WHERE r.id = $1',
      [room_id]
    );
    const basePrice = roomRes.rows[0].base_price;

    // 3. Calculate the new total days and price
    const days = Math.ceil((new Date(new_check_out_date) - new Date(check_in_date)) / (1000 * 60 * 60 * 24));
    if (days <= 0) return res.status(400).json({ error: 'Checkout date must be after check-in date' });
    const newTotal = days * basePrice;

    // 4. Atomically update the ledger
    await pool.query(
      'UPDATE bookings SET check_out_date = $1, total_price = $2 WHERE id = $3',
      [new_check_out_date, newTotal, id]
    );

    res.json({ status: 'success', message: 'Stay extended successfully', data: { new_total: newTotal, nights: days } });
  } catch (err) {
    console.error('Extension error:', err);
    res.status(500).json({ error: 'Failed to process stay extension' });
  }
});

// 8. TRANSACTION ACTION: CHECK-IN GUEST & SET ROOM TO OCCUPIED
app.post('/api/front-desk/bookings/:id/checkin', verifyToken, requireRole(['FRONT_DESK', 'ADMIN', 'RECEPTION']), async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Validate the booking exists and is in CONFIRMED status
    const bookingRes = await pool.query('SELECT status, room_id FROM bookings WHERE id = $1', [id]);
    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const { status, room_id } = bookingRes.rows[0];
    if (status !== 'CONFIRMED') {
      return res.status(400).json({ error: `Cannot check in a booking with status: ${status}. Only CONFIRMED bookings can be checked in.` });
    }

    // 2. Update booking status to CHECKED_IN
    await pool.query("UPDATE bookings SET status = 'CHECKED_IN' WHERE id = $1", [id]);

    // 3. Set room to OCCUPIED
    await pool.query("UPDATE rooms SET status = 'OCCUPIED' WHERE id = $1", [room_id]);

    // Log audit trail
    await logAuditAction(req.user.userId, 'Process Check-In', `Successfully checked in booking ID: ${id}`);

    res.json({ status: 'success', message: 'Guest checked in successfully. Room is now occupied.' });
  } catch (err) {
    console.error('Check-in error:', err);
    res.status(500).json({ error: 'Failed to process check-in', details: err.message });
  }
});

// 9. FETCH ALL BOOKINGS (Active + Inactive History)
app.get('/api/front-desk/bookings/all', verifyToken, requireRole(['FRONT_DESK', 'ADMIN', 'RECEPTION']), async (req, res) => {
  const { status: statusFilter } = req.query;

  try {
    let query = `
      SELECT b.id AS booking_id, b.check_in_date, b.check_out_date, b.status AS booking_status, 
             b.total_price, b.created_at,
             g.id AS guest_id, g.name AS guest_name, g.email AS guest_email, g.phone AS guest_phone,
             r.id AS room_id, r.room_number, rt.name AS room_type
      FROM bookings b
      JOIN guests g ON b.guest_id = g.id
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
    `;
    const params = [];

    if (statusFilter) {
      query += ` WHERE b.status = $1`;
      params.push(statusFilter.toUpperCase());
    }

    query += ` ORDER BY b.created_at DESC LIMIT 100`;

    const result = await pool.query(query, params);
    res.json({ status: 'success', data: { bookings: result.rows } });
  } catch (err) {
    console.error('Fetch all bookings error:', err);
    res.status(500).json({ error: 'Failed to retrieve booking history' });
  }
});

// ==========================================
// HOUSEKEEPING OPERATIONAL ENDPOINTS
// ==========================================

// 1. KANBAN BOARD — Fetch rooms grouped by housekeeping status
app.get('/api/housekeeping/board', verifyToken, requireRole(['HOUSEKEEPING', 'ADMIN']), async (req, res) => {
  try {
    const query = `
      SELECT r.id, r.room_number, r.status, rt.name as room_type, rt.base_price
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.status IN ('DIRTY', 'CLEANING', 'INSPECTING')
      ORDER BY 
        CASE r.status WHEN 'DIRTY' THEN 1 WHEN 'CLEANING' THEN 2 WHEN 'INSPECTING' THEN 3 END,
        r.room_number ASC
    `;
    const result = await pool.query(query);

    const board = {
      dirty: result.rows.filter(r => r.status === 'DIRTY'),
      cleaning: result.rows.filter(r => r.status === 'CLEANING'),
      inspecting: result.rows.filter(r => r.status === 'INSPECTING')
    };

    // Stats
    const completedTodayRes = await pool.query(
      "SELECT COUNT(*)::int as count FROM rooms WHERE status = 'AVAILABLE'"
    );

    res.json({
      status: 'success',
      data: {
        board,
        stats: {
          dirty: board.dirty.length,
          cleaning: board.cleaning.length,
          inspecting: board.inspecting.length,
          available: completedTodayRes.rows[0].count
        }
      }
    });
  } catch (err) {
    console.error('Housekeeping board error:', err);
    res.status(500).json({ error: 'Failed to load housekeeping board' });
  }
});

// Keep legacy endpoint for backward compat
app.get('/api/housekeeping/tasks', verifyToken, requireRole(['HOUSEKEEPING', 'ADMIN']), async (req, res) => {
  try {
    const cleanRooms = await pool.query("SELECT room_number as room, 'Checkout Cleaning' as type, 'High' as priority, 'Pending' as status FROM rooms WHERE status = 'DIRTY'");
    const inProgressRooms = await pool.query("SELECT room_number as room, 'Stayover Service' as type, 'Medium' as priority, 'In Progress' as status FROM rooms WHERE status = 'CLEANING'");
    res.json({ cleaning: [...cleanRooms.rows, ...inProgressRooms.rows], inspections: [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to access housekeeping data.' });
  }
});

// 2. START CLEANING — Transition: DIRTY → CLEANING
app.patch('/api/housekeeping/rooms/:id/start-cleaning', verifyToken, requireRole(['HOUSEKEEPING', 'ADMIN']), async (req, res) => {
  const { id } = req.params;
  try {
    const check = await pool.query('SELECT status FROM rooms WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    if (check.rows[0].status !== 'DIRTY') {
      return res.status(400).json({ error: `Room is ${check.rows[0].status}, not DIRTY. Cannot start cleaning.` });
    }
    await pool.query("UPDATE rooms SET status = 'CLEANING' WHERE id = $1", [id]);
    res.json({ status: 'success', message: 'Cleaning started. Room status is now CLEANING.' });
  } catch (err) {
    console.error('Start cleaning error:', err);
    res.status(500).json({ error: 'Failed to start cleaning' });
  }
});

// 3. REQUEST INSPECTION — Transition: CLEANING → INSPECTING
app.patch('/api/housekeeping/rooms/:id/request-inspection', verifyToken, requireRole(['HOUSEKEEPING', 'ADMIN']), async (req, res) => {
  const { id } = req.params;
  try {
    const check = await pool.query('SELECT status FROM rooms WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    if (check.rows[0].status !== 'CLEANING') {
      return res.status(400).json({ error: `Room is ${check.rows[0].status}, not CLEANING. Cannot request inspection.` });
    }
    await pool.query("UPDATE rooms SET status = 'INSPECTING' WHERE id = $1", [id]);
    res.json({ status: 'success', message: 'Inspection requested. Room is now awaiting supervisor approval.' });
  } catch (err) {
    console.error('Request inspection error:', err);
    res.status(500).json({ error: 'Failed to request inspection' });
  }
});

// 4. APPROVE INSPECTION — Transition: INSPECTING → AVAILABLE
app.patch('/api/housekeeping/rooms/:id/approve-inspection', verifyToken, requireRole(['HOUSEKEEPING', 'ADMIN']), async (req, res) => {
  const { id } = req.params;
  try {
    const check = await pool.query('SELECT status FROM rooms WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    if (check.rows[0].status !== 'INSPECTING') {
      return res.status(400).json({ error: `Room is ${check.rows[0].status}, not INSPECTING. Cannot approve.` });
    }
    await pool.query("UPDATE rooms SET status = 'AVAILABLE' WHERE id = $1", [id]);
    res.json({ status: 'success', message: 'Inspection approved! Room is now AVAILABLE for booking.' });
  } catch (err) {
    console.error('Approve inspection error:', err);
    res.status(500).json({ error: 'Failed to approve inspection' });
  }
});

// 5. LOG AMENITY EXPENSES — Insert restocking items into room_expenses
app.post('/api/housekeeping/rooms/:id/expenses', verifyToken, requireRole(['HOUSEKEEPING', 'ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { items } = req.body; // Array of { item_name, quantity, unit_cost }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  try {
    await pool.query('BEGIN');
    for (const item of items) {
      await pool.query(
        'INSERT INTO room_expenses (room_id, item_name, quantity, unit_cost, logged_by) VALUES ($1, $2, $3, $4, $5)',
        [id, item.item_name, item.quantity || 1, item.unit_cost || 0, req.user.userId]
      );
    }
    await pool.query('COMMIT');
    res.json({ status: 'success', message: `${items.length} expense(s) logged for room.` });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Log expenses error:', err);
    res.status(500).json({ error: 'Failed to log amenity expenses' });
  }
});

// 6. REPORT DAMAGE — Engineering Hot-Link (Maintenance Ticket + Room → MAINTENANCE)
app.post('/api/housekeeping/rooms/:id/report-damage', verifyToken, requireRole(['HOUSEKEEPING', 'ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { issue, priority } = req.body;

  if (!issue) return res.status(400).json({ error: 'Issue description is required' });

  try {
    await pool.query('BEGIN');

    // 1. Create maintenance ticket
    await pool.query(
      'INSERT INTO maintenance_tickets (room_id, issue, priority, status, assigned_to) VALUES ($1, $2, $3, $4, $5)',
      [id, issue, priority || 'High', 'Pending', 'Unassigned']
    );

    // 2. Flip room to MAINTENANCE and block it
    await pool.query(
      "UPDATE rooms SET status = 'MAINTENANCE', room_blocked = true WHERE id = $1",
      [id]
    );

    await pool.query('COMMIT');
    res.json({ status: 'success', message: 'Damage reported. Room sent to Engineering and blocked from bookings.' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Report damage error:', err);
    res.status(500).json({ error: 'Failed to report damage' });
  }
});

// 5. Finance & Revenue Reconciliation Logs — real-time overview for the Finance Dashboard
app.get('/api/finance/overview', verifyToken, requireRole(['FINANCE', 'ADMIN']), async (req, res) => {
  try {
    // 1. Hotel revenue: today, yesterday (for trend), and month-to-date
    const revenueRes = await pool.query(`
      SELECT
        COALESCE(SUM(total_price) FILTER (WHERE created_at::date = CURRENT_DATE), 0) AS today,
        COALESCE(SUM(total_price) FILTER (WHERE created_at::date = CURRENT_DATE - INTERVAL '1 day'), 0) AS yesterday,
        COALESCE(SUM(total_price) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)), 0) AS month_to_date
      FROM bookings
      WHERE status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
    `);

    // 2. Travel desk revenue, month-to-date (rolled into overall hotel finance)
    const travelRevenueRes = await pool.query(`
      SELECT COALESCE(SUM(amount) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)), 0) AS month_to_date
      FROM travel_bookings WHERE booking_status != 'Cancelled'
    `);

    // 3. Pending receivables — unpaid OTA commissions + pending/partial travel payments
    const receivablesRes = await pool.query(`
      SELECT
        COALESCE((SELECT SUM(amount) FROM ledger_transactions WHERE status = 'PENDING_PAYMENT'), 0) AS ledger_pending,
        COALESCE((SELECT COUNT(*) FROM ledger_transactions WHERE status = 'PENDING_PAYMENT'), 0) AS ledger_pending_count,
        COALESCE((SELECT SUM(amount) FROM travel_bookings WHERE payment_status IN ('Pending','Partial')), 0) AS travel_pending,
        COALESCE((SELECT COUNT(*) FROM travel_bookings WHERE payment_status IN ('Pending','Partial')), 0) AS travel_pending_count
    `);

    // 4. Today's logged expenses (housekeeping amenity restocking — real cash-outflow ledger)
    const expensesRes = await pool.query(`
      SELECT COALESCE(SUM(quantity * unit_cost), 0) AS today
      FROM room_expenses WHERE created_at::date = CURRENT_DATE
    `);

    // 5. 7-day revenue trend, hotel bookings + travel bookings combined
    const trendRes = await pool.query(`
      SELECT to_char(d::date, 'Dy') AS label, d::date AS day,
        COALESCE(SUM(b.total_price), 0) + COALESCE(SUM(tb.amount), 0) AS value
      FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') d
      LEFT JOIN bookings b ON b.created_at::date = d::date AND b.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
      LEFT JOIN travel_bookings tb ON tb.created_at::date = d::date AND tb.booking_status != 'Cancelled'
      GROUP BY d
      ORDER BY d;
    `);

    // 6. Revenue split by booking channel/source (last 30 days) — powers the donut chart
    const channelRes = await pool.query(`
      SELECT COALESCE(source, 'DIRECT') AS label, COALESCE(SUM(total_price), 0) AS value
      FROM bookings
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' AND status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
      GROUP BY source
      ORDER BY value DESC
    `);

    // 7. Recent transactions feed — merges hotel bookings and travel desk bookings
    const recentRes = await pool.query(`
      (SELECT b.id::text AS id, g.name AS guest, r.room_number AS room, b.total_price AS amount,
              b.source AS method, b.status::text AS status, b.created_at
       FROM bookings b
       LEFT JOIN guests g ON g.id = b.guest_id
       LEFT JOIN rooms r ON r.id = b.room_id
       ORDER BY b.created_at DESC LIMIT 6)
      UNION ALL
      (SELECT tb.id::text AS id, tb.guest_name AS guest, tp.name AS room, tb.amount AS amount,
              'Travel Desk' AS method, tb.payment_status AS status, tb.created_at
       FROM travel_bookings tb
       LEFT JOIN travel_packages tp ON tp.id = tb.package_id
       ORDER BY tb.created_at DESC LIMIT 6)
      ORDER BY created_at DESC LIMIT 8;
    `);

    const today = Number(revenueRes.rows[0].today);
    const yesterday = Number(revenueRes.rows[0].yesterday);
    const monthToDate = Number(revenueRes.rows[0].month_to_date) + Number(travelRevenueRes.rows[0].month_to_date);
    const todayRevenueChangePct = yesterday > 0 ? Number((((today - yesterday) / yesterday) * 100).toFixed(1)) : null;

    const ledgerPending = Number(receivablesRes.rows[0].ledger_pending);
    const travelPending = Number(receivablesRes.rows[0].travel_pending);
    const pendingReceivablesCount = Number(receivablesRes.rows[0].ledger_pending_count) + Number(receivablesRes.rows[0].travel_pending_count);

    res.json({
      status: 'success',
      data: {
        todayRevenue: today,
        todayRevenueChangePct,
        monthToDateRevenue: monthToDate,
        pendingReceivables: ledgerPending + travelPending,
        pendingReceivablesCount,
        estimatedGstMTD: Math.round(monthToDate * 0.18),
        todayExpenses: Number(expensesRes.rows[0].today),
        revenueTrend: trendRes.rows.map(r => ({
          label: r.label,
          value: Number(r.value),
          isToday: r.day.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10),
        })),
        channelSplit: channelRes.rows.map(r => ({ label: r.label, value: Number(r.value) })),
        recentTransactions: recentRes.rows.map(r => ({
          id: r.id,
          guest: r.guest || 'Guest',
          room: r.room || '—',
          amount: Number(r.amount),
          method: r.method,
          status: r.status,
          date: r.created_at,
        })),
      }
    });
  } catch (err) {
    console.error('Finance overview error:', err);
    res.status(500).json({ error: 'Unable to load finance overview' });
  }
});


// ==========================================
// TRAVEL DESK ENDPOINTS
// ==========================================
const requireTravel = requireRole(['TRAVEL', 'ADMIN']);

// 1. Overview: KPIs, 7-day booking trend, package popularity split, recent bookings
app.get('/api/travel/overview', verifyToken, requireTravel, async (req, res) => {
  try {
    const kpiRes = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE booking_status != 'Cancelled') AS total_bookings,
        COALESCE(SUM(amount) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE) AND booking_status != 'Cancelled'), 0) AS revenue_this_month,
        COUNT(*) FILTER (WHERE travel_date >= CURRENT_DATE AND booking_status = 'Confirmed') AS upcoming_departures,
        COALESCE(SUM(amount) FILTER (WHERE payment_status IN ('Pending', 'Partial')), 0) AS pending_payments_value,
        COUNT(*) FILTER (WHERE payment_status IN ('Pending', 'Partial')) AS pending_payments_count
      FROM travel_bookings;
    `);

    const trendRes = await pool.query(`
      SELECT to_char(d::date, 'Dy') AS label, d::date AS day,
        COALESCE(SUM(tb.amount), 0) AS value
      FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') d
      LEFT JOIN travel_bookings tb ON tb.created_at::date = d::date AND tb.booking_status != 'Cancelled'
      GROUP BY d
      ORDER BY d;
    `);

    const popularityRes = await pool.query(`
      SELECT tp.name AS label, COUNT(tb.id) AS bookings, COALESCE(SUM(tb.amount), 0) AS value
      FROM travel_packages tp
      LEFT JOIN travel_bookings tb ON tb.package_id = tp.id AND tb.booking_status != 'Cancelled'
      GROUP BY tp.name
      ORDER BY value DESC
      LIMIT 6;
    `);

    const recentRes = await pool.query(`
      SELECT tb.id, tb.guest_name, tp.name AS package_name, tb.travel_date, tb.amount, tb.payment_status, tb.booking_status, tb.created_at
      FROM travel_bookings tb
      LEFT JOIN travel_packages tp ON tp.id = tb.package_id
      ORDER BY tb.created_at DESC
      LIMIT 6;
    `);

    res.json({
      status: 'success',
      data: {
        kpis: kpiRes.rows[0],
        trend: trendRes.rows,
        popularity: popularityRes.rows,
        recentBookings: recentRes.rows,
      }
    });
  } catch (err) {
    console.error('Travel overview error:', err);
    res.status(500).json({ error: 'Unable to load travel desk overview' });
  }
});

// 2. Package catalog — list with computed bookings/revenue
app.get('/api/travel/packages', verifyToken, requireTravel, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tp.*, COUNT(tb.id) FILTER (WHERE tb.booking_status != 'Cancelled') AS bookings_count,
        COALESCE(SUM(tb.amount) FILTER (WHERE tb.booking_status != 'Cancelled'), 0) AS revenue
      FROM travel_packages tp
      LEFT JOIN travel_bookings tb ON tb.package_id = tp.id
      GROUP BY tp.id
      ORDER BY tp.created_at DESC;
    `);
    res.json({ status: 'success', results: result.rows.length, data: { packages: result.rows } });
  } catch (err) {
    console.error('Travel packages fetch error:', err);
    res.status(500).json({ error: 'Unable to load travel package catalog' });
  }
});

// 3. Create a new package
app.post('/api/travel/packages', verifyToken, requireTravel, async (req, res) => {
  const { name, destination, description, category, price, duration_days, max_travelers } = req.body;
  if (!name || !destination || !price) {
    return res.status(400).json({ error: 'Name, destination and price are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO travel_packages (name, destination, description, category, price, duration_days, max_travelers)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, destination, description || '', category || 'Leisure', price, duration_days || 3, max_travelers || 4]
    );
    await logAuditAction(req.user.userId, 'Create Travel Package', `Added new package: ${name} (${destination})`);
    res.status(201).json({ status: 'success', data: { package: result.rows[0] } });
  } catch (err) {
    console.error('Create travel package error:', err);
    res.status(500).json({ error: 'Unable to create travel package' });
  }
});

// 4. Toggle a package's active status
app.patch('/api/travel/packages/:id/toggle-active', verifyToken, requireTravel, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE travel_packages SET is_active = NOT is_active WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Package not found' });
    await logAuditAction(req.user.userId, 'Toggle Package Status', `${result.rows[0].name} set to ${result.rows[0].is_active ? 'Active' : 'Inactive'}`);
    res.json({ status: 'success', data: { package: result.rows[0] } });
  } catch (err) {
    res.status(500).json({ error: 'Unable to update package status' });
  }
});

// 5. Bookings / purchases — list with filters
app.get('/api/travel/bookings', verifyToken, requireTravel, async (req, res) => {
  const { status, search } = req.query;
  try {
    const conditions = [];
    const params = [];
    if (status && status !== 'All') {
      params.push(status);
      conditions.push(`tb.booking_status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      conditions.push(`(LOWER(tb.guest_name) LIKE $${params.length} OR LOWER(tp.name) LIKE $${params.length} OR LOWER(tb.guest_email) LIKE $${params.length})`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(`
      SELECT tb.*, tp.name AS package_name, tp.destination
      FROM travel_bookings tb
      LEFT JOIN travel_packages tp ON tp.id = tb.package_id
      ${whereClause}
      ORDER BY tb.created_at DESC;
    `, params);
    res.json({ status: 'success', results: result.rows.length, data: { bookings: result.rows } });
  } catch (err) {
    console.error('Travel bookings fetch error:', err);
    res.status(500).json({ error: 'Unable to load travel bookings' });
  }
});

// 6. Create a new booking (purchase) against a package
app.post('/api/travel/bookings', verifyToken, requireTravel, async (req, res) => {
  const { package_id, guest_name, guest_email, guest_phone, travelers_count, travel_date, payment_status } = req.body;
  if (!package_id || !guest_name || !travel_date) {
    return res.status(400).json({ error: 'Package, guest name and travel date are required' });
  }
  try {
    const pkgRes = await pool.query('SELECT price FROM travel_packages WHERE id = $1', [package_id]);
    if (pkgRes.rows.length === 0) return res.status(404).json({ error: 'Selected package not found' });

    const amount = Number(pkgRes.rows[0].price) * Number(travelers_count || 1);
    const result = await pool.query(
      `INSERT INTO travel_bookings (package_id, guest_name, guest_email, guest_phone, travelers_count, travel_date, amount, payment_status, booked_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [package_id, guest_name, guest_email || null, guest_phone || null, travelers_count || 1, travel_date, amount, payment_status || 'Pending', req.user.userId]
    );
    await logAuditAction(req.user.userId, 'New Travel Booking', `Booked for ${guest_name}: ₹${amount}`);
    res.status(201).json({ status: 'success', data: { booking: result.rows[0] } });
  } catch (err) {
    console.error('Create travel booking error:', err);
    res.status(500).json({ error: 'Unable to create travel booking' });
  }
});

// 7. Update a booking's status (payment or booking lifecycle)
app.patch('/api/travel/bookings/:id/status', verifyToken, requireTravel, async (req, res) => {
  const { payment_status, booking_status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE travel_bookings SET
         payment_status = COALESCE($1, payment_status),
         booking_status = COALESCE($2, booking_status)
       WHERE id = $3 RETURNING *`,
      [payment_status || null, booking_status || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    await logAuditAction(req.user.userId, 'Update Travel Booking', `Booking ${req.params.id} → payment: ${result.rows[0].payment_status}, status: ${result.rows[0].booking_status}`);
    res.json({ status: 'success', data: { booking: result.rows[0] } });
  } catch (err) {
    res.status(500).json({ error: 'Unable to update booking' });
  }
});

// 8. Customers — aggregated purchase history per guest
app.get('/api/travel/customers', verifyToken, requireTravel, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT guest_name, guest_email, guest_phone,
        COUNT(*) AS total_bookings,
        COALESCE(SUM(amount), 0) AS total_spent,
        MAX(travel_date) AS last_travel_date
      FROM travel_bookings
      GROUP BY guest_name, guest_email, guest_phone
      ORDER BY total_spent DESC;
    `);
    res.json({ status: 'success', results: result.rows.length, data: { customers: result.rows } });
  } catch (err) {
    console.error('Travel customers fetch error:', err);
    res.status(500).json({ error: 'Unable to load travel customers' });
  }
});


// ==========================================
// Admin (ADMIN) ADMINISTRATIVE ENDPOINTS
// ==========================================

// 1. COMPREHENSIVE LIVE OPERATIONS DASHBOARD ENDPOINT
app.get('/api/Admin/live-operations', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    // === KPIs ===
    const totalRoomsRes = await pool.query("SELECT COUNT(*) FROM rooms;");
    const occupiedRoomsRes = await pool.query("SELECT COUNT(*) FROM rooms WHERE status = 'OCCUPIED';");
    const maintenanceRoomsRes = await pool.query("SELECT COUNT(*) FROM rooms WHERE status = 'MAINTENANCE';");
    const todaysRevenueRes = await pool.query(
      "SELECT COALESCE(SUM(CAST(total_price AS NUMERIC)), 0) as total FROM bookings WHERE DATE(created_at) = CURRENT_DATE AND status NOT IN ('CANCELLED')"
    );

    const totalRooms = parseInt(totalRoomsRes.rows[0].count) || 0;
    const occupiedRooms = parseInt(occupiedRoomsRes.rows[0].count) || 0;
    const maintenanceRooms = parseInt(maintenanceRoomsRes.rows[0].count) || 0;
    const salableRooms = totalRooms - maintenanceRooms;
    const occupancyRate = salableRooms > 0 ? Math.round((occupiedRooms / salableRooms) * 100) : 0;
    const todaysRevenue = parseFloat(todaysRevenueRes.rows[0].total) || 0;

    // === ROOM STATUS DISTRIBUTION (Donut Chart) ===
    const statusDistRes = await pool.query(
      "SELECT status, COUNT(*)::int as count FROM rooms GROUP BY status ORDER BY status"
    );
    const roomStatusDistribution = {};
    statusDistRes.rows.forEach(r => { roomStatusDistribution[r.status] = r.count; });

    // === 7-DAY OCCUPANCY TREND (3 days back + today + 3 days forward) ===
    const occupancyTrendRes = await pool.query(`
      SELECT d::date as date,
        COUNT(b.id)::int as occupied_count
      FROM generate_series(CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '3 days', '1 day') d
      LEFT JOIN bookings b ON b.check_in_date <= d::date AND b.check_out_date > d::date 
        AND b.status IN ('CONFIRMED', 'CHECKED_IN')
      GROUP BY d::date
      ORDER BY d::date ASC
    `);
    const occupancyTrend = occupancyTrendRes.rows.map(r => ({
      date: r.date,
      occupied: r.occupied_count,
      total: totalRooms
    }));

    // === ARRIVALS & DEPARTURES TODAY ===
    const arrivalsRes = await pool.query(
      "SELECT COUNT(*)::int as count FROM bookings WHERE check_in_date = CURRENT_DATE AND status IN ('CONFIRMED', 'CHECKED_IN')"
    );
    const departuresRes = await pool.query(
      "SELECT COUNT(*)::int as count FROM bookings WHERE check_out_date = CURRENT_DATE AND status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')"
    );

    // === DEPARTMENTAL SNAPSHOTS ===

    // Front Desk: Pending check-ins (confirmed but not yet checked in, arriving today)
    const pendingCheckinsRes = await pool.query(`
      SELECT b.id, g.name as guest_name, r.room_number, rt.name as room_type, b.check_in_date
      FROM bookings b
      JOIN guests g ON b.guest_id = g.id
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE b.status = 'CONFIRMED' AND b.check_in_date <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date
      ORDER BY b.check_in_date ASC LIMIT 8
    `);

    // Front Desk: Overstay warnings (checked in but past checkout date)
    const overstaysRes = await pool.query(`
      SELECT b.id, g.name as guest_name, r.room_number, b.check_out_date
      FROM bookings b
      JOIN guests g ON b.guest_id = g.id
      JOIN rooms r ON b.room_id = r.id
      WHERE b.status = 'CHECKED_IN' AND (
        b.check_out_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date 
        OR (
          b.check_out_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date 
          AND EXTRACT(HOUR FROM CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') >= 11
        )
      )
      ORDER BY b.check_out_date ASC LIMIT 5
    `);

    // Housekeeping: Dirty rooms (prioritize premium types)
    const dirtyRoomsRes = await pool.query(`
      SELECT r.room_number, rt.name as room_type, rt.base_price
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.status IN ('DIRTY', 'CLEANING')
      ORDER BY rt.base_price DESC LIMIT 6
    `);

    // Engineering: High priority maintenance (from maintenance_tickets table if it exists, fallback to rooms)
    let highPriorityTickets = [];
    try {
      const ticketsRes = await pool.query(`
        SELECT m.id, m.issue, m.priority, m.status, m.assigned_to, r.room_number
        FROM maintenance_tickets m
        JOIN rooms r ON m.room_id = r.id
        WHERE m.status != 'Resolved'
        ORDER BY 
          CASE m.priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END ASC
        LIMIT 5
      `);
      highPriorityTickets = ticketsRes.rows;
    } catch (e) {
      // maintenance_tickets table may not exist yet
      const mRooms = await pool.query(
        "SELECT id, room_number, 'System Maintenance' as issue, 'Medium' as priority, 'Pending' as status, 'Unassigned' as assigned_to FROM rooms WHERE status = 'MAINTENANCE' LIMIT 5"
      );
      highPriorityTickets = mRooms.rows;
    }

    // === ACTIVITY FEED (Recent booking transactions) ===
    const activityRes = await pool.query(`
      SELECT b.id, b.status as action, b.created_at, b.check_in_date, b.check_out_date,
             g.name as guest_name, r.room_number, rt.name as room_type
      FROM bookings b
      JOIN guests g ON b.guest_id = g.id
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      ORDER BY b.created_at DESC LIMIT 15
    `);

    res.json({
      status: 'success',
      data: {
        kpis: {
          occupancyRate,
          activeStays: occupiedRooms,
          outOfOrderAssets: maintenanceRooms,
          todaysRevenue,
          totalRooms,
          salableRooms
        },
        roomStatusDistribution,
        occupancyTrend,
        arrivalsToday: arrivalsRes.rows[0].count,
        departuresToday: departuresRes.rows[0].count,
        departmental: {
          pendingCheckins: pendingCheckinsRes.rows,
          overstays: overstaysRes.rows,
          dirtyRooms: dirtyRoomsRes.rows,
          highPriorityTickets
        },
        activityFeed: activityRes.rows
      }
    });
  } catch (err) {
    console.error('Live operations engine failure:', err);
    res.status(500).json({ error: 'Failed to compile live operations data' });
  }
});

// 2. GET ALL ROOMS CONFIGURATION LIST FOR ADMIN MANAGEMENT
// FETCH ALL ROOMS FOR INVENTORY GRID (Updated for Hierarchical Grouping)
app.get('/api/Admin/rooms', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id, r.room_number, r.status, r.room_blocked, 
        r.room_type_id, rt.name as room_type, rt.base_price
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      ORDER BY r.room_number ASC;
    `;
    const result = await pool.query(query);
    res.json({ status: 'success', data: { rooms: result.rows } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to pull room architectural settings' });
  }
});

// 3. ACTION TRIGGER: TOGGLE ADMINISTRATIVE ROOM BLOCK (Out of Order)
app.post('/api/Admin/rooms/:id/toggle-block', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Check current status
    const roomCheck = await pool.query('SELECT room_blocked, status FROM rooms WHERE id = $1', [id]);
    if (roomCheck.rows.length === 0) return res.status(404).json({ error: 'Room not found' });

    const currentBlockState = roomCheck.rows[0].room_blocked;
    const newBlockState = !currentBlockState;
    const newRoomStatus = newBlockState ? 'MAINTENANCE' : 'AVAILABLE';

    // 2. Atomically alter the operational state of the room asset
    await pool.query(
      'UPDATE rooms SET room_blocked = $1, status = $2 WHERE id = $3',
      [newBlockState, newRoomStatus, id]
    );

    res.json({
      status: 'success',
      message: `Room status updated successfully to ${newRoomStatus}`,
      data: { room_blocked: newBlockState, status: newRoomStatus }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process structural room state alter mutation' });
  }
});

// 4. GET ROOM TYPES (For the Add Room Dropdown)
app.get('/api/Admin/room-types', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, base_price FROM room_types ORDER BY base_price ASC');
    res.json({ status: 'success', data: { roomTypes: result.rows } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch room types' });
  }
});

// 5. ADD NEW ROOM TO INVENTORY
app.post('/api/Admin/rooms', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  const { room_number, room_type_id } = req.body;
  try {
    // Check if room number already exists
    const check = await pool.query('SELECT id FROM rooms WHERE room_number = $1', [room_number]);
    if (check.rows.length > 0) return res.status(400).json({ error: 'Room number already exists in inventory.' });

    await pool.query(
      "INSERT INTO rooms (room_number, room_type_id, status, room_blocked) VALUES ($1, $2, 'AVAILABLE', false)",
      [room_number, room_type_id]
    );
    res.json({ status: 'success', message: 'Room added to inventory.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add room to database.' });
  }
});

// 6. REMOVE ROOM FROM INVENTORY (Force Delete connected records)
app.delete('/api/Admin/rooms/:id', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  const { id } = req.params;

  try {
    // Step 1: Delete any existing bookings attached to this room so the database doesn't block us
    await pool.query('DELETE FROM bookings WHERE room_id = $1', [id]);

    // Step 2: Now that the room is cleanly detached, delete the room itself
    await pool.query('DELETE FROM rooms WHERE id = $1', [id]);

    res.json({ status: 'success', message: 'Room removed from inventory.' });
  } catch (err) {
    console.error('Room Deletion Error:', err);
    res.status(500).json({ error: 'Database rejected the deletion. Check terminal for details.' });
  }
});

// 7. GET MAINTENANCE TICKETS
app.get('/api/Admin/maintenance', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const query = `
      SELECT m.id, m.issue, m.assigned_to, m.priority, m.status, m.created_at, m.room_id, r.room_number, r.room_blocked 
      FROM maintenance_tickets m
      JOIN rooms r ON m.room_id = r.id
      ORDER BY m.created_at DESC;
    `;
    const result = await pool.query(query);
    res.json({ status: 'success', data: { tickets: result.rows } });
  } catch (err) {
    console.error('Fetch tickets error:', err);
    res.status(500).json({ error: 'Failed to fetch engineering tickets' });
  }
});

// 8. CREATE MAINTENANCE TICKET
app.post('/api/Admin/maintenance', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  const { room_id, issue, priority, assigned_to } = req.body;
  try {
    await pool.query('BEGIN');

    // Create the ticket
    await pool.query(
      'INSERT INTO maintenance_tickets (room_id, issue, priority, status, assigned_to) VALUES ($1, $2, $3, $4, $5)',
      [room_id, issue, priority || 'Medium', 'Pending', assigned_to || 'Unassigned']
    );

    // Automatically set the room status to MAINTENANCE and block it from guests
    await pool.query(
      "UPDATE rooms SET status = 'MAINTENANCE', room_blocked = true WHERE id = $1",
      [room_id]
    );

    await pool.query('COMMIT');
    res.json({ status: 'success', message: 'Ticket deployed successfully.' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Create ticket error:', err);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// 9. UPDATE TICKET STATUS
app.patch('/api/Admin/maintenance/:id/status', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('BEGIN');

    // Update ticket status
    const ticketRes = await pool.query(
      'UPDATE maintenance_tickets SET status = $1 WHERE id = $2 RETURNING room_id',
      [status, id]
    );

    // If ticket is resolved, automatically release the room inventory
    if (status === 'Resolved' && ticketRes.rows.length > 0) {
      const roomId = ticketRes.rows[0].room_id;
      await pool.query(
        "UPDATE rooms SET status = 'AVAILABLE', room_blocked = false WHERE id = $1",
        [roomId]
      );
    }

    await pool.query('COMMIT');
    res.json({ status: 'success', message: 'Ticket status advanced.' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

// 10. DYNAMIC STAFF ASSIGNMENT
app.patch('/api/Admin/maintenance/:id/assign', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { assigned_to } = req.body;
  try {
    // If it was Pending, we should probably move it to In Progress when assigned
    const checkRes = await pool.query('SELECT status FROM maintenance_tickets WHERE id = $1', [id]);
    let newStatus = checkRes.rows[0]?.status;
    if (newStatus === 'Pending') newStatus = 'In Progress';

    await pool.query(
      'UPDATE maintenance_tickets SET assigned_to = $1, status = $2 WHERE id = $3',
      [assigned_to, newStatus, id]
    );
    res.json({ status: 'success', message: 'Staff assigned to ticket.', data: { newStatus } });
  } catch (err) {
    console.error('Assign staff error:', err);
    res.status(500).json({ error: 'Failed to assign ticket' });
  }
});

app.patch('/api/Admin/rooms/:id/status', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Allow all valid room statuses (including housekeeping workflow states)
  const validStatuses = ['AVAILABLE', 'OCCUPIED', 'DIRTY', 'CLEANING', 'INSPECTING', 'MAINTENANCE'];

  if (!validStatuses.includes(status?.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid room status override.' });
  }

  try {
    await pool.query('UPDATE rooms SET status = $1 WHERE id = $2', [status.toUpperCase(), id]);
    res.json({ status: 'success', message: 'Room operational status updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to execute status override in database.' });
  }
});

// 7. GET/POST/PATCH Booking Records Actions
app.get('/api/bookings', verifyStaffToken, async (req, res) => {
  try {
    const query = `
      SELECT b.id AS booking_id, b.check_in_date, b.check_out_date, b.status AS booking_status,
             b.total_price, g.name AS guest_name, g.email AS guest_email, r.room_number, rt.name AS room_type
      FROM bookings b
      JOIN guests g ON b.guest_id = g.id
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      ORDER BY b.created_at DESC;
    `;
    const result = await pool.query(query);
    res.json({ status: 'success', results: result.rows.length, data: { bookings: result.rows } });
  } catch (err) {
    res.status(500).json({ error: 'Database error while querying bookings' });
  }
});

app.patch('/api/bookings/:id/cancel', verifyStaffToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("UPDATE bookings SET status = 'CANCELLED' WHERE id = $1 RETURNING *;", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking transaction record not found' });
    res.json({ status: 'success', message: 'Reservation cancelled successfully', data: { booking: result.rows[0] } });
  } catch (err) {
    res.status(500).json({ error: 'Database error while attempting cancellation' });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { guest_id, guest_name, guest_email, guest_phone, guest_id_number, room_id, room_type_id, check_in_date, check_out_date, total_price, source = 'DIRECT' } = req.body;

  if (!check_in_date || !check_out_date || total_price === undefined) {
    return res.status(400).json({ status: 'error', message: 'Missing required booking fields' });
  }
  if (!room_id && !room_type_id) {
    return res.status(400).json({ status: 'error', message: 'Either room_id or room_type_id is required' });
  }

  try {
    let finalGuestId = guest_id;

    // If no guest_id provided, create or find guest by email/phone
    if (!finalGuestId) {
      if (!guest_name || (!guest_email && !guest_phone)) {
        return res.status(400).json({ status: 'error', message: 'Guest name and email/phone are required if guest_id is not provided' });
      }

      // Check if guest exists by email
      let guestResult;
      if (guest_email) {
        guestResult = await pool.query('SELECT id, id_number FROM guests WHERE email = $1', [guest_email]);
      }

      if (guestResult && guestResult.rows.length > 0) {
        finalGuestId = guestResult.rows[0].id;
        // Update id_number if it's missing and provided
        if (guest_id_number && !guestResult.rows[0].id_number) {
          await pool.query('UPDATE guests SET id_number = $1 WHERE id = $2', [guest_id_number, finalGuestId]);
        }
      } else {
        // Create new guest
        const newGuest = await pool.query(
          'INSERT INTO guests (name, email, phone, id_number) VALUES ($1, $2, $3, $4) RETURNING id',
          [guest_name, guest_email, guest_phone, guest_id_number || null]
        );
        finalGuestId = newGuest.rows[0].id;
      }
    }

    let assignedRoomId = room_id;

    // Auto-assign an available room if booking by room type
    if (!assignedRoomId && room_type_id) {
      const availableRoom = await pool.query(
        `SELECT r.id FROM rooms r 
         WHERE r.room_type_id = $1 
         AND r.status != 'MAINTENANCE'
         AND r.id NOT IN (
             SELECT room_id FROM bookings 
             WHERE status IN ('CONFIRMED', 'CHECKED_IN')
             AND daterange(check_in_date, check_out_date, '[)') && daterange($2::date, $3::date, '[)')
         )
         ORDER BY r.room_number ASC LIMIT 1`,
        [room_type_id, check_in_date, check_out_date]
      );
      if (availableRoom.rows.length === 0) {
        return res.status(409).json({ status: 'error', message: 'No available rooms of this type for the selected dates. All rooms are fully booked.' });
      }
      assignedRoomId = availableRoom.rows[0].id;
    }

    const query = `INSERT INTO bookings (guest_id, room_id, check_in_date, check_out_date, total_price, status, source) VALUES ($1, $2, $3, $4, $5, 'CONFIRMED', $6) RETURNING *;`;
    const result = await pool.query(query, [finalGuestId, assignedRoomId, check_in_date, check_out_date, total_price, source]);
    res.status(201).json({ status: 'success', data: { booking: result.rows[0] } });
  } catch (err) {
    if (err.constraint === 'no_overlapping_bookings') {
      return res.status(409).json({ status: 'error', message: 'This room is already booked for the selected dates.' });
    }
    console.error('Booking error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error while processing booking' });
  }
});

// ==========================================
// OTA & CHANNEL Admin INTEGRATION
// ==========================================

// Helper: Secure Channel Admin Webhook Endpoint
app.post('/api/channel-Admin/webhook', async (req, res) => {
  // 1. SECURITY: Verify Channel Admin Secret Key
  const apiKey = req.headers['x-channel-api-key'];
  if (apiKey !== (process.env.CHANNEL_Admin_SECRET || 'fallback_secret_key_123')) {
    return res.status(403).json({ error: 'Unauthorized OTA payload' });
  }

  const {
    event_type, // 'CREATE', 'CANCEL', 'MODIFY'
    ota_reference,
    guest_name,
    guest_email,
    guest_phone,
    room_type_id,
    check_in_date,
    check_out_date,
    total_price,
    commission_amount // Usually provided by OTA payloads
  } = req.body;

  if (!ota_reference || !event_type) {
    return res.status(400).json({ error: 'Missing ota_reference or event_type' });
  }

  try {
    await pool.query('BEGIN');

    // === HANDLE CANCELLATIONS ===
    if (event_type === 'CANCEL') {
      const cancelRes = await pool.query(
        "UPDATE bookings SET status = 'CANCELLED' WHERE ota_reference = $1 RETURNING id, room_id",
        [ota_reference]
      );
      if (cancelRes.rows.length > 0) {
        // Free up the room
        await pool.query("UPDATE rooms SET status = 'AVAILABLE' WHERE id = $1", [cancelRes.rows[0].room_id]);
      }
      await pool.query('COMMIT');
      return res.json({ status: 'success', message: 'OTA Cancellation processed' });
    }

    // === HANDLE NEW BOOKINGS (CREATE) ===
    if (event_type === 'CREATE') {
      // 1. Find or create guest
      let guestId;
      if (guest_email) {
        const guestResult = await pool.query('SELECT id FROM guests WHERE email = $1', [guest_email]);
        if (guestResult.rows.length > 0) guestId = guestResult.rows[0].id;
      }
      if (!guestId) {
        const newGuest = await pool.query(
          'INSERT INTO guests (name, email, phone) VALUES ($1, $2, $3) RETURNING id',
          [guest_name, guest_email, guest_phone]
        );
        guestId = newGuest.rows[0].id;
      }

      // 2. Assign room (using your existing anti-overlap logic)
      const availableRoom = await pool.query(
        `SELECT r.id FROM rooms r 
         WHERE r.room_type_id = $1 AND r.status != 'MAINTENANCE'
         AND r.id NOT IN (
             SELECT room_id FROM bookings 
             WHERE status IN ('CONFIRMED', 'CHECKED_IN')
             AND daterange(check_in_date, check_out_date, '[)') && daterange($2::date, $3::date, '[)')
         ) ORDER BY r.room_number ASC LIMIT 1`,
        [room_type_id, check_in_date, check_out_date]
      );

      if (availableRoom.rows.length === 0) {
        throw new Error('No available rooms of this type for the selected dates');
      }
      const assignedRoomId = availableRoom.rows[0].id;

      // 3. Create booking
      const bRes = await pool.query(
        `INSERT INTO bookings (guest_id, room_id, check_in_date, check_out_date, total_price, status, source, ota_reference) 
         VALUES ($1, $2, $3, $4, $5, 'CONFIRMED', 'OTA', $6) RETURNING id;`,
        [guestId, assignedRoomId, check_in_date, check_out_date, total_price, ota_reference]
      );

      const newBookingId = bRes.rows[0].id;

      // 4. (NEW) Finance Integration: Log the expected commission for the Finance Dashboard
      if (commission_amount) {
        // Requires ledger_transactions table (make sure this exists from your SQL setup)
        await pool.query(`
          INSERT INTO ledger_transactions (booking_id, amount, transaction_type, status)
          VALUES ($1, $2, 'OTA_COMMISSION', 'PENDING_PAYMENT')
        `, [newBookingId, commission_amount]);
      }

      await pool.query('COMMIT');
      return res.status(201).json({ status: 'success', message: 'OTA Booking created' });
    }

    // === HANDLE MODIFICATIONS ===
    if (event_type === 'MODIFY') {
      // Logic to update dates or prices based on ota_reference
      await pool.query(
        'UPDATE bookings SET check_in_date = $1, check_out_date = $2, total_price = $3 WHERE ota_reference = $4',
        [check_in_date, check_out_date, total_price, ota_reference]
      );
      await pool.query('COMMIT');
      return res.json({ status: 'success', message: 'OTA Modification processed' });
    }

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Channel Admin Webhook Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/rooms/:id/status', verifyStaffToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'DIRTY', 'INSPECTING', 'MAINTENANCE'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid room status' });

  try {
    const result = await pool.query('UPDATE rooms SET status = $1 WHERE id = $2 RETURNING *;', [status, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Room not found' });

    // Log audit trail
    await logAuditAction(req.user.userId, 'Room Status Changed', `Room ${result.rows[0].room_number} status updated to ${status}`);

    res.json({ status: 'success', data: { room: result.rows[0] } });
  } catch (err) {
    res.status(500).json({ error: 'Database error while updating status' });
  }
});

// =========================================================================
// Admin / ADMIN COMMAND CENTER EXTENDED ENDPOINTS
// =========================================================================

// 1. DYNAMIC PRICING & YIELD MANAGEMENT: Fetch All Rules
app.get('/api/Admin/yield-rules', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const rules = await pool.query('SELECT * FROM yield_rules;');
    const rulesObj = {
      pricing_surges: { enabled: false, surge_percentage: 20, occupancy_threshold: 80 },
      los_discount: { enabled: false, min_nights: 5, discount_percentage: 10 },
      seasonal_multiplier: [],
      channel_Admin: { master_ota_toggle: false, allotments: { agoda: 5, direct: 10, expedia: 5, booking_com: 5 } },
      crm_triggers: { pre_arrival_upsell: false, post_checkout_feedback: false },
      maintenance_automation: { ac_servicing_days: 90, backup_contractor: 'QuickFix Hospitality Group', auto_route_contractor: false, generator_check_days: 30 }
    };
    rules.rows.forEach(r => { rulesObj[r.key] = r.value; });
    res.json({ status: 'success', data: { rules: rulesObj } });
  } catch (err) {
    console.error('Yield rules fetch error:', err);
    res.status(500).json({ error: 'Database error while fetching yield rules' });
  }
});

// 2. DYNAMIC PRICING & YIELD MANAGEMENT: Update Yield Rule
app.post('/api/Admin/yield-rules', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) return res.status(400).json({ error: 'Key and value are required' });

  try {
    await pool.query(
      'INSERT INTO yield_rules (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;',
      [key, value]
    );
    await logAuditAction(req.user.userId, 'Update Yield Rule', `Updated configuration for rule: ${key}`);
    res.json({ status: 'success', message: `Rule ${key} updated successfully` });
  } catch (err) {
    console.error('Yield rule save error:', err);
    res.status(500).json({ error: 'Failed to update yield rule configuration' });
  }
});

// 3. SYSTEM WATCHDOG: Fetch Immutable Audit Trail
app.get('/api/Admin/audit-logs', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  const { q } = req.query;
  try {
    let query = 'SELECT * FROM system_audit_logs ORDER BY created_at DESC LIMIT 100;';
    let params = [];
    if (q && q.trim() !== '') {
      query = `
        SELECT * FROM system_audit_logs 
        WHERE user_name ILIKE $1 OR user_role ILIKE $1 OR action ILIKE $1 OR details ILIKE $1
        ORDER BY created_at DESC LIMIT 100;
      `;
      params = [`%${q}%`];
    }
    const logs = await pool.query(query, params);
    res.json({ status: 'success', data: { logs: logs.rows } });
  } catch (err) {
    console.error('Audit trail query error:', err);
    res.status(500).json({ error: 'Failed to query system watchdog audits' });
  }
});

// 4. ACCESS CONTROL: Fetch All User Roles & Custom Permissions
app.get('/api/Admin/permissions', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const permQuery = `
      SELECT u.id, u.name, u.email, u.role, 
             COALESCE(p.can_process_refunds, false) as can_process_refunds,
             COALESCE(p.can_apply_discounts, false) as can_apply_discounts,
             COALESCE(p.can_overbook, false) as can_overbook
      FROM users u
      LEFT JOIN user_permissions p ON u.id = p.user_id
      ORDER BY u.role, u.name;
    `;
    const usersPerm = await pool.query(permQuery);
    res.json({ status: 'success', data: { permissions: usersPerm.rows } });
  } catch (err) {
    console.error('Permissions fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve access control matrix' });
  }
});

// 5. ACCESS CONTROL: Save Specific User Permissions
app.post('/api/Admin/permissions/:userId', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  const { userId } = req.params;
  const { role, can_process_refunds, can_apply_discounts, can_overbook } = req.body;

  try {
    await pool.query('BEGIN');

    // Update user role
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);

    // Update or insert granular permissions
    await pool.query(`
      INSERT INTO user_permissions (user_id, can_process_refunds, can_apply_discounts, can_overbook)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO UPDATE SET 
        can_process_refunds = EXCLUDED.can_process_refunds,
        can_apply_discounts = EXCLUDED.can_apply_discounts,
        can_overbook = EXCLUDED.can_overbook;
    `, [userId, can_process_refunds, can_apply_discounts, can_overbook]);

    await pool.query('COMMIT');
    await logAuditAction(req.user.userId, 'Modify Access Matrix', `Updated permissions and role for user ID: ${userId}`);
    res.json({ status: 'success', message: 'User access levels saved successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Save permissions error:', err);
    res.status(500).json({ error: 'Database error saving user access matrix' });
  }
});

// 6. SHIFT & ACTIVE STAFF SESSION MONITORING
app.get('/api/Admin/shifts', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const shiftQuery = `
      SELECT s.id, u.id as user_id, u.name, u.email, u.role, s.login_time, s.logout_time,
             (CASE WHEN s.logout_time IS NULL THEN true ELSE false END) as is_active,
             ROUND(
               EXTRACT(EPOCH FROM (COALESCE(s.logout_time, NOW()) - s.login_time)) / 60
             )::int AS duration_minutes
      FROM staff_shifts s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.login_time DESC LIMIT 60;
    `;
    const shifts = await pool.query(shiftQuery);
    res.json({ status: 'success', data: { shifts: shifts.rows } });
  } catch (err) {
    console.error('Shifts fetch error:', err);
    res.status(500).json({ error: 'Failed to access active staff logs' });
  }
});

// 6b. STAFF SALARY CONFIGURATION
app.get('/api/Admin/salaries', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM staff_salaries');
    res.json({ status: 'success', data: { salaries: result.rows } });
  } catch (err) {
    console.error('Salaries fetch error:', err);
    res.status(500).json({ error: 'Failed to access salary configurations' });
  }
});

app.get('/api/Admin/salary/:userId', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query('SELECT * FROM staff_salaries WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
      // Return default if none found
      return res.json({ status: 'success', data: { salaryConfig: { base_salary_monthly: 0, daily_deduction: 0 } } });
    }
    res.json({ status: 'success', data: { salaryConfig: result.rows[0] } });
  } catch (err) {
    console.error('Salary config fetch error:', err);
    res.status(500).json({ error: 'Failed to access salary configuration' });
  }
});

app.post('/api/Admin/salary/:userId', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { base_salary_monthly, daily_deduction } = req.body;
    
    await pool.query(`
      INSERT INTO staff_salaries (user_id, base_salary_monthly, daily_deduction)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) 
      DO UPDATE SET base_salary_monthly = EXCLUDED.base_salary_monthly, daily_deduction = EXCLUDED.daily_deduction, updated_at = NOW()
    `, [userId, base_salary_monthly, daily_deduction]);
    
    await logAuditAction(req.user.userId, 'Salary Config Updated', `Updated salary rules for user ID ${userId}`);
    res.json({ status: 'success', message: 'Salary configuration saved successfully' });
  } catch (err) {
    console.error('Salary config update error:', err);
    res.status(500).json({ error: 'Failed to update salary configuration' });
  }
});

// 7. CRM / GUEST REGISTRY: VIP & Blacklist Controls
app.get('/api/Admin/crm/guests', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const guests = await pool.query('SELECT * FROM guests ORDER BY is_vip DESC, is_blacklisted DESC, name ASC;');
    res.json({ status: 'success', data: { guests: guests.rows } });
  } catch (err) {
    console.error('CRM guests fetch error:', err);
    res.status(500).json({ error: 'Database error while fetching CRM guest registry' });
  }
});

app.post('/api/Admin/crm/guests/:id', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { is_vip, is_blacklisted } = req.body;

  try {
    await pool.query(
      'UPDATE guests SET is_vip = $1, is_blacklisted = $2 WHERE id = $3 RETURNING *;',
      [!!is_vip, !!is_blacklisted, id]
    );
    await logAuditAction(
      req.user.userId,
      'Modify Guest CRM Flag',
      `Updated guest CRM configuration (VIP: ${!!is_vip}, Blacklist: ${!!is_blacklisted})`
    );
    res.json({ status: 'success', message: 'Guest registry flags updated' });
  } catch (err) {
    console.error('Update guest flags error:', err);
    res.status(500).json({ error: 'Failed to modify guest configuration parameters' });
  }
});

// 8. DEPARTMENTAL BROADCASTING
app.post('/api/Admin/broadcast', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  const { targetDept, message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message content is required' });

  try {
    const senderName = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.userId]);
    const name = senderName.rows.length > 0 ? senderName.rows[0].name : 'Admin';

    await pool.query(
      `INSERT INTO broadcasts (target_dept, message, sender_id, sender_name, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '24 hours')`,
      [targetDept || 'ALL', message, req.user.userId, name]
    );

    await logAuditAction(
      req.user.userId,
      'Department Broadcast',
      `Sent alert message to department [${targetDept || 'ALL'}]: "${message}"`
    );
    res.json({ status: 'success', message: 'Operational broadcast transmitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process broadcasting task' });
  }
});

// 8b. Fetch Active Broadcasts
app.get('/api/broadcasts', verifyToken, async (req, res) => {
  try {
    const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.userId]);
    const userRole = userRes.rows.length > 0 ? userRes.rows[0].role : 'NONE';

    const result = await pool.query(
      `SELECT id, target_dept, message, sender_name, created_at, expires_at 
       FROM broadcasts 
       WHERE (target_dept = 'ALL' OR UPPER(target_dept) = UPPER($1) OR $1 = 'ADMIN')
       ORDER BY created_at DESC`,
      [userRole]
    );
    res.json({ status: 'success', data: { broadcasts: result.rows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch broadcasts' });
  }
});

// 9. HR lifecycle: Onboard Employee
app.post('/api/Admin/staff/onboard', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'All fields are required' });

  try {
    await pool.query('BEGIN');
    const hash = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role;',
      [email.toLowerCase().trim(), hash, name, role || 'FRONT_DESK']
    );

    // Create initial permissions record
    await pool.query(
      'INSERT INTO user_permissions (user_id, can_process_refunds, can_apply_discounts, can_overbook) VALUES ($1, true, true, true)',
      [newUser.rows[0].id]
    );

    await pool.query('COMMIT');
    await logAuditAction(req.user.userId, 'Onboard Staff Member', `Provisioned new staff user profile: ${email} (${role})`);
    res.json({ status: 'success', data: { user: newUser.rows[0] } });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Staff onboarding error:', err);
    if (err.code === '23505') return res.status(400).json({ error: 'An account with this email address already exists' });
    res.status(500).json({ error: 'Failed to complete employee provisioning process' });
  }
});

// 10. HR lifecycle: Update Employee Details
app.patch('/api/Admin/staff/:id', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

  try {
    const updated = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, email, name, role;',
      [name, email.toLowerCase().trim(), id]
    );
    if (updated.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    await logAuditAction(req.user.userId, 'Update Staff Member', `Updated profile for ${email}`);
    res.json({ status: 'success', data: { user: updated.rows[0] } });
  } catch (err) {
    console.error('Staff update error:', err);
    res.status(500).json({ error: 'Failed to update employee details' });
  }
});

// 11. HR lifecycle: Offboard Employee
app.post('/api/Admin/staff/offboard/:userId', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  const { userId } = req.params;
  if (userId === req.user.userId) return res.status(400).json({ error: 'You cannot offboard your own administrator account' });

  try {
    const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'Employee profile not found' });

    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    await logAuditAction(req.user.userId, 'Offboard Staff Member', `Revoked all operational access and deleted user account: ${userRes.rows[0].email}`);
    res.json({ status: 'success', message: 'Employee offboarded and credential tokens disabled' });
  } catch (err) {
    console.error('Staff offboarding error:', err);
    res.status(500).json({ error: 'Failed to complete employee termination protocol' });
  }
});

// 11. PREDICTIVE ANALYTICS & STATS PACE ENGINE
app.get('/api/Admin/analytics', verifyToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    // A. Pace Report: Simulated comparison series (booking pace this month vs last year)
    const currentMonthPace = [
      { day: 1, velocity: 12 }, { day: 5, velocity: 18 }, { day: 10, velocity: 26 },
      { day: 15, velocity: 38 }, { day: 20, velocity: 49 }, { day: 25, velocity: 63 }, { day: 30, velocity: 74 }
    ];
    const lastYearMonthPace = [
      { day: 1, velocity: 8 }, { day: 5, velocity: 14 }, { day: 10, velocity: 22 },
      { day: 15, velocity: 30 }, { day: 20, velocity: 41 }, { day: 25, velocity: 52 }, { day: 30, velocity: 61 }
    ];

    // B. Cancellation Heatmap: Rates by room type and booking channel
    const cancellationRates = [
      { category: 'Suite (Expedia)', rate: 28 },
      { category: 'Deluxe (Expedia)', rate: 19 },
      { category: 'Standard (Booking.com)', rate: 24 },
      { category: 'Suite (Booking.com)', rate: 15 },
      { category: 'Deluxe (Agoda)', rate: 22 },
      { category: 'Standard (Direct Booking)', rate: 4 }
    ];

    // C. Staff Performance metrics
    const staffKPIs = [
      { name: 'Rajnish (Housekeeper)', metric: '26 mins avg clean time', status: 'Optimal' },
      { name: 'Amit Sharma (Front Desk)', metric: '84% upsell booking rate', status: 'Exceptional' },
      { name: 'John (Engineer)', metric: '1.2 hrs ticket resolution', status: 'Optimal' }
    ];

    res.json({
      status: 'success',
      data: {
        pace: { current: currentMonthPace, lastYear: lastYearMonthPace },
        cancellationHeatmap: cancellationRates,
        staffKPIs
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate booking pace metrics' });
  }
});

// ==========================================
// DINING MODULE ENDPOINTS
// ==========================================
const requireDining = requireRole(['RESTAURANT', 'ADMIN']);

// Fetch active Kitchen Order Tickets (KOTs)
app.get('/api/dining/kots', verifyToken, requireDining, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dining_kots ORDER BY created_at DESC');
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch KOTs' });
  }
});

// Create a new KOT
app.post('/api/dining/kots', verifyToken, requireDining, async (req, res) => {
  const { table, items, type } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO dining_kots (table_number, items, type) VALUES ($1, $2, $3) RETURNING *',
      [table, items, type || 'Dine-in']
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create KOT' });
  }
});

// ==========================================
// SALES MODULE ENDPOINTS
// ==========================================
// Assuming you add a 'SALES' role to your ENUM similar to TRAVEL and RESTAURANT
const requireSales = requireRole(['SALES', 'ADMIN']);

// Fetch Pipeline Leads
app.get('/api/sales/leads', verifyToken, requireSales, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sales_leads ORDER BY created_at DESC');
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// ==========================================
// DATABASE AUTO-MIGRATION (runs on startup)
// ==========================================
async function runMigrations() {
  try {
    // 1. Add INSPECTING to room_status ENUM if not present
    const enumCheck = await pool.query(
      "SELECT 1 FROM pg_enum WHERE enumlabel = 'INSPECTING' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'room_status')"
    );
    if (enumCheck.rows.length === 0) {
      await pool.query("ALTER TYPE room_status ADD VALUE IF NOT EXISTS 'INSPECTING'");
    }

    // DINING MODULE TABLES
await pool.query(`
  CREATE TABLE IF NOT EXISTS dining_kots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number VARCHAR(50) NOT NULL,
    items TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'New',
    type VARCHAR(50) NOT NULL DEFAULT 'Dine-in',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`);

// SALES MODULE TABLES
await pool.query(`
  CREATE TABLE IF NOT EXISTS sales_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company VARCHAR(255) NOT NULL,
    deal_name VARCHAR(255) NOT NULL,
    value DECIMAL(12, 2) NOT NULL DEFAULT 0,
    stage VARCHAR(50) NOT NULL DEFAULT 'New',
    source VARCHAR(100),
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`);

    // 2. Create room_expenses table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS room_expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
        item_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
        logged_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Seed default yield_rules if they do not exist yet
    const seedRules = [
      { key: 'pricing_surges', value: { enabled: false, surge_percentage: 20, occupancy_threshold: 80 } },
      { key: 'los_discount', value: { enabled: false, min_nights: 5, discount_percentage: 10 } },
      { key: 'seasonal_multiplier', value: [] },
      { key: 'channel_Admin', value: { master_ota_toggle: false, allotments: { agoda: 5, direct: 10, expedia: 5, booking_com: 5 } } },
      { key: 'crm_triggers', value: { pre_arrival_upsell: false, post_checkout_feedback: false } },
      { key: 'maintenance_automation', value: { ac_servicing_days: 90, backup_contractor: 'QuickFix Hospitality Group', auto_route_contractor: false, generator_check_days: 30 } }
    ];

    for (const rule of seedRules) {
      await pool.query(
        'INSERT INTO yield_rules (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING;',
        [rule.key, JSON.stringify(rule.value)]
      );
    }

    // 4. Merge migrate.js logic
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ledger_transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
          amount DECIMAL(10, 2) NOT NULL,
          transaction_type VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS staff_salaries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
          base_salary_monthly DECIMAL(10, 2) DEFAULT 0,
          daily_deduction DECIMAL(10, 2) DEFAULT 0,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS broadcasts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          target_dept VARCHAR(50) NOT NULL DEFAULT 'ALL',
          message TEXT NOT NULL,
          sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
          sender_name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE
      );
    `);
    
    console.log('✅ Auto-migrations completed successfully.');

    // Add columns dynamically (ignore error if they already exist)
    const columnsToAdd = [
      "ALTER TABLE bookings ADD COLUMN source VARCHAR(50) DEFAULT 'DIRECT'",
      "ALTER TABLE bookings ADD COLUMN ota_reference VARCHAR(255)",
      "ALTER TABLE guests ADD COLUMN id_number VARCHAR(100)"
    ];

    for (const query of columnsToAdd) {
      try {
        await pool.query(query);
      } catch (err) {
        // Postgres error code 42701 is "duplicate_column"
        if (err.code !== '42701') {
          console.error(`⚠️ Migration: Error executing ${query}`, err.message);
        }
      }
    }

    // 5. TRAVEL DESK MODULE — enum value, tables, seed data, seed login
    const travelRoleCheck = await pool.query(
      "SELECT 1 FROM pg_enum WHERE enumlabel = 'TRAVEL' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')"
    );
    if (travelRoleCheck.rows.length === 0) {
      await pool.query("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'TRAVEL'");
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS travel_packages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL DEFAULT 'Leisure',
        price DECIMAL(10, 2) NOT NULL,
        duration_days INT NOT NULL DEFAULT 3,
        max_travelers INT NOT NULL DEFAULT 4,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS travel_bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        package_id UUID REFERENCES travel_packages(id) ON DELETE SET NULL,
        guest_name VARCHAR(255) NOT NULL,
        guest_email VARCHAR(255),
        guest_phone VARCHAR(50),
        travelers_count INT NOT NULL DEFAULT 1,
        travel_date DATE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        booking_status VARCHAR(50) NOT NULL DEFAULT 'Confirmed',
        booked_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed sample packages if the catalog is empty
    const pkgCountRes = await pool.query('SELECT COUNT(*) FROM travel_packages');
    if (parseInt(pkgCountRes.rows[0].count, 10) === 0) {
      const packages = [
        ['Goa Beach Escape', 'Goa, India', 'A relaxed 4-day beach holiday with resort stay, water sports and sunset cruise.', 'Beach & Leisure', 18500, 4, 4],
        ['Kerala Backwaters Retreat', 'Alleppey, Kerala', 'Houseboat stay through the backwaters with Ayurvedic spa sessions included.', 'Wellness', 24500, 5, 4],
        ['Rajasthan Heritage Trail', 'Jaipur–Udaipur–Jodhpur', 'Palace hotels, fort tours and a private heritage-city guide across 3 cities.', 'Heritage', 42000, 7, 6],
        ['Himalayan Trek Adventure', 'Manali, Himachal Pradesh', 'Guided high-altitude trek with camping gear, permits and porter support.', 'Adventure', 27500, 6, 8],
        ['Dubai City Break', 'Dubai, UAE', 'Skyline hotel stay with desert safari, Burj Khalifa entry and city tour.', 'International', 68000, 5, 4],
        ['Maldives Honeymoon Special', 'Maldives', 'Overwater villa stay with private dinners, snorkeling and spa credits.', 'Honeymoon', 125000, 5, 2],
      ];
      for (const p of packages) {
        await pool.query(
          `INSERT INTO travel_packages (name, destination, description, category, price, duration_days, max_travelers)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          p
        );
      }

      // Seed a handful of bookings against the freshly created packages
      const seededPackages = await pool.query('SELECT id, price, name FROM travel_packages');
      const findPkg = (name) => seededPackages.rows.find(r => r.name === name);
      const bookingSeeds = [
        ['Aryan Singh', 'aryan.singh@example.com', '+91 98200 11122', 2, 12, 'Goa Beach Escape', 'Paid', 'Confirmed'],
        ['Priya Nair', 'priya.nair@example.com', '+91 98450 33221', 4, 20, 'Kerala Backwaters Retreat', 'Paid', 'Confirmed'],
        ['Meridian Corporate Travel', 'travel@meridiancorp.com', '+91 98220 44556', 6, 35, 'Rajasthan Heritage Trail', 'Partial', 'Confirmed'],
        ['Rohan Desai', 'rohan.desai@example.com', '+91 99870 55221', 2, -5, 'Dubai City Break', 'Paid', 'Completed'],
        ['Vikram & Anjali Malhotra', 'vikram.m@example.com', '+91 98330 77441', 2, 45, 'Maldives Honeymoon Special', 'Partial', 'Confirmed'],
        ['Zenith Adventure Club', 'contact@zenithadventure.com', '+91 97410 88332', 8, 18, 'Himalayan Trek Adventure', 'Pending', 'Confirmed'],
        ['Sanya Kapoor', 'sanya.kapoor@example.com', '+91 98110 22114', 1, -12, 'Goa Beach Escape', 'Paid', 'Completed'],
        ['Corporate Account — Infosys', 'travel.desk@infosys.com', '+91 98800 99112', 10, 40, 'Dubai City Break', 'Pending', 'Confirmed'],
      ];
      for (const b of bookingSeeds) {
        const [guest, email, phone, travelers, dayOffset, pkgName, paymentStatus, bookingStatus] = b;
        const pkg = findPkg(pkgName);
        if (!pkg) continue;
        const amount = Number(pkg.price) * travelers;
        await pool.query(
          `INSERT INTO travel_bookings (package_id, guest_name, guest_email, guest_phone, travelers_count, travel_date, amount, payment_status, booking_status)
           VALUES ($1, $2, $3, $4, $5, CURRENT_DATE + $6::int, $7, $8, $9)`,
          [pkg.id, guest, email, phone, travelers, dayOffset, amount, paymentStatus, bookingStatus]
        );
      }
    }

    // Seed the Travel Desk login (idempotent — skipped if it already exists)
    const travelUserRes = await pool.query('SELECT id FROM users WHERE email = $1', ['travel@techhansa.com']);
    if (travelUserRes.rows.length === 0) {
      const travelHash = await bcrypt.hash('password123', 10);
      await pool.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)',
        ['travel@techhansa.com', travelHash, 'Travel Desk Admin', 'TRAVEL']
      );
    }

  } catch (err) {
    console.error('⚠️ Migration warning (non-fatal):', err.message);
  }

  // Add RESTAURANT to the ENUM if it's missing
    const enumRestCheck = await pool.query(
      "SELECT 1 FROM pg_enum WHERE enumlabel = 'RESTAURANT' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')"
    );
    if (enumRestCheck.rows.length === 0) {
      await pool.query("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'RESTAURANT'");
    }

    // Auto-create the requested Dining user credentials
    const diningUserCheck = await pool.query("SELECT * FROM users WHERE email = 'dinning@techhansa.com'");
    if (diningUserCheck.rows.length === 0) {
      const hash = await bcrypt.hash('password123', 10);
      await pool.query(
        "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'RESTAURANT')",
        ['dinning@techhansa.com', hash, 'F&B Admin']
      );
    }
}

// Start the server
const server = app.listen(PORT, async () => {
  console.log(`🚀 Secure Server active on http://localhost:${3000}`);
  await runMigrations();
});

server.on('error', (err) => {
  console.error('Server failed to initialize:', err);
});