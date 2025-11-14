-- DIAGNOSTIC SCRIPT: Check existing table structures
-- Run this first to see what tables and columns you have

-- Check what tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check services table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'services'
ORDER BY ordinal_position;

-- Check patients table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'patients'
ORDER BY ordinal_position;

-- Check appointments table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'appointments'
ORDER BY ordinal_position;

-- Check all existing tables and their columns
SELECT t.table_name, c.column_name, c.data_type
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;