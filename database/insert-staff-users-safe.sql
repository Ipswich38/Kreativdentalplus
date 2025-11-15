-- SAFE INSERT OF PRODUCTION STAFF USERS FOR KREATIVDENTAL PLUS
-- This version handles enum constraints and existing data

-- First, let's check and update the role enum to include all needed values
DO $$
BEGIN
  -- Check if the enum type exists and what values it has
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    -- Add 'admin' to the enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'user_role' AND e.enumlabel = 'admin') THEN
      ALTER TYPE user_role ADD VALUE 'admin';
    END IF;

    -- Add other role values if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'user_role' AND e.enumlabel = 'dentist') THEN
      ALTER TYPE user_role ADD VALUE 'dentist';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'user_role' AND e.enumlabel = 'staff') THEN
      ALTER TYPE user_role ADD VALUE 'staff';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'user_role' AND e.enumlabel = 'receptionist') THEN
      ALTER TYPE user_role ADD VALUE 'receptionist';
    END IF;
  ELSE
    -- Create the enum type if it doesn't exist
    CREATE TYPE user_role AS ENUM ('admin', 'dentist', 'staff', 'receptionist');

    -- Update the column to use the enum if it's currently text
    ALTER TABLE staff_users ALTER COLUMN role TYPE user_role USING role::user_role;
  END IF;
END $$;

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add department column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_users' AND column_name = 'department'
  ) THEN
    ALTER TABLE staff_users ADD COLUMN department TEXT;
  END IF;

  -- Add other missing columns for compatibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_users' AND column_name = 'hourly_rate'
  ) THEN
    ALTER TABLE staff_users ADD COLUMN hourly_rate NUMERIC;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_users' AND column_name = 'hire_date'
  ) THEN
    ALTER TABLE staff_users ADD COLUMN hire_date DATE DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Clear any existing demo/test data first
DELETE FROM staff_users WHERE employee_number IN ('ADM-001', 'DEN-001', 'DEN-002', 'DEN-003', 'DEN-004', 'DEN-005', 'DEN-006', 'DEN-007', 'DEN-008', 'STF-001', 'STF-002', 'STF-003', 'STF-004', 'REC-001', 'OWN-001');

-- Insert the 12 production staff members
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
  department,
  created_at,
  updated_at
) VALUES

-- 1. OWNER/ADMIN (1 person)
('OWN-001', 'Dr. Camila Cañares-Price', 'owner@kreativdentalplus.com', '123456', 'admin', 'Owner & Clinical Director', 'General Dentistry', true, true, true, '{"all": true}', '{"owner_share": 0.45}', true, NOW() + INTERVAL '90 days', true, false, '2020-01-01', NOW(), 2500.00, 'Management', NOW(), NOW()),

-- 2-9. DENTISTS (8 dentists)
('DEN-001', 'Dr. Jerome Oh', 'jerome.oh@kreativdentalplus.com', '234567', 'dentist', 'Endodontics Specialist', 'Endodontics', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.35}', true, NOW() + INTERVAL '90 days', true, false, '2020-06-15', NOW(), 1800.00, 'Clinical', NOW(), NOW()),

('DEN-002', 'Dr. Maria Santos', 'maria.santos@kreativdentalplus.com', '345678', 'dentist', 'Orthodontics Specialist', 'Orthodontics', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.35}', true, NOW() + INTERVAL '90 days', true, false, '2020-08-20', NOW(), 1750.00, 'Clinical', NOW(), NOW()),

('DEN-003', 'Dr. Carlos Rodriguez', 'carlos.rodriguez@kreativdentalplus.com', '456789', 'dentist', 'Oral Surgeon', 'Oral Surgery', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.40}', true, NOW() + INTERVAL '90 days', true, false, '2021-02-10', NOW(), 1900.00, 'Clinical', NOW(), NOW()),

('DEN-004', 'Dr. Patricia Lim', 'patricia.lim@kreativdentalplus.com', '567890', 'dentist', 'Pediatric Dentist', 'Pediatric Dentistry', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.35}', true, NOW() + INTERVAL '90 days', true, false, '2021-05-15', NOW(), 1700.00, 'Clinical', NOW(), NOW()),

('DEN-005', 'Dr. Michael Chen', 'michael.chen@kreativdentalplus.com', '678901', 'dentist', 'Prosthodontics Specialist', 'Prosthodontics', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.38}', true, NOW() + INTERVAL '90 days', true, false, '2021-09-01', NOW(), 1850.00, 'Clinical', NOW(), NOW()),

('DEN-006', 'Dr. Sarah Johnson', 'sarah.johnson@kreativdentalplus.com', '789012', 'dentist', 'General Dentist', 'General Dentistry', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.32}', true, NOW() + INTERVAL '90 days', true, false, '2022-01-15', NOW(), 1650.00, 'Clinical', NOW(), NOW()),

('DEN-007', 'Dr. Robert Kim', 'robert.kim@kreativdentalplus.com', '890123', 'dentist', 'Periodontics Specialist', 'Periodontics', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.36}', true, NOW() + INTERVAL '90 days', true, false, '2022-06-10', NOW(), 1800.00, 'Clinical', NOW(), NOW()),

('DEN-008', 'Dr. Elena Martinez', 'elena.martinez@kreativdentalplus.com', '901234', 'dentist', 'Cosmetic Dentist', 'Cosmetic Dentistry', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.35}', true, NOW() + INTERVAL '90 days', true, false, '2023-03-20', NOW(), 1750.00, 'Clinical', NOW(), NOW()),

-- 10-12. STAFF (4 staff members)
('STF-001', 'Ms. Jezel Roche', 'jezel.roche@kreativdentalplus.com', '111222', 'staff', 'Senior Dental Assistant', null, false, false, false, '{"appointments": "view", "patients": "view", "own_data": true}', '{"assist_rate": 0.05}', true, NOW() + INTERVAL '90 days', true, false, '2020-03-15', NOW(), 850.00, 'Clinical Support', NOW(), NOW()),

('STF-002', 'Ms. Mhay Blanqueza', 'mhay.blanqueza@kreativdentalplus.com', '222333', 'staff', 'Dental Hygienist', null, false, false, false, '{"appointments": "view", "patients": "view", "own_data": true}', '{"hygiene_rate": 0.08}', true, NOW() + INTERVAL '90 days', true, false, '2020-07-01', NOW(), 900.00, 'Clinical Support', NOW(), NOW()),

('STF-003', 'Ms. Andrea Villar', 'andrea.villar@kreativdentalplus.com', '333444', 'staff', 'Treatment Coordinator', null, false, false, false, '{"appointments": "edit", "patients": "edit", "own_data": true}', '{"coordination_rate": 0.03}', true, NOW() + INTERVAL '90 days', true, false, '2021-01-10', NOW(), 950.00, 'Patient Services', NOW(), NOW()),

('STF-004', 'Ms. Angel Kaye Sarmiento', 'angel.sarmiento@kreativdentalplus.com', '444555', 'receptionist', 'Front Desk Manager', null, false, false, false, '{"appointments": "manage", "patients": "manage", "own_data": true}', '{}', true, NOW() + INTERVAL '90 days', true, false, '2021-11-05', NOW(), 750.00, 'Administration', NOW(), NOW());

-- Verify the data was inserted successfully
SELECT
  employee_number,
  full_name,
  role,
  position,
  is_active,
  email
FROM staff_users
WHERE employee_number IN ('OWN-001', 'DEN-001', 'DEN-002', 'DEN-003', 'DEN-004', 'DEN-005', 'DEN-006', 'DEN-007', 'DEN-008', 'STF-001', 'STF-002', 'STF-003', 'STF-004')
ORDER BY employee_number;