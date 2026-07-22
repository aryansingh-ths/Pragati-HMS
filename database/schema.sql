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

-- 8. TRAVEL DESK MODULE (Travel Packages & Customer Purchases)
-- Note: 'TRAVEL' is added to the user_role enum at runtime via migration
-- (ALTER TYPE user_role ADD VALUE), since it postdates this base schema file.

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

CREATE TABLE IF NOT EXISTS travel_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES travel_packages(id) ON DELETE SET NULL,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255),
    guest_phone VARCHAR(50),
    travelers_count INT NOT NULL DEFAULT 1,
    travel_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',  -- Pending, Partial, Paid, Refunded
    booking_status VARCHAR(50) NOT NULL DEFAULT 'Confirmed', -- Confirmed, Completed, Cancelled
    booked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- FINANCE & ACCOUNTING TABLES
-- ==========================================

-- 1. Operational & Department Expenses Table (Extends basic room_expenses)
CREATE TABLE IF NOT EXISTS operational_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL, -- e.g., 'Kitchen Items', 'Utilities', 'Maintenance'
    vendor VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Bank Transfer',
    status VARCHAR(50) DEFAULT 'Approved',
    notes TEXT,
    logged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Invoices & Guest Folios Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    bill_to VARCHAR(255) NOT NULL,
    invoice_type VARCHAR(50) DEFAULT 'Guest Folio', -- 'Guest Folio', 'Corporate Account', 'Banquet'
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'UNPAID', -- 'PAID', 'PARTIAL', 'OVERDUE', 'DRAFT'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Accounts Payable / Vendor Bills Table
CREATE TABLE IF NOT EXISTS vendor_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_number VARCHAR(100) UNIQUE NOT NULL,
    vendor VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Scheduled', -- 'Scheduled', 'Overdue', 'Paid'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Guest Deposits & Escrow Table
CREATE TABLE IF NOT EXISTS guest_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
    deposit_type VARCHAR(50) NOT NULL, -- 'Security Deposit', 'Advance Booking'
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Held', -- 'Held', 'Refunded', 'Applied to Bill', 'Forfeited'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Upgrade Existing ledger_transactions Table
ALTER TABLE ledger_transactions 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'Cash',
ADD COLUMN IF NOT EXISTS reference_number VARCHAR(255);

-- 6. Reconciliations Table
CREATE TABLE IF NOT EXISTS reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(100) NOT NULL, -- 'Bank Statement', 'Gateway Payout'
    reference_number VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    matched_with VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Unmatched', -- 'Matched', 'Unmatched'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Department Budgets Table
CREATE TABLE IF NOT EXISTS department_budgets (
    id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) UNIQUE NOT NULL,
    budget_amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL -- 'Revenue', 'Expense'
);

-- Seed data for department_budgets (Do Nothing if exists)
INSERT INTO department_budgets (department_name, budget_amount, type) VALUES
('Rooms', 2700000, 'Revenue'),
('F&B', 1350000, 'Revenue'),
('Banquets & Events', 900000, 'Revenue'),
('Housekeeping', 420000, 'Expense'),
('Marketing & Admin', 230000, 'Expense')
ON CONFLICT (department_name) DO NOTHING;

-- 8. Cash Drawer Logs
CREATE TABLE IF NOT EXISTS cash_drawer_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    actual_amount DECIMAL(10, 2) NOT NULL,
    expected_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'Balanced', 'Short', 'Over'
    notes TEXT,
    counted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Accounting Balances (For Balance Sheet & Cash Flow)
CREATE TABLE IF NOT EXISTS accounting_balances (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    balance DECIMAL(15, 2) NOT NULL
);

INSERT INTO accounting_balances (key_name, balance) VALUES
('cash_and_bank', 1842000),
('inventory', 218000),
('property_and_equipment', 18500000),
('long_term_loan', 6200000),
('property_improvements', -240000),
('loan_repayment', -150000),
('owners_equity', 14260850)
ON CONFLICT (key_name) DO NOTHING;


