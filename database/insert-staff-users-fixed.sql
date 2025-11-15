-- INSERT PRODUCTION STAFF USERS FOR KREATIVDENTAL PLUS (FIXED VERSION)
-- This version works with the basic staff_users table structure

-- First, ensure required columns exist
DO $$
BEGIN
  -- Add department column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_users' AND column_name = 'department'
  ) THEN
    ALTER TABLE staff_users ADD COLUMN department TEXT;
  END IF;

  -- Add other missing columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_users' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE staff_users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_users' AND column_name = 'passcode_reset_required'
  ) THEN
    ALTER TABLE staff_users ADD COLUMN passcode_reset_required BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_users' AND column_name = 'last_passcode_change'
  ) THEN
    ALTER TABLE staff_users ADD COLUMN last_passcode_change TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_users' AND column_name = 'can_change_passcode'
  ) THEN
    ALTER TABLE staff_users ADD COLUMN can_change_passcode BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_users' AND column_name = 'passcode_expires_at'
  ) THEN
    ALTER TABLE staff_users ADD COLUMN passcode_expires_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_users' AND column_name = 'hire_date'
  ) THEN
    ALTER TABLE staff_users ADD COLUMN hire_date DATE DEFAULT CURRENT_DATE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_users' AND column_name = 'hourly_rate'
  ) THEN
    ALTER TABLE staff_users ADD COLUMN hourly_rate NUMERIC;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_users' AND column_name = 'specialization'
  ) THEN
    ALTER TABLE staff_users ADD COLUMN specialization TEXT;
  END IF;
END $$;

-- Clear any existing demo data first
DELETE FROM staff_users WHERE employee_number IN ('ADM-001', 'DEN-001', 'DEN-002', 'DEN-003', 'DEN-004', 'DEN-005', 'DEN-006', 'DEN-007', 'DEN-008', 'STF-001', 'STF-002', 'STF-003', 'STF-004', 'REC-001', 'OWN-001');

-- Insert 12 production staff members using only existing columns
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
  hourly_rate,
  department,
  permissions,
  commission_rates,
  is_active,
  passcode_expires_at,
  can_change_passcode,
  passcode_reset_required,
  hire_date,
  last_passcode_change,
  created_at,
  updated_at
) VALUES

-- 1. ADMIN/OWNER (1 person)
('OWN-001', 'Dr. Camila Cañares-Price', 'owner@kreativdentalplus.com', '123456', 'admin', 'Owner & Clinical Director', 'General Dentistry', true, true, true, 2500.00, 'Management', '{"all": true}', '{"owner_share": 0.45}', true, NOW() + INTERVAL '90 days', true, false, '2020-01-01', NOW(), NOW(), NOW()),

-- 2-9. DENTISTS (8 dentists)
('DEN-001', 'Dr. Jerome Oh', 'jerome.oh@kreativdentalplus.com', '234567', 'dentist', 'Endodontics Specialist', 'Endodontics', true, false, false, 1800.00, 'Clinical', '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.35}', true, NOW() + INTERVAL '90 days', true, false, '2020-06-15', NOW(), NOW(), NOW()),

('DEN-002', 'Dr. Maria Santos', 'maria.santos@kreativdentalplus.com', '345678', 'dentist', 'Orthodontics Specialist', 'Orthodontics', true, false, false, 1750.00, 'Clinical', '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.35}', true, NOW() + INTERVAL '90 days', true, false, '2020-08-20', NOW(), NOW(), NOW()),

('DEN-003', 'Dr. Carlos Rodriguez', 'carlos.rodriguez@kreativdentalplus.com', '456789', 'dentist', 'Oral Surgeon', 'Oral Surgery', true, false, false, 1900.00, 'Clinical', '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.40}', true, NOW() + INTERVAL '90 days', true, false, '2021-02-10', NOW(), NOW(), NOW()),

('DEN-004', 'Dr. Patricia Lim', 'patricia.lim@kreativdentalplus.com', '567890', 'dentist', 'Pediatric Dentist', 'Pediatric Dentistry', true, false, false, 1700.00, 'Clinical', '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.35}', true, NOW() + INTERVAL '90 days', true, false, '2021-05-15', NOW(), NOW(), NOW()),

('DEN-005', 'Dr. Michael Chen', 'michael.chen@kreativdentalplus.com', '678901', 'dentist', 'Prosthodontics Specialist', 'Prosthodontics', true, false, false, 1850.00, 'Clinical', '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.38}', true, NOW() + INTERVAL '90 days', true, false, '2021-09-01', NOW(), NOW(), NOW()),

('DEN-006', 'Dr. Sarah Johnson', 'sarah.johnson@kreativdentalplus.com', '789012', 'dentist', 'General Dentist', 'General Dentistry', true, false, false, 1650.00, 'Clinical', '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.32}', true, NOW() + INTERVAL '90 days', true, false, '2022-01-15', NOW(), NOW(), NOW()),

('DEN-007', 'Dr. Robert Kim', 'robert.kim@kreativdentalplus.com', '890123', 'dentist', 'Periodontics Specialist', 'Periodontics', true, false, false, 1800.00, 'Clinical', '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.36}', true, NOW() + INTERVAL '90 days', true, false, '2022-06-10', NOW(), NOW(), NOW()),

('DEN-008', 'Dr. Elena Martinez', 'elena.martinez@kreativdentalplus.com', '901234', 'dentist', 'Cosmetic Dentist', 'Cosmetic Dentistry', true, false, false, 1750.00, 'Clinical', '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.35}', true, NOW() + INTERVAL '90 days', true, false, '2023-03-20', NOW(), NOW(), NOW()),

-- 10-12. STAFF (4 staff members - Note: STF-004 is actually Front Desk, so making her receptionist role)
('STF-001', 'Ms. Jezel Roche', 'jezel.roche@kreativdentalplus.com', '111222', 'staff', 'Senior Dental Assistant', null, false, false, false, 850.00, 'Clinical Support', '{"appointments": "view", "patients": "view", "own_data": true}', '{"assist_rate": 0.05}', true, NOW() + INTERVAL '90 days', true, false, '2020-03-15', NOW(), NOW(), NOW()),

('STF-002', 'Ms. Mhay Blanqueza', 'mhay.blanqueza@kreativdentalplus.com', '222333', 'staff', 'Dental Hygienist', null, false, false, false, 900.00, 'Clinical Support', '{"appointments": "view", "patients": "view", "own_data": true}', '{"hygiene_rate": 0.08}', true, NOW() + INTERVAL '90 days', true, false, '2020-07-01', NOW(), NOW(), NOW()),

('STF-003', 'Ms. Andrea Villar', 'andrea.villar@kreativdentalplus.com', '333444', 'staff', 'Treatment Coordinator', null, false, false, false, 950.00, 'Patient Services', '{"appointments": "edit", "patients": "edit", "own_data": true}', '{"coordination_rate": 0.03}', true, NOW() + INTERVAL '90 days', true, false, '2021-01-10', NOW(), NOW(), NOW()),

('STF-004', 'Ms. Angel Kaye Sarmiento', 'angel.sarmiento@kreativdentalplus.com', '444555', 'receptionist', 'Front Desk Manager', null, false, false, false, 750.00, 'Administration', '{"appointments": "manage", "patients": "manage", "own_data": true}', '{}', true, NOW() + INTERVAL '90 days', true, false, '2021-11-05', NOW(), NOW(), NOW());

-- Verify the data was inserted
SELECT
  employee_number,
  full_name,
  role,
  position,
  is_active
FROM staff_users
WHERE employee_number IN ('OWN-001', 'DEN-001', 'DEN-002', 'DEN-003', 'DEN-004', 'DEN-005', 'DEN-006', 'DEN-007', 'DEN-008', 'STF-001', 'STF-002', 'STF-003', 'STF-004')
ORDER BY employee_number;