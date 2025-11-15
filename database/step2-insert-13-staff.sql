-- STEP 2: INSERT 13 STAFF MEMBERS (Run this AFTER step 1)
-- This includes 12 employees + 1 dedicated front desk account

-- Clear any existing demo/test data first
DELETE FROM staff_users WHERE employee_number IN ('ADM001', 'DEN001', 'DEN002', 'DEN003', 'DEN004', 'DEN005', 'DEN006', 'DEN007', 'DEN008', 'STF001', 'STF002', 'STF003', 'STF004', 'REC001', 'OWN001', 'FD001');

-- Insert the 13 production staff members (12 employees + 1 front desk account)
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

-- 1. OWNER/ADMIN + DENTIST (1 person)
('OWN001', 'Dra. Camila Cañares-Price', 'owner@kreativdentalplus.com', '123456', 'admin', 'Owner & Founder', 'General Dentist', true, true, true, '{"all": true}', '{"owner_share": 0.45}', true, NOW() + INTERVAL '90 days', true, false, '2020-01-01', NOW(), 2500.00, NOW(), NOW()),

-- 2-8. REAL DENTISTS (7 dentists)
('DEN001', 'Dr. Jerome Oh', 'jerome.oh@kreativdentalplus.com', '234567', 'dentist', 'Oral Surgeon', 'Endodontics Specialist', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.40}', true, NOW() + INTERVAL '90 days', true, false, '2020-06-15', NOW(), 2000.00, NOW(), NOW()),

('DEN002', 'Dra. Clency', 'clency@kreativdentalplus.com', '345678', 'dentist', 'Pediatric Dentist', 'Pediatric Dentistry', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.35}', true, NOW() + INTERVAL '90 days', true, false, '2020-08-20', NOW(), 1800.00, NOW(), NOW()),

('DEN003', 'Dra. Fatima Porciuncula', 'fatima.porciuncula@kreativdentalplus.com', '456789', 'dentist', 'Orthodontist', 'Orthodontics', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.38}', true, NOW() + INTERVAL '90 days', true, false, '2021-02-10', NOW(), 1900.00, NOW(), NOW()),

('DEN004', 'Dra. Fevi Stella Torralba-Pio', 'fevi.torralba@kreativdentalplus.com', '567890', 'dentist', 'General Dentist', 'General Dentistry', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.32}', true, NOW() + INTERVAL '90 days', true, false, '2021-05-15', NOW(), 1700.00, NOW(), NOW()),

('DEN005', 'Dr. Jonathan Pineda', 'jonathan.pineda@kreativdentalplus.com', '678901', 'dentist', 'TMJ Specialist', 'TMJ Specialist', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.42}', true, NOW() + INTERVAL '90 days', true, false, '2021-09-01', NOW(), 2100.00, NOW(), NOW()),

('DEN006', 'Dr. Felipe Supilana', 'felipe.supilana@kreativdentalplus.com', '789012', 'dentist', 'Dental Implant Specialist', 'Dental Implant Specialist', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.45}', true, NOW() + INTERVAL '90 days', true, false, '2022-01-15', NOW(), 2200.00, NOW(), NOW()),

('DEN007', 'Dra. Shirley Bayog', 'shirley.bayog@kreativdentalplus.com', '890123', 'dentist', 'Cosmetic Dentist', 'Cosmetic Dentistry', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.40}', true, NOW() + INTERVAL '90 days', true, false, '2022-06-10', NOW(), 1950.00, NOW(), NOW()),

-- 10-12. STAFF (3 staff members - these have access to their payroll)
('STF001', 'Ms. Jezel Roche', 'jezel.roche@kreativdentalplus.com', '111222', 'staff', 'Senior Dental Assistant', null, false, false, false, '{"appointments": "view", "patients": "view", "own_data": true, "payroll": true}', '{"assist_rate": 0.05}', true, NOW() + INTERVAL '90 days', true, false, '2020-03-15', NOW(), 850.00, NOW(), NOW()),

('STF002', 'Ms. Mhay Blanqueza', 'mhay.blanqueza@kreativdentalplus.com', '222333', 'staff', 'Dental Hygienist', null, false, false, false, '{"appointments": "view", "patients": "view", "own_data": true, "payroll": true}', '{"hygiene_rate": 0.08}', true, NOW() + INTERVAL '90 days', true, false, '2020-07-01', NOW(), 900.00, NOW(), NOW()),

('STF003', 'Ms. Andrea Villar', 'andrea.villar@kreativdentalplus.com', '333444', 'staff', 'Treatment Coordinator', null, false, false, false, '{"appointments": "edit", "patients": "edit", "own_data": true, "payroll": true}', '{"coordination_rate": 0.03}', true, NOW() + INTERVAL '90 days', true, false, '2021-01-10', NOW(), 950.00, NOW(), NOW()),

-- 13. EMPLOYEE RECEPTIONIST (has payroll access)
('STF004', 'Ms. Angel Kaye Sarmiento', 'angel.sarmiento@kreativdentalplus.com', '444555', 'receptionist', 'Employee Receptionist', null, false, false, false, '{"appointments": "manage", "patients": "manage", "own_data": true, "payroll": true}', '{}', true, NOW() + INTERVAL '90 days', true, false, '2021-11-05', NOW(), 750.00, NOW(), NOW()),

-- 14. DEDICATED FRONT DESK (NO payroll access - for anyone to use)
('FD001', 'Front Desk Terminal', 'frontdesk@kreativdentalplus.com', '999999', 'front_desk', 'Front Desk Terminal', null, false, false, false, '{"appointments": "manage", "patients": "manage", "services": "view", "inventory": "view", "reports": "basic", "payroll": false}', '{}', true, NOW() + INTERVAL '365 days', false, false, '2024-01-01', NOW(), 0.00, NOW(), NOW());

-- Verify the data was inserted successfully
SELECT
  employee_number,
  full_name,
  role,
  position,
  is_active,
  CASE
    WHEN role = 'front_desk' THEN 'NO PAYROLL ACCESS'
    ELSE 'Has Payroll Access'
  END as payroll_access
FROM staff_users
WHERE employee_number IN ('OWN001', 'DEN001', 'DEN002', 'DEN003', 'DEN004', 'DEN005', 'DEN006', 'DEN007', 'DEN008', 'STF001', 'STF002', 'STF003', 'STF004', 'FD001')
ORDER BY
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'dentist' THEN 2
    WHEN 'staff' THEN 3
    WHEN 'receptionist' THEN 4
    WHEN 'front_desk' THEN 5
  END,
  employee_number;