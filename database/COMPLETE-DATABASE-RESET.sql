-- COMPLETE DATABASE RESET FOR KREATIVDENTAL PLUS
-- This will completely rebuild your database with the correct schema and real data
-- BACKUP YOUR DATA FIRST if you have any important patient/appointment data!

-- STEP 1: Drop all conflicting tables
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS clinic_expenses CASCADE;
DROP TABLE IF EXISTS dentists CASCADE;  -- Remove conflicting dentists table
DROP TABLE IF EXISTS staff CASCADE;     -- Remove conflicting staff table
DROP TABLE IF EXISTS profiles CASCADE;  -- Remove conflicting profiles table
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS kv_store_aed69b82 CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS financial_transactions CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS payroll CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
-- Keep staff_users but clean it

-- STEP 2: Clean staff_users table
DELETE FROM staff_users;

-- STEP 3: Create clean tables with correct structure
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_code VARCHAR(20) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  base_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  requires_dentist BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id UUID REFERENCES patients(id),
  dentist_id UUID REFERENCES staff_users(id),
  service_id UUID REFERENCES services(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  end_time TIME,
  room_number INTEGER,
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 4: Insert the 8 REAL KREATIVDENTAL PLUS DENTISTS into staff_users
INSERT INTO staff_users (
  employee_number,
  full_name,
  email,
  passcode,
  role,
  position,
  specialization,
  is_dentist,
  is_owner,
  is_admin,
  permissions,
  commission_rates,
  is_active,
  passcode_expires_at,
  can_change_passcode,
  passcode_reset_required,
  hire_date,
  last_passcode_change,
  hourly_rate,
  created_at,
  updated_at
) VALUES

-- 1. DRA. CAMILA CAÑARES-PRICE - Owner & Founder
('OWN001', 'Dra. Camila Cañares-Price', 'camila.canares@kreativdentalplus.com', '123456', 'admin', 'Owner & Founder', 'General Dentist', true, true, true, '{"all": true}', '{"owner_share": 0.45}', true, NOW() + INTERVAL '90 days', true, false, '2020-01-01', NOW(), 2500.00, NOW(), NOW()),

-- 2. DR. JEROME OH - Oral Surgeon, Endodontics Specialist
('DEN001', 'Dr. Jerome Oh', 'jerome.oh@kreativdentalplus.com', '234567', 'dentist', 'Oral Surgeon', 'Endodontics Specialist', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.40}', true, NOW() + INTERVAL '90 days', true, false, '2020-06-15', NOW(), 2000.00, NOW(), NOW()),

-- 3. DRA. CLENCY - Pediatric Dentist
('DEN002', 'Dra. Clency', 'clency@kreativdentalplus.com', '345678', 'dentist', 'Pediatric Dentist', 'Pediatric Dentistry', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.35}', true, NOW() + INTERVAL '90 days', true, false, '2020-08-20', NOW(), 1800.00, NOW(), NOW()),

-- 4. DRA. FATIMA PORCIUNCULA - Orthodontics
('DEN003', 'Dra. Fatima Porciuncula', 'fatima.porciuncula@kreativdentalplus.com', '456789', 'dentist', 'Orthodontist', 'Orthodontics', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.38}', true, NOW() + INTERVAL '90 days', true, false, '2021-02-10', NOW(), 1900.00, NOW(), NOW()),

-- 5. DRA. FEVI STELLA TORRALBA-PIO - General Dentist
('DEN004', 'Dra. Fevi Stella Torralba-Pio', 'fevi.torralba@kreativdentalplus.com', '567890', 'dentist', 'General Dentist', 'General Dentistry', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.32}', true, NOW() + INTERVAL '90 days', true, false, '2021-05-15', NOW(), 1700.00, NOW(), NOW()),

-- 6. DR. JONATHAN PINEDA - TMJ Specialist
('DEN005', 'Dr. Jonathan Pineda', 'jonathan.pineda@kreativdentalplus.com', '678901', 'dentist', 'TMJ Specialist', 'TMJ Specialist', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.42}', true, NOW() + INTERVAL '90 days', true, false, '2021-09-01', NOW(), 2100.00, NOW(), NOW()),

-- 7. DR. FELIPE SUPILANA - Dental Implant Specialist
('DEN006', 'Dr. Felipe Supilana', 'felipe.supilana@kreativdentalplus.com', '789012', 'dentist', 'Dental Implant Specialist', 'Dental Implant Specialist', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.45}', true, NOW() + INTERVAL '90 days', true, false, '2022-01-15', NOW(), 2200.00, NOW(), NOW()),

-- 8. DRA. SHIRLEY BAYOG - Cosmetic Dentistry
('DEN007', 'Dra. Shirley Bayog', 'shirley.bayog@kreativdentalplus.com', '890123', 'dentist', 'Cosmetic Dentist', 'Cosmetic Dentistry', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.40}', true, NOW() + INTERVAL '90 days', true, false, '2022-06-10', NOW(), 1950.00, NOW(), NOW()),

-- STAFF MEMBERS
-- 9. MS. JEZEL ROCHE - Senior Dental Assistant
('STF001', 'Ms. Jezel Roche', 'jezel.roche@kreativdentalplus.com', '111222', 'staff', 'Senior Dental Assistant', null, false, false, false, '{"appointments": "view", "patients": "view", "own_data": true, "payroll": true}', '{"assist_rate": 0.05}', true, NOW() + INTERVAL '90 days', true, false, '2020-03-15', NOW(), 850.00, NOW(), NOW()),

-- 10. MS. MHAY BLANQUEZA - Dental Hygienist
('STF002', 'Ms. Mhay Blanqueza', 'mhay.blanqueza@kreativdentalplus.com', '222333', 'staff', 'Dental Hygienist', null, false, false, false, '{"appointments": "view", "patients": "view", "own_data": true, "payroll": true}', '{"hygiene_rate": 0.08}', true, NOW() + INTERVAL '90 days', true, false, '2020-07-01', NOW(), 900.00, NOW(), NOW()),

-- 11. MS. ANDREA VILLAR - Treatment Coordinator
('STF003', 'Ms. Andrea Villar', 'andrea.villar@kreativdentalplus.com', '333444', 'staff', 'Treatment Coordinator', null, false, false, false, '{"appointments": "edit", "patients": "edit", "own_data": true, "payroll": true}', '{"coordination_rate": 0.03}', true, NOW() + INTERVAL '90 days', true, false, '2021-01-10', NOW(), 950.00, NOW(), NOW()),

-- 12. MS. ANGEL KAYE SARMIENTO - Employee Receptionist
('STF004', 'Ms. Angel Kaye Sarmiento', 'angel.sarmiento@kreativdentalplus.com', '444555', 'receptionist', 'Employee Receptionist', null, false, false, false, '{"appointments": "manage", "patients": "manage", "own_data": true, "payroll": true}', '{}', true, NOW() + INTERVAL '90 days', true, false, '2021-11-05', NOW(), 750.00, NOW(), NOW()),

-- 13. FRONT DESK TERMINAL - No payroll access
('FD001', 'Front Desk Terminal', 'frontdesk@kreativdentalplus.com', '999999', 'front_desk', 'Front Desk Terminal', null, false, false, false, '{"appointments": "manage", "patients": "manage", "services": "view", "inventory": "view", "reports": "basic", "payroll": false}', '{}', true, NOW() + INTERVAL '365 days', false, false, '2024-01-01', NOW(), 0.00, NOW(), NOW());

-- STEP 5: Add some essential dental services (empty tables were causing errors)
INSERT INTO services (service_code, name, category, duration_minutes, base_price, description) VALUES
('CLEAN001', 'Dental Cleaning', 'Preventive', 60, 2500.00, 'Regular dental cleaning and check-up'),
('FILL001', 'Dental Filling', 'Restorative', 45, 3500.00, 'Composite dental filling'),
('CROWN001', 'Dental Crown', 'Restorative', 120, 15000.00, 'Porcelain dental crown'),
('EXTRACT001', 'Tooth Extraction', 'Surgery', 30, 2000.00, 'Simple tooth extraction'),
('ORTHO001', 'Orthodontic Consultation', 'Orthodontics', 60, 1500.00, 'Initial orthodontic assessment'),
('IMPLANT001', 'Dental Implant', 'Surgery', 90, 25000.00, 'Single dental implant procedure');

-- STEP 6: Verification
SELECT '🦷 KREATIVDENTAL PLUS DATABASE RESET COMPLETE!' as status;

SELECT 'REAL DENTISTS INSTALLED:' as verification;
SELECT
  employee_number,
  full_name,
  specialization,
  position
FROM staff_users
WHERE is_dentist = true
ORDER BY employee_number;

SELECT 'STAFF MEMBERS:' as staff_verification;
SELECT
  employee_number,
  full_name,
  position,
  role
FROM staff_users
WHERE is_dentist = false
ORDER BY employee_number;

SELECT 'COUNTS:' as counts;
SELECT
  COUNT(CASE WHEN is_dentist = true THEN 1 END) as total_dentists,
  COUNT(CASE WHEN is_dentist = false THEN 1 END) as total_staff,
  COUNT(*) as total_all
FROM staff_users;