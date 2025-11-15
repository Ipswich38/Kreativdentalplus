-- STEP 3: CREATE PRODUCTION TABLES
-- Run this to create all the necessary tables for the dental management system

-- 1. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_number VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  medical_history TEXT,
  dental_history TEXT,
  insurance_provider VARCHAR(255),
  insurance_policy_number VARCHAR(100),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES staff_users(id)
);

-- 2. SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  base_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  requires_dentist BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id),
  dentist_id UUID NOT NULL REFERENCES staff_users(id),
  service_id UUID NOT NULL REFERENCES services(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  end_time TIME,
  room_number INTEGER,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES staff_users(id)
);

-- 4. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_users(id),
  clock_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out_time TIMESTAMP WITH TIME ZONE,
  break_start_time TIMESTAMP WITH TIME ZONE,
  break_end_time TIMESTAMP WITH TIME ZONE,
  total_hours DECIMAL(5,2),
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'sick', 'vacation')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PAYROLL TABLE
CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_users(id),
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  total_hours DECIMAL(5,2) NOT NULL,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  base_pay DECIMAL(10,2) NOT NULL,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  commission DECIMAL(10,2) DEFAULT 0,
  bonus DECIMAL(10,2) DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  gross_pay DECIMAL(10,2) NOT NULL,
  net_pay DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES staff_users(id),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- 6. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  unit_of_measure VARCHAR(20) NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  maximum_stock INTEGER NOT NULL DEFAULT 100,
  unit_cost DECIMAL(10,2),
  supplier VARCHAR(255),
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. FINANCIAL_TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  appointment_id UUID REFERENCES appointments(id),
  patient_id UUID REFERENCES patients(id),
  staff_id UUID REFERENCES staff_users(id),
  transaction_date DATE NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES staff_users(id)
);

-- INSERT SAMPLE SERVICES
INSERT INTO services (service_code, name, description, category, duration_minutes, base_price, requires_dentist) VALUES
('CLN001', 'Regular Cleaning', 'Routine dental cleaning and checkup', 'Preventive', 45, 150.00, false),
('FIL001', 'Tooth Filling', 'Composite tooth filling', 'Restorative', 60, 250.00, true),
('EXT001', 'Tooth Extraction', 'Simple tooth extraction', 'Surgical', 30, 300.00, true),
('RC001', 'Root Canal Treatment', 'Endodontic root canal therapy', 'Endodontic', 90, 800.00, true),
('CRN001', 'Crown Placement', 'Dental crown installation', 'Restorative', 120, 1200.00, true),
('WHI001', 'Teeth Whitening', 'Professional teeth whitening', 'Cosmetic', 90, 500.00, true),
('ORN001', 'Orthodontic Consultation', 'Braces and alignment consultation', 'Orthodontic', 60, 200.00, true),
('IMP001', 'Dental Implant', 'Single tooth implant', 'Surgical', 180, 2500.00, true),
('CHK001', 'General Checkup', 'Routine dental examination', 'Preventive', 30, 100.00, true),
('XRA001', 'X-Ray', 'Dental X-ray imaging', 'Diagnostic', 15, 75.00, false);

-- INSERT SAMPLE PATIENTS
INSERT INTO patients (patient_number, first_name, last_name, date_of_birth, gender, phone, email, address) VALUES
('PAT001', 'John', 'Doe', '1985-05-15', 'Male', '+639171234567', 'john.doe@email.com', '123 Main St, Quezon City'),
('PAT002', 'Jane', 'Smith', '1990-08-22', 'Female', '+639181234567', 'jane.smith@email.com', '456 Oak Ave, Makati City'),
('PAT003', 'Robert', 'Johnson', '1975-12-03', 'Male', '+639191234567', 'robert.j@email.com', '789 Pine Rd, Pasig City'),
('PAT004', 'Maria', 'Garcia', '1988-03-17', 'Female', '+639201234567', 'maria.garcia@email.com', '321 Elm St, Taguig City'),
('PAT005', 'David', 'Brown', '1992-11-28', 'Male', '+639211234567', 'david.brown@email.com', '654 Maple Dr, Mandaluyong'),
('PAT006', 'Lisa', 'Wilson', '1983-07-09', 'Female', '+639221234567', 'lisa.wilson@email.com', '987 Cedar Ln, Ortigas'),
('PAT007', 'Michael', 'Davis', '1979-04-14', 'Male', '+639231234567', 'michael.davis@email.com', '147 Birch St, BGC'),
('PAT008', 'Sarah', 'Miller', '1995-01-25', 'Female', '+639241234567', 'sarah.miller@email.com', '258 Spruce Ave, Alabang'),
('PAT009', 'Christopher', 'Taylor', '1987-09-08', 'Male', '+639251234567', 'chris.taylor@email.com', '369 Willow Rd, Greenhills'),
('PAT010', 'Amanda', 'Anderson', '1991-06-12', 'Female', '+639261234567', 'amanda.anderson@email.com', '741 Ash St, San Juan');

-- INSERT SAMPLE INVENTORY ITEMS
INSERT INTO inventory (item_code, name, description, category, unit_of_measure, current_stock, minimum_stock, unit_cost, supplier) VALUES
('DEN001', 'Disposable Gloves', 'Latex-free disposable gloves', 'Safety', 'boxes', 50, 10, 25.00, 'Medical Supplies Inc'),
('DEN002', 'Face Masks', 'Surgical face masks', 'Safety', 'boxes', 30, 5, 15.00, 'Safety First Co'),
('DEN003', 'Dental Needles', '27G dental injection needles', 'Instruments', 'boxes', 25, 5, 45.00, 'Dental Tools Ltd'),
('DEN004', 'Amalgam Filling', 'Silver amalgam filling material', 'Materials', 'units', 20, 3, 80.00, 'Dental Materials Co'),
('DEN005', 'Composite Resin', 'Tooth-colored filling material', 'Materials', 'units', 35, 8, 120.00, 'Modern Dental Supply'),
('DEN006', 'Local Anesthetic', 'Lidocaine with epinephrine', 'Medications', 'vials', 40, 10, 30.00, 'Pharma Dental'),
('DEN007', 'Impression Material', 'Alginate impression powder', 'Materials', 'kg', 15, 3, 200.00, 'Impression Supplies'),
('DEN008', 'Dental Burs', 'High-speed diamond burs set', 'Instruments', 'sets', 10, 2, 150.00, 'Precision Tools'),
('DEN009', 'Sterilization Pouches', 'Autoclave sterilization pouches', 'Safety', 'boxes', 45, 8, 35.00, 'Sterilize Pro'),
('DEN010', 'Fluoride Treatment', 'Professional fluoride gel', 'Materials', 'tubes', 28, 5, 40.00, 'Preventive Care Co');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_dentist ON appointments(dentist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_attendance_staff ON attendance(staff_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(clock_in_time);
CREATE INDEX IF NOT EXISTS idx_payroll_staff ON payroll(staff_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON financial_transactions(transaction_date);

-- Enable RLS (Row Level Security) on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic access for authenticated users)
CREATE POLICY "Allow authenticated users to view patients" ON patients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert patients" ON patients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update patients" ON patients FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view services" ON services FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to view appointments" ON appointments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert appointments" ON appointments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update appointments" ON appointments FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view attendance" ON attendance FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert attendance" ON attendance FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update attendance" ON attendance FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view payroll" ON payroll FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to view inventory" ON inventory FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update inventory" ON inventory FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view transactions" ON financial_transactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert transactions" ON financial_transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Verify tables were created
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('patients', 'services', 'appointments', 'attendance', 'payroll', 'inventory', 'financial_transactions')
ORDER BY table_name;