-- EMERGENCY AUDIT: Check what's actually in staff_users table RIGHT NOW
-- Run this in Supabase SQL Editor to see current state

SELECT '=== CURRENT STAFF_USERS DATA ===' as section;

-- Check if staff_users has any data
SELECT
  COUNT(*) as total_rows,
  COUNT(CASE WHEN is_dentist = true THEN 1 END) as total_dentists,
  COUNT(CASE WHEN is_dentist = true AND is_active = true THEN 1 END) as active_dentists
FROM staff_users;

-- Show all current staff_users data
SELECT
  employee_number,
  full_name,
  role,
  position,
  specialization,
  is_dentist,
  is_active,
  email
FROM staff_users
ORDER BY
  CASE WHEN is_dentist = true THEN 1 ELSE 2 END,
  employee_number;

SELECT '=== CHECK OTHER TABLES ===' as section;

-- Check dentists table
SELECT 'DENTISTS TABLE:' as table_name;
SELECT id, name, specialization FROM dentists LIMIT 10;

-- Check profiles table
SELECT 'PROFILES TABLE:' as table_name;
SELECT id, email, full_name, role FROM profiles LIMIT 10;

-- Check if staff_users is empty but other tables have data
SELECT '=== SUMMARY ===' as section;
SELECT
  'staff_users' as table_name,
  COUNT(*) as row_count
FROM staff_users
UNION ALL
SELECT
  'dentists' as table_name,
  COUNT(*) as row_count
FROM dentists
UNION ALL
SELECT
  'profiles' as table_name,
  COUNT(*) as row_count
FROM profiles;