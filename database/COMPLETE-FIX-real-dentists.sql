-- COMPLETE FIX: Replace ALL dentist data with real KreativDental Plus team
-- This will forcefully update your database with the correct dentists

-- STEP 1: Completely remove all current dentist records
DELETE FROM staff_users WHERE is_dentist = true;

-- STEP 2: Insert the REAL 8 KreativDental Plus dentists
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
('DEN001', 'Dr. Jerome Oh', 'jerome.oh@kreativdentalplus.com', '234567', 'dentist', 'Oral Surgeon, Endodontics Specialist', 'Endodontics Specialist', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.40}', true, NOW() + INTERVAL '90 days', true, false, '2020-06-15', NOW(), 2000.00, NOW(), NOW()),

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
('DEN007', 'Dra. Shirley Bayog', 'shirley.bayog@kreativdentalplus.com', '890123', 'dentist', 'Cosmetic Dentist', 'Cosmetic Dentistry', true, false, false, '{"appointments": true, "patients": true, "own_data": true}', '{"treatment_rate": 0.40}', true, NOW() + INTERVAL '90 days', true, false, '2022-06-10', NOW(), 1950.00, NOW(), NOW());

-- STEP 3: Verify the fix worked
SELECT '✅ REAL KREATIVDENTAL PLUS DENTISTS INSTALLED:' as status;

SELECT
  employee_number,
  full_name,
  specialization,
  position,
  hourly_rate
FROM staff_users
WHERE is_dentist = true AND is_active = true
ORDER BY
  CASE
    WHEN employee_number = 'OWN001' THEN 1
    ELSE 2
  END,
  employee_number;

-- Count verification
SELECT
  'Total Active Dentists:' as label,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) = 8 THEN '✅ CORRECT COUNT'
    ELSE '❌ WRONG COUNT'
  END as status
FROM staff_users
WHERE is_dentist = true AND is_active = true;

SELECT '🦷 KREATIVDENTAL PLUS TEAM SUCCESSFULLY UPDATED!' as final_message;