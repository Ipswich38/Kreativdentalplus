-- FIXED ADAPTIVE SCHEMA UPDATE
-- This script adapts to your existing database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to safely add columns if they don't exist
CREATE OR REPLACE FUNCTION add_column_if_not_exists(target_table TEXT, target_column TEXT, column_type TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = target_table
    AND column_name = target_column
  ) THEN
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I %s', target_table, target_column, column_type);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'dentist', 'receptionist', 'staff')),
  employee_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Ensure profiles table has all required columns
SELECT add_column_if_not_exists('profiles', 'employee_id', 'TEXT UNIQUE');
SELECT add_column_if_not_exists('profiles', 'role', 'TEXT DEFAULT ''staff''');

-- Create patients table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  age INTEGER,
  gender TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  medical_history TEXT,
  allergies TEXT,
  medications TEXT,
  insurance_type TEXT,
  insurance_provider TEXT,
  insurance_card_number TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_visit DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure patients table has all required columns
SELECT add_column_if_not_exists('patients', 'age', 'INTEGER');
SELECT add_column_if_not_exists('patients', 'gender', 'TEXT');
SELECT add_column_if_not_exists('patients', 'city', 'TEXT');
SELECT add_column_if_not_exists('patients', 'province', 'TEXT');
SELECT add_column_if_not_exists('patients', 'medications', 'TEXT');
SELECT add_column_if_not_exists('patients', 'insurance_type', 'TEXT');
SELECT add_column_if_not_exists('patients', 'insurance_provider', 'TEXT');
SELECT add_column_if_not_exists('patients', 'insurance_card_number', 'TEXT');
SELECT add_column_if_not_exists('patients', 'status', 'TEXT DEFAULT ''active''');
SELECT add_column_if_not_exists('patients', 'last_visit', 'DATE');

-- Create services table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure services table has all required columns
SELECT add_column_if_not_exists('services', 'name', 'TEXT NOT NULL DEFAULT ''''');
SELECT add_column_if_not_exists('services', 'description', 'TEXT');
SELECT add_column_if_not_exists('services', 'price', 'DECIMAL(10,2) NOT NULL DEFAULT 0');
SELECT add_column_if_not_exists('services', 'duration', 'INTEGER NOT NULL DEFAULT 30');
SELECT add_column_if_not_exists('services', 'category', 'TEXT');
SELECT add_column_if_not_exists('services', 'is_active', 'BOOLEAN DEFAULT TRUE');

-- Create staff table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialization TEXT,
  license_number TEXT,
  hire_date DATE NOT NULL,
  hourly_rate DECIMAL(8,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure staff table has all required columns
SELECT add_column_if_not_exists('staff', 'profile_id', 'UUID');
SELECT add_column_if_not_exists('staff', 'specialization', 'TEXT');
SELECT add_column_if_not_exists('staff', 'license_number', 'TEXT');
SELECT add_column_if_not_exists('staff', 'hire_date', 'DATE NOT NULL DEFAULT CURRENT_DATE');
SELECT add_column_if_not_exists('staff', 'hourly_rate', 'DECIMAL(8,2)');
SELECT add_column_if_not_exists('staff', 'is_active', 'BOOLEAN DEFAULT TRUE');

-- Create appointments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  dentist_id UUID REFERENCES public.staff(id) ON DELETE RESTRICT,
  service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure appointments table has all required columns
SELECT add_column_if_not_exists('appointments', 'patient_id', 'UUID');
SELECT add_column_if_not_exists('appointments', 'dentist_id', 'UUID');
SELECT add_column_if_not_exists('appointments', 'service_id', 'UUID');
SELECT add_column_if_not_exists('appointments', 'appointment_date', 'DATE NOT NULL DEFAULT CURRENT_DATE');
SELECT add_column_if_not_exists('appointments', 'appointment_time', 'TIME NOT NULL DEFAULT ''09:00''');
SELECT add_column_if_not_exists('appointments', 'duration', 'INTEGER NOT NULL DEFAULT 30');
SELECT add_column_if_not_exists('appointments', 'status', 'TEXT DEFAULT ''scheduled''');

-- Create attendance table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIME,
  clock_out TIME,
  break_duration INTEGER DEFAULT 0,
  total_hours DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, date)
);

-- Create payroll table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payroll (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  hours_worked DECIMAL(6,2) NOT NULL,
  regular_hours DECIMAL(6,2) NOT NULL,
  overtime_hours DECIMAL(6,2) DEFAULT 0,
  gross_pay DECIMAL(10,2) NOT NULL,
  deductions DECIMAL(10,2) DEFAULT 0,
  net_pay DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(8,2) NOT NULL,
  supplier TEXT,
  reorder_level INTEGER DEFAULT 10,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'insurance_claim')),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'insurance', 'bank_transfer')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes safely
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointments_date') THEN
    CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointments_dentist') THEN
    CREATE INDEX idx_appointments_dentist ON public.appointments(dentist_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointments_patient') THEN
    CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_employee_id') THEN
    CREATE INDEX idx_profiles_employee_id ON public.profiles(employee_id);
  END IF;
END $$;

-- Create updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers safely
DO $$
DECLARE
  has_updated_at BOOLEAN;
BEGIN
  -- Profiles trigger
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) INTO has_updated_at;

  IF has_updated_at THEN
    DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
    CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;

  -- Patients trigger
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'updated_at'
  ) INTO has_updated_at;

  IF has_updated_at THEN
    DROP TRIGGER IF EXISTS handle_updated_at ON public.patients;
    CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;

  -- Services trigger
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'updated_at'
  ) INTO has_updated_at;

  IF has_updated_at THEN
    DROP TRIGGER IF EXISTS handle_updated_at ON public.services;
    CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;

  -- Staff trigger
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff' AND column_name = 'updated_at'
  ) INTO has_updated_at;

  IF has_updated_at THEN
    DROP TRIGGER IF EXISTS handle_updated_at ON public.staff;
    CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;

  -- Appointments trigger
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'updated_at'
  ) INTO has_updated_at;

  IF has_updated_at THEN
    DROP TRIGGER IF EXISTS handle_updated_at ON public.appointments;
    CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Enable RLS on tables that exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff') THEN
    ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendance') THEN
    ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payroll') THEN
    ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
    ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
    ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create RLS policies safely
DO $$
BEGIN
  -- Profiles policies
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

  -- Patients policies
  DROP POLICY IF EXISTS "Authenticated users can access patients" ON public.patients;
  CREATE POLICY "Authenticated users can access patients" ON public.patients FOR ALL USING (auth.role() = 'authenticated');

  -- Services policies
  DROP POLICY IF EXISTS "Authenticated users can read services" ON public.services;
  CREATE POLICY "Authenticated users can read services" ON public.services FOR SELECT USING (auth.role() = 'authenticated');

  -- Admin services policy (only if profiles table has role column)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
    CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );
  END IF;

  -- Basic policies for other tables
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff') THEN
    DROP POLICY IF EXISTS "Authenticated users can access staff" ON public.staff;
    CREATE POLICY "Authenticated users can access staff" ON public.staff FOR ALL USING (auth.role() = 'authenticated');
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    DROP POLICY IF EXISTS "Authenticated users can access appointments" ON public.appointments;
    CREATE POLICY "Authenticated users can access appointments" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
    DROP POLICY IF EXISTS "Authenticated users can access inventory" ON public.inventory;
    CREATE POLICY "Authenticated users can access inventory" ON public.inventory FOR ALL USING (auth.role() = 'authenticated');
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
    DROP POLICY IF EXISTS "Authenticated users can access transactions" ON public.transactions;
    CREATE POLICY "Authenticated users can access transactions" ON public.transactions FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Insert services only if the table has the required columns
DO $$
DECLARE
  has_name BOOLEAN;
  has_price BOOLEAN;
BEGIN
  -- Check if services table has required columns
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'name'
  ) INTO has_name;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'price'
  ) INTO has_price;

  IF has_name AND has_price THEN
    -- Insert services with conflict handling
    INSERT INTO public.services (name, description, price, duration, category) VALUES
    ('Dental Cleaning', 'Regular dental cleaning and checkup', 1500.00, 60, 'Preventive'),
    ('Oral Prophylaxis - Simple', 'Basic oral prophylaxis', 1500.00, 45, 'Preventive'),
    ('Oral Prophylaxis - Deep Cleaning', 'Deep cleaning for advanced cases', 3500.00, 90, 'Preventive'),
    ('Dental Filling', 'Composite filling for cavities', 2000.00, 45, 'Restorative'),
    ('Root Canal', 'Root canal treatment', 8000.00, 120, 'Endodontic'),
    ('Tooth Extraction', 'Simple tooth extraction', 3000.00, 30, 'Oral Surgery'),
    ('Dental Crown', 'Porcelain crown placement', 10000.00, 120, 'Restorative'),
    ('Teeth Whitening', 'Professional teeth whitening treatment', 18000.00, 75, 'Cosmetic'),
    ('X-Ray', 'Dental radiograph', 500.00, 15, 'Diagnostic'),
    ('Emergency Consultation', 'Urgent dental consultation', 1500.00, 30, 'Emergency')
    ON CONFLICT (name) DO NOTHING;
  END IF;
END $$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Clean up the helper function
DROP FUNCTION IF EXISTS add_column_if_not_exists;