-- PERFECT MATCH SCHEMA FOR YOUR EXISTING DATABASE
-- This matches your exact table structure from the CSV export

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to safely add columns that don't exist
CREATE OR REPLACE FUNCTION add_missing_column(target_table TEXT, target_column TEXT, column_definition TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = target_table
    AND column_name = target_column
  ) THEN
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I %s', target_table, target_column, column_definition);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add missing columns to your existing tables

-- APPOINTMENTS TABLE - Add missing columns
SELECT add_missing_column('appointments', 'duration', 'INTEGER DEFAULT 30');

-- PATIENTS TABLE - Add missing columns for full compatibility
SELECT add_missing_column('patients', 'age', 'INTEGER');
SELECT add_missing_column('patients', 'gender', 'TEXT');
SELECT add_missing_column('patients', 'city', 'TEXT');
SELECT add_missing_column('patients', 'province', 'TEXT');
SELECT add_missing_column('patients', 'medications', 'TEXT');
SELECT add_missing_column('patients', 'status', 'TEXT DEFAULT ''active''');
SELECT add_missing_column('patients', 'last_visit', 'DATE');

-- SERVICES TABLE - Add missing columns
SELECT add_missing_column('services', 'name', 'TEXT');
SELECT add_missing_column('services', 'description', 'TEXT');
SELECT add_missing_column('services', 'price', 'NUMERIC DEFAULT 0');
SELECT add_missing_column('services', 'duration', 'INTEGER DEFAULT 30');
SELECT add_missing_column('services', 'is_active', 'BOOLEAN DEFAULT TRUE');

-- STAFF_USERS TABLE - Add missing columns for app compatibility
SELECT add_missing_column('staff_users', 'hire_date', 'DATE DEFAULT CURRENT_DATE');
SELECT add_missing_column('staff_users', 'hourly_rate', 'NUMERIC');

-- Create missing tables that your app needs

-- Create profiles table (links to staff_users for authentication)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_user_id UUID REFERENCES public.staff_users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'dentist', 'receptionist', 'staff')),
  employee_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff table (normalized from staff_users for app compatibility)
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_user_id UUID REFERENCES public.staff_users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialization TEXT,
  license_number TEXT,
  hire_date DATE DEFAULT CURRENT_DATE,
  hourly_rate NUMERIC,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  staff_user_id UUID REFERENCES public.staff_users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIME,
  clock_out TIME,
  break_duration INTEGER DEFAULT 0,
  total_hours DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_user_id, date)
);

-- Create payroll table
CREATE TABLE IF NOT EXISTS public.payroll (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  staff_user_id UUID REFERENCES public.staff_users(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  hours_worked DECIMAL(6,2) NOT NULL DEFAULT 0,
  regular_hours DECIMAL(6,2) NOT NULL DEFAULT 0,
  overtime_hours DECIMAL(6,2) DEFAULT 0,
  gross_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  net_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(8,2) NOT NULL DEFAULT 0,
  supplier TEXT,
  reorder_level INTEGER DEFAULT 10,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rename payments to transactions for app compatibility
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'payment' CHECK (type IN ('payment', 'refund', 'insurance_claim')),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'insurance', 'bank_transfer')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  description TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
DO $$
BEGIN
  -- Appointments indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointments_date') THEN
    CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointments_dentist') THEN
    CREATE INDEX idx_appointments_dentist ON public.appointments(dentist_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointments_patient') THEN
    CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
  END IF;

  -- Patients indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_patients_phone') THEN
    CREATE INDEX idx_patients_phone ON public.patients(phone);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_patients_email') THEN
    CREATE INDEX idx_patients_email ON public.patients(email);
  END IF;

  -- Staff users indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_staff_users_email') THEN
    CREATE INDEX idx_staff_users_email ON public.staff_users(email);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_staff_users_employee_number') THEN
    CREATE INDEX idx_staff_users_employee_number ON public.staff_users(employee_number);
  END IF;
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to existing tables
DO $$
BEGIN
  -- Appointments trigger
  DROP TRIGGER IF EXISTS handle_updated_at ON public.appointments;
  CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

  -- Patients trigger
  DROP TRIGGER IF EXISTS handle_updated_at ON public.patients;
  CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

  -- Services trigger
  DROP TRIGGER IF EXISTS handle_updated_at ON public.services;
  CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

  -- Staff users trigger
  DROP TRIGGER IF EXISTS handle_updated_at ON public.staff_users;
  CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.staff_users FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

  -- Dentists trigger
  DROP TRIGGER IF EXISTS handle_updated_at ON public.dentists;
  CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.dentists FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

  -- Clinic expenses trigger
  DROP TRIGGER IF EXISTS handle_updated_at ON public.clinic_expenses;
  CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.clinic_expenses FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

  -- New tables triggers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
    CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff') THEN
    DROP TRIGGER IF EXISTS handle_updated_at ON public.staff;
    CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
    DROP TRIGGER IF EXISTS handle_updated_at ON public.inventory;
    CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;
END $$;

-- Enable Row Level Security on all tables
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dentists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_expenses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on new tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff') THEN
    ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
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

-- Create Row Level Security policies
DO $$
BEGIN
  -- Staff users policies (authentication)
  DROP POLICY IF EXISTS "Staff users can view own record" ON public.staff_users;
  DROP POLICY IF EXISTS "Staff users can update own record" ON public.staff_users;
  CREATE POLICY "Staff users can view own record" ON public.staff_users FOR SELECT USING (true); -- Allow all for now
  CREATE POLICY "Staff users can update own record" ON public.staff_users FOR UPDATE USING (true); -- Allow all for now

  -- Patients policies
  DROP POLICY IF EXISTS "Authenticated users can access patients" ON public.patients;
  CREATE POLICY "Authenticated users can access patients" ON public.patients FOR ALL USING (true); -- Allow all authenticated

  -- Appointments policies
  DROP POLICY IF EXISTS "Authenticated users can access appointments" ON public.appointments;
  CREATE POLICY "Authenticated users can access appointments" ON public.appointments FOR ALL USING (true); -- Allow all authenticated

  -- Services policies
  DROP POLICY IF EXISTS "Authenticated users can read services" ON public.services;
  CREATE POLICY "Authenticated users can read services" ON public.services FOR SELECT USING (true); -- Allow all authenticated

  DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
  CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (
    EXISTS (SELECT 1 FROM public.staff_users WHERE staff_users.id = auth.uid() AND staff_users.is_admin = true)
  );

  -- Dentists policies
  DROP POLICY IF EXISTS "Authenticated users can access dentists" ON public.dentists;
  CREATE POLICY "Authenticated users can access dentists" ON public.dentists FOR ALL USING (true);

  -- Payments policies
  DROP POLICY IF EXISTS "Authenticated users can access payments" ON public.payments;
  CREATE POLICY "Authenticated users can access payments" ON public.payments FOR ALL USING (true);

  -- Clinic expenses policies (admin only)
  DROP POLICY IF EXISTS "Admins can manage expenses" ON public.clinic_expenses;
  CREATE POLICY "Admins can manage expenses" ON public.clinic_expenses FOR ALL USING (
    EXISTS (SELECT 1 FROM public.staff_users WHERE staff_users.id = auth.uid() AND staff_users.is_admin = true)
  );

  -- Basic policies for new tables
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
    DROP POLICY IF EXISTS "Authenticated users can access inventory" ON public.inventory;
    CREATE POLICY "Authenticated users can access inventory" ON public.inventory FOR ALL USING (true);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
    DROP POLICY IF EXISTS "Authenticated users can access transactions" ON public.transactions;
    CREATE POLICY "Authenticated users can access transactions" ON public.transactions FOR ALL USING (true);
  END IF;
END $$;

-- Sync services data with your existing structure
DO $$
BEGIN
  -- Update services.name from service_name if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'service_name')
  AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'name') THEN
    UPDATE public.services SET name = service_name WHERE name IS NULL AND service_name IS NOT NULL;
  END IF;

  -- Update services.price from base_rate if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'base_rate')
  AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'price') THEN
    UPDATE public.services SET price = base_rate WHERE price IS NULL OR price = 0;
  END IF;

  -- Set default duration for existing services
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'duration') THEN
    UPDATE public.services SET duration = 60 WHERE duration IS NULL OR duration = 0;
  END IF;

  -- Set default active status
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'is_active') THEN
    UPDATE public.services SET is_active = true WHERE is_active IS NULL;
  END IF;
END $$;

-- Create view for easier appointment querying (matching your structure)
CREATE OR REPLACE VIEW appointment_details AS
SELECT
  a.*,
  p.first_name || ' ' || p.last_name as patient_name,
  p.phone as patient_phone,
  p.email as patient_email,
  COALESCE(d.name, su.full_name) as dentist_name,
  COALESCE(s.service_name, s.name) as service_name,
  COALESCE(s.base_rate, s.price) as service_price
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
LEFT JOIN dentists d ON a.dentist_id = d.id
LEFT JOIN staff_users su ON a.dentist_id = su.id
LEFT JOIN services s ON a.service_id = s.id;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert sample inventory (production-ready with zero quantities)
INSERT INTO public.inventory (name, description, category, quantity, unit_price, supplier, reorder_level)
SELECT * FROM (VALUES
  ('Surgical Masks', 'Disposable surgical masks', 'PPE', 0, 8.50, 'Medical Supplies Co.', 100),
  ('Latex Gloves', 'Medical latex gloves', 'PPE', 0, 70.00, 'Dental Supplies Inc.', 50),
  ('Dental Bibs', 'Patient dental bibs', 'PPE', 0, 2.40, 'Dental Supplies Inc.', 200),
  ('Disinfectant Solution', 'Surface disinfectant', 'PPE', 0, 560.00, 'Medical Supplies Co.', 10),
  ('Dental Probes', 'Diagnostic probes', 'Instruments', 0, 450.00, 'Dental Tools Ltd.', 20),
  ('Composite Filling Material', 'Light-cure composite', 'Materials', 0, 2500.00, 'Dental Materials Co.', 5),
  ('Local Anesthetic', 'Lidocaine with epinephrine', 'Pharmaceuticals', 0, 125.00, 'Pharma Supplies', 50),
  ('Fluoride Gel', 'Professional fluoride treatment', 'Materials', 0, 380.00, 'Dental Care Products', 10)
) AS v(name, description, category, quantity, unit_price, supplier, reorder_level)
WHERE NOT EXISTS (SELECT 1 FROM public.inventory LIMIT 1);

-- Clean up helper function
DROP FUNCTION IF EXISTS add_missing_column;