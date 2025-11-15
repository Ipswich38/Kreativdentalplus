-- AUDIT: Check current database state
-- Run this to see what's actually in your database right now

SELECT '=== CURRENT STAFF_USERS TABLE AUDIT ===' as audit_section;

-- Check if staff_users table exists
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_users')
    THEN 'staff_users table EXISTS'
    ELSE 'staff_users table MISSING'
  END as table_status;

-- Show all current staff members
SELECT '=== ALL CURRENT STAFF MEMBERS ===' as section;
SELECT
  employee_number,
  full_name,
  role,
  position,
  specialization,
  is_dentist,
  is_active,
  hourly_rate
FROM staff_users
ORDER BY
  CASE
    WHEN role = 'admin' THEN 1
    WHEN role = 'dentist' THEN 2
    ELSE 3
  END,
  employee_number;

-- Count dentists
SELECT '=== DENTIST COUNT ===' as section;
SELECT
  'Total dentists (including owner):' as label,
  COUNT(*) as count
FROM staff_users
WHERE is_dentist = true AND is_active = true;

-- Show only dentists
SELECT '=== CURRENT DENTISTS ONLY ===' as section;
SELECT
  employee_number,
  full_name,
  specialization,
  position,
  hourly_rate,
  created_at
FROM staff_users
WHERE is_dentist = true AND is_active = true
ORDER BY employee_number;

-- Check what the app would load for appointment booking
SELECT '=== WHAT APPOINTMENT SYSTEM LOADS ===' as section;
SELECT
  id,
  employee_number,
  full_name,
  specialization,
  position,
  hourly_rate,
  is_active
FROM staff_users
WHERE is_dentist = true
AND is_active = true
ORDER BY full_name;

-- Check table structure
SELECT '=== STAFF_USERS TABLE STRUCTURE ===' as section;
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'staff_users'
ORDER BY ordinal_position;

-- Check for any sample/fake data patterns
SELECT '=== CHECKING FOR FAKE DATA PATTERNS ===' as section;
SELECT
  employee_number,
  full_name,
  CASE
    WHEN full_name LIKE '%Santos%' OR full_name LIKE '%Rodriguez%' OR full_name LIKE '%Johnson%' OR full_name LIKE '%Kim%' OR full_name LIKE '%Martinez%'
    THEN '⚠️ FAKE NAME DETECTED'
    ELSE '✅ Real name'
  END as name_status
FROM staff_users
WHERE is_dentist = true;

SELECT 'AUDIT COMPLETE - Review results above' as final_status;