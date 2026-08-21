-- 1. Enable the extension required for the exclusion constraint (Double-booking prevention)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Define our ENUMs (Fixed sets of statuses)
DO $$ BEGIN CREATE TYPE access_level AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EXECUTIVE'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE department_type AS ENUM ('GLOBAL', 'FRONT_DESK', 'DINING', 'HOUSEKEEPING', 'FINANCE', 'SALES', 'TRAVEL'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'RECEPTION', 'HOUSEKEEPING', 'FINANCE', 'RESTAURANT', 'FRONT_DESK', 'TRAVEL', 'SALES'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE room_status AS ENUM ('AVAILABLE', 'OCCUPIED', 'CLEANING', 'DIRTY', 'INSPECTING', 'MAINTENANCE'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Core Tables
CREATE TABLE IF NOT EXISTS hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    logo_url TEXT,
    gst_no VARCHAR(100),
    contact_no VARCHAR(100),
    location TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'RECEPTION',
    access_level access_level NOT NULL DEFAULT 'EXECUTIVE',
    department department_type[] NOT NULL DEFAULT ARRAY['FRONT_DESK'::department_type],
    designation VARCHAR(255) DEFAULT 'Administrator',
    contact_number VARCHAR(100),
    can_grant_discount BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Optional, if they created an account online
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    id_number VARCHAR(100),
    is_vip BOOLEAN DEFAULT false,
    is_blacklisted BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., 'Deluxe', 'Suite'
    base_price DECIMAL(10, 2) NOT NULL,
    capacity_adult INT NOT NULL,
    capacity_child INT NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_id UUID REFERENCES room_types(id) ON DELETE CASCADE,
    room_number VARCHAR(50) UNIQUE NOT NULL,
    status room_status DEFAULT 'AVAILABLE',
    room_blocked BOOLEAN DEFAULT false
);

-- 4. Maintenance Tables
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    issue TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    assigned_to VARCHAR(100) DEFAULT 'Unassigned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. The Core Booking Engine Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS room_expenses (
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
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
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
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP WITH TIME ZONE
);
CREATE TABLE IF NOT EXISTS ledger_transactions (
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
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
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
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
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
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_hotel_id ON users(hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_invoices_hotel_id ON invoices(hotel_id);
CREATE INDEX IF NOT EXISTS idx_operational_expenses_hotel_id ON operational_expenses(hotel_id);
CREATE INDEX IF NOT EXISTS idx_vendor_bills_hotel_id ON vendor_bills(hotel_id);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_hotel_id ON system_audit_logs(hotel_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_hotel_id ON broadcasts(hotel_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_hotel_id ON staff_shifts(hotel_id);

-- ==========================================
-- DINING MODULE TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS dining_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    capacity INT NOT NULL DEFAULT 4,
    status VARCHAR(50) DEFAULT 'Available',
    reserved_time VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS dining_menu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    item VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    dietary VARCHAR(50) DEFAULT 'Veg',
    is_spicy BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    contains_nuts BOOLEAN DEFAULT false,
    orders INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dining_kots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    items JSONB NOT NULL,
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
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
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
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
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
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_hotel_id ON users(hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_invoices_hotel_id ON invoices(hotel_id);
CREATE INDEX IF NOT EXISTS idx_operational_expenses_hotel_id ON operational_expenses(hotel_id);
CREATE INDEX IF NOT EXISTS idx_vendor_bills_hotel_id ON vendor_bills(hotel_id);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_hotel_id ON system_audit_logs(hotel_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_hotel_id ON broadcasts(hotel_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_hotel_id ON staff_shifts(hotel_id);

-- ==========================================
-- DINING MODULE TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS dining_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    capacity INT NOT NULL DEFAULT 4,
    status VARCHAR(50) DEFAULT 'Available',
    reserved_time VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS dining_menu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    item VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    dietary VARCHAR(50) DEFAULT 'Veg',
    is_spicy BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    contains_nuts BOOLEAN DEFAULT false,
    orders INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dining_kots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    items JSONB NOT NULL,
    type VARCHAR(50) DEFAULT 'Dine-in',
    status VARCHAR(50) DEFAULT 'New',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dining_tables_hotel_id ON dining_tables(hotel_id);
CREATE INDEX IF NOT EXISTS idx_dining_menu_hotel_id ON dining_menu(hotel_id);
CREATE INDEX IF NOT EXISTS idx_dining_kots_hotel_id ON dining_kots(hotel_id);

CREATE TABLE IF NOT EXISTS dining_inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    uom VARCHAR(50) NOT NULL DEFAULT 'kg',
    par_level INT NOT NULL DEFAULT 10,
    unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'In Stock',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dining_procurement_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    vendor VARCHAR(255) NOT NULL,
    invoice_number VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dining_wastage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    item_name VARCHAR(255) NOT NULL,
    quantity VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    loss_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dining_billing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Card',
    is_room_charge BOOLEAN DEFAULT false,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    room_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dining_inventory_items_hotel_id ON dining_inventory_items(hotel_id);
CREATE INDEX IF NOT EXISTS idx_dining_billing_records_hotel_id ON dining_billing_records(hotel_id);

-- ==========================================
-- SETUP & LICENSING (LOCAL HMS ONBOARDING)
-- ==========================================

-- 1. Hotel Global Settings (Phase 1 Setup)
CREATE TABLE IF NOT EXISTS hotel_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. License Storage (Phase 4 Validation)
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jwt_token TEXT NOT NULL,
    hardware_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- ==========================================
-- SALES & MARKETING TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS sales_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS sales_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    rate DECIMAL(10, 2) DEFAULT 0,
    ytd_revenue DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'Pending',
    priority VARCHAR(50) DEFAULT 'Medium',
    client VARCHAR(255),
    assigner VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ota_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20),
    bookings INT DEFAULT 0,
    room_nights INT DEFAULT 0,
    gross_revenue DECIMAL(15,2) DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    cancel_rate DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active'
);

-- ==========================================
-- STAFF & PAYROLL TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS staff_salaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    base_salary_monthly DECIMAL(10, 2) DEFAULT 0,
    daily_deduction DECIMAL(10, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- LEDGER TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS ledger_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash',
    reference_number VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- NOTIFICATIONS TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    notification_type VARCHAR(20) NOT NULL DEFAULT 'GLOBAL',
    priority VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    target_dept VARCHAR(50),
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sender_name VARCHAR(255) NOT NULL,
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS notification_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notification_id)
);


-- ==========================================
-- ADDITIONAL SALES & TRAVEL TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS sales_competitor_intel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    competitor_name VARCHAR(255) NOT NULL,
    pricing_strategy VARCHAR(255),
    occupancy_estimate DECIMAL(5,2),
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES sales_leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    activity_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_ota_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    ota_name VARCHAR(100) NOT NULL,
    ranking_score DECIMAL(5,2),
    conversion_rate DECIMAL(5,2),
    revenue_generated DECIMAL(15,2) DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES sales_leads(id) ON DELETE CASCADE,
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    quote_amount DECIMAL(12,2) NOT NULL,
    valid_until DATE,
    status VARCHAR(50) DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    season VARCHAR(100),
    base_rate DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    template_name VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS travel_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(100) NOT NULL,
    registration_number VARCHAR(100) NOT NULL UNIQUE,
    capacity INT DEFAULT 4,
    status VARCHAR(50) DEFAULT 'Available'
);

CREATE TABLE IF NOT EXISTS vehicle_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES travel_vehicles(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
    pickup_location VARCHAR(255),
    dropoff_location VARCHAR(255),
    booking_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed',
    fare DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- HR MODULE TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'Present',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS staff_leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
