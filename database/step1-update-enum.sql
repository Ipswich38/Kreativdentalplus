-- STEP 1: UPDATE ENUM VALUES (Run this first, then run step 2)
-- This must be in a separate transaction due to PostgreSQL enum limitations

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

    -- Add new receptionist role specifically for front desk without payroll access
    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'user_role' AND e.enumlabel = 'front_desk') THEN
      ALTER TYPE user_role ADD VALUE 'front_desk';
    END IF;
  ELSE
    -- Create the enum type if it doesn't exist
    CREATE TYPE user_role AS ENUM ('admin', 'dentist', 'staff', 'receptionist', 'front_desk');

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

-- Show current enum values to confirm
SELECT e.enumlabel as role_values
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;