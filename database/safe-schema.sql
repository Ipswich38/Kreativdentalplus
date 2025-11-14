-- KREATIV DENTAL PLUS SAFE SCHEMA UPDATE
-- This version safely updates existing schema without conflicts

-- Enable UUID extension (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table only if it doesn't exist
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

-- Create patients table only if it doesn't exist
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

-- Create services table only if it doesn't exist
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff table only if it doesn't exist
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

-- Create appointments table only if it doesn't exist
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  dentist_id UUID REFERENCES public.staff(id) ON DELETE RESTRICT,
  service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table only if it doesn't exist
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIME,
  clock_out TIME,
  break_duration INTEGER DEFAULT 0, -- in minutes
  total_hours DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, date)
);

-- Create payroll table only if it doesn't exist
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

-- Create inventory table only if it doesn't exist
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

-- Create transactions table only if it doesn't exist
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

-- Create indexes (these will be skipped if they already exist)
DO $$
BEGIN
  -- Create indexes only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointments_date') THEN
    CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointments_dentist') THEN
    CREATE INDEX idx_appointments_dentist ON public.appointments(dentist_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointments_patient') THEN
    CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_attendance_staff_date') THEN
    CREATE INDEX idx_attendance_staff_date ON public.attendance(staff_id, date);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payroll_staff_period') THEN
    CREATE INDEX idx_payroll_staff_period ON public.payroll(staff_id, pay_period_start, pay_period_end);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_patient') THEN
    CREATE INDEX idx_transactions_patient ON public.transactions(patient_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_date') THEN
    CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_employee_id') THEN
    CREATE INDEX idx_profiles_employee_id ON public.profiles(employee_id);
  END IF;
END
$$;

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (DROP IF EXISTS to avoid conflicts)
DO $$
BEGIN
  -- Profiles trigger
  DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
  CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

  -- Patients trigger
  DROP TRIGGER IF EXISTS handle_updated_at ON public.patients;
  CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

  -- Services trigger
  DROP TRIGGER IF EXISTS handle_updated_at ON public.services;
  CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

  -- Staff trigger
  DROP TRIGGER IF EXISTS handle_updated_at ON public.staff;
  CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

  -- Appointments trigger
  DROP TRIGGER IF EXISTS handle_updated_at ON public.appointments;
  CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

  -- Attendance trigger
  DROP TRIGGER IF EXISTS handle_updated_at ON public.attendance;
  CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

  -- Payroll trigger
  DROP TRIGGER IF EXISTS handle_updated_at ON public.payroll;
  CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.payroll FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

  -- Inventory trigger
  DROP TRIGGER IF EXISTS handle_updated_at ON public.inventory;
  CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

  -- Transactions trigger
  DROP TRIGGER IF EXISTS handle_updated_at ON public.transactions;
  CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
END
$$;

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts, then recreate
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
  DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
  CREATE POLICY "Authenticated users can read services" ON public.services FOR SELECT USING (auth.role() = 'authenticated');
  CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

  -- Staff policies
  DROP POLICY IF EXISTS "Authenticated users can access staff" ON public.staff;
  CREATE POLICY "Authenticated users can access staff" ON public.staff FOR ALL USING (auth.role() = 'authenticated');

  -- Appointments policies
  DROP POLICY IF EXISTS "Authenticated users can access appointments" ON public.appointments;
  CREATE POLICY "Authenticated users can access appointments" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');

  -- Attendance policies
  DROP POLICY IF EXISTS "Staff can view own attendance" ON public.attendance;
  DROP POLICY IF EXISTS "Admins can manage all attendance" ON public.attendance;
  CREATE POLICY "Staff can view own attendance" ON public.attendance FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.staff WHERE staff.id = attendance.staff_id AND staff.profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
  CREATE POLICY "Admins can manage all attendance" ON public.attendance FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

  -- Payroll policies
  DROP POLICY IF EXISTS "Staff can view own payroll" ON public.payroll;
  DROP POLICY IF EXISTS "Admins can manage payroll" ON public.payroll;
  CREATE POLICY "Staff can view own payroll" ON public.payroll FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.staff WHERE staff.id = payroll.staff_id AND staff.profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
  CREATE POLICY "Admins can manage payroll" ON public.payroll FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

  -- Inventory policies
  DROP POLICY IF EXISTS "Authenticated users can access inventory" ON public.inventory;
  CREATE POLICY "Authenticated users can access inventory" ON public.inventory FOR ALL USING (auth.role() = 'authenticated');

  -- Transactions policies
  DROP POLICY IF EXISTS "Authenticated users can access transactions" ON public.transactions;
  CREATE POLICY "Authenticated users can access transactions" ON public.transactions FOR ALL USING (auth.role() = 'authenticated');
END
$$;

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, employee_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff'),
    NEW.raw_user_meta_data->>'employee_id'
  );
  RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert default services (use ON CONFLICT to avoid duplicates)
INSERT INTO public.services (name, description, price, duration, category) VALUES
('Dental Cleaning', 'Regular dental cleaning and checkup', 1500.00, 60, 'Preventive'),
('Oral Prophylaxis - Simple', 'Basic oral prophylaxis', 1500.00, 45, 'Preventive'),
('Oral Prophylaxis - Deep Cleaning', 'Deep cleaning for advanced cases', 3500.00, 90, 'Preventive'),
('Dental Filling', 'Composite filling for cavities', 2000.00, 45, 'Restorative'),
('Restoration/Light Cure', 'Light cure restoration', 2000.00, 45, 'Restorative'),
('Root Canal', 'Root canal treatment', 8000.00, 120, 'Endodontic'),
('Tooth Extraction', 'Simple tooth extraction', 3000.00, 30, 'Oral Surgery'),
('Dental Crown', 'Porcelain crown placement', 10000.00, 120, 'Restorative'),
('Crown - PFM', 'Porcelain-fused-to-metal crown', 10000.00, 120, 'Restorative'),
('Teeth Whitening', 'Professional teeth whitening treatment', 18000.00, 75, 'Cosmetic'),
('Dental Implant', 'Single tooth implant placement', 50000.00, 180, 'Oral Surgery'),
('Orthodontic Consultation', 'Initial orthodontic assessment', 1000.00, 45, 'Orthodontics'),
('Braces Installation', 'Complete braces installation', 15000.00, 120, 'Orthodontics'),
('Braces Binding', 'Braces adjustment and binding', 1500.00, 30, 'Orthodontics'),
('Dentures - NEW ACE CD', 'Complete denture set', 40000.00, 180, 'Prosthodontics'),
('Veneers - Composite', 'Composite veneer per tooth', 4000.00, 90, 'Cosmetic'),
('X-Ray', 'Dental radiograph', 500.00, 15, 'Diagnostic'),
('Fluoride Treatment', 'Fluoride application', 1000.00, 20, 'Preventive'),
('Airflow Treatment', 'Advanced cleaning with airflow', 2500.00, 45, 'Preventive'),
('Tooth Mousse Application', 'Remineralizing treatment', 1500.00, 20, 'Preventive'),
('Emergency Consultation', 'Urgent dental consultation', 1500.00, 30, 'Emergency')
ON CONFLICT (name) DO NOTHING;

-- Create appointment conflict checking functions
CREATE OR REPLACE FUNCTION check_appointment_conflicts(
  p_dentist_id UUID,
  p_appointment_date DATE,
  p_appointment_time TIME,
  p_duration INTEGER,
  p_exclude_appointment_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
  end_time TIME;
BEGIN
  -- Calculate end time of the new appointment
  end_time := p_appointment_time + (p_duration || ' minutes')::INTERVAL;

  -- Check for conflicts
  SELECT COUNT(*)
  INTO conflict_count
  FROM public.appointments a
  WHERE a.dentist_id = p_dentist_id
    AND a.appointment_date = p_appointment_date
    AND a.status NOT IN ('cancelled', 'no_show')
    AND (p_exclude_appointment_id IS NULL OR a.id != p_exclude_appointment_id)
    AND (
      -- New appointment starts during existing appointment
      (p_appointment_time >= a.appointment_time
       AND p_appointment_time < a.appointment_time + (a.duration || ' minutes')::INTERVAL)
      OR
      -- New appointment ends during existing appointment
      (end_time > a.appointment_time
       AND end_time <= a.appointment_time + (a.duration || ' minutes')::INTERVAL)
      OR
      -- New appointment completely encompasses existing appointment
      (p_appointment_time <= a.appointment_time
       AND end_time >= a.appointment_time + (a.duration || ' minutes')::INTERVAL)
    );

  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent appointment conflicts
CREATE OR REPLACE FUNCTION prevent_appointment_conflicts()
RETURNS TRIGGER AS $$
BEGIN
  IF check_appointment_conflicts(
    NEW.dentist_id,
    NEW.appointment_date,
    NEW.appointment_time,
    NEW.duration,
    CASE WHEN TG_OP = 'UPDATE' THEN NEW.id ELSE NULL END
  ) THEN
    RAISE EXCEPTION 'Appointment conflict detected. The dentist already has an appointment at this time.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the appointment conflict trigger
DROP TRIGGER IF EXISTS check_appointment_conflicts ON public.appointments;
CREATE TRIGGER check_appointment_conflicts
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION prevent_appointment_conflicts();

-- Create appointment details view
DROP VIEW IF EXISTS appointment_details;
CREATE VIEW appointment_details AS
SELECT
  a.*,
  p.first_name || ' ' || p.last_name as patient_name,
  p.phone as patient_phone,
  p.email as patient_email,
  prof.full_name as dentist_name,
  s.name as service_name,
  s.price as service_price
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN staff st ON a.dentist_id = st.id
JOIN profiles prof ON st.profile_id = prof.id
JOIN services s ON a.service_id = s.id;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert sample inventory (only if table is empty)
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