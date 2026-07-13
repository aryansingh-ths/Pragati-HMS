-- 1. Enable the extension required for the exclusion constraint (Double-booking prevention)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Define our ENUMs (Fixed sets of statuses)
CREATE TYPE user_role AS ENUM ('ADMIN', 'RECEPTION', 'HOUSEKEEPING', 'FINANCE', 'RESTAURANT');
CREATE TYPE room_status AS ENUM ('AVAILABLE', 'OCCUPIED', 'CLEANING', 'DIRTY', 'INSPECTING', 'MAINTENANCE');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED');

-- 3. Core Tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'RECEPTION',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Optional, if they created an account online
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    id_number VARCHAR(100),
    is_vip BOOLEAN DEFAULT false,
    is_blacklisted BOOLEAN DEFAULT false
);

CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL
);

CREATE TABLE room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., 'Deluxe', 'Suite'
    base_price DECIMAL(10, 2) NOT NULL,
    capacity_adult INT NOT NULL,
    capacity_child INT NOT NULL
);

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_type_id UUID REFERENCES room_types(id) ON DELETE CASCADE,
    room_number VARCHAR(50) UNIQUE NOT NULL,
    status room_status DEFAULT 'AVAILABLE',
    room_blocked BOOLEAN DEFAULT false
);

-- 4. Maintenance Tables
CREATE TABLE maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    issue TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    assigned_to VARCHAR(100) DEFAULT 'Unassigned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. The Core Booking Engine Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    status booking_status DEFAULT 'PENDING',
    total_price DECIMAL(10, 2) NOT NULL,
    source VARCHAR(50) DEFAULT 'DIRECT',
    ota_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- 🚨 THE CRITICAL DOUBLE-BOOKING EXCLUSION CONSTRAINT 🚨
    -- This guarantees at the database level that no two confirmed/checked-in bookings 
    -- can share the same room on overlapping dates.
    CONSTRAINT no_overlapping_bookings 
    EXCLUDE USING gist (
        room_id WITH =,
        daterange(check_in_date, check_out_date, '[)') WITH &&
    ) WHERE (status IN ('CONFIRMED', 'CHECKED_IN'))
);

-- 6. Amenity Restocking Expenses (Housekeeping → Finance Integration)
CREATE TABLE room_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    logged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Advanced Features & Command Center Tables

-- System Audit Trail (Watchdog Log)
CREATE TABLE IF NOT EXISTS system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(100) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Yield Engine & Automation Rules Configuration Table (Flexible JSONB Key-Value Store)
CREATE TABLE IF NOT EXISTS yield_rules (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL
);

-- User Granular Permissions Matrix
CREATE TABLE IF NOT EXISTS user_permissions (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    can_process_refunds BOOLEAN DEFAULT false,
    can_apply_discounts BOOLEAN DEFAULT false,
    can_overbook BOOLEAN DEFAULT false
);

-- Staff Shifts & Active Sessions Monitoring
CREATE TABLE IF NOT EXISTS staff_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP WITH TIME ZONE
);
CREATE TABLE ledger_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
