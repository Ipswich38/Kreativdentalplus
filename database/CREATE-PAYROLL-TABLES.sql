-- CREATE PAYROLL AND ATTENDANCE TABLES FOR PRODUCTION
-- This script creates the required tables with the correct structure

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create PAYROLL table with correct structure for ProductionPayrollPage
CREATE TABLE IF NOT EXISTS public.payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_user_id UUID NOT NULL REFERENCES public.staff_users(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  hours_worked DECIMAL(5,2) NOT NULL DEFAULT 0,
  regular_hours DECIMAL(5,2) NOT NULL DEFAULT 0,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  gross_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  net_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES public.staff_users(id),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Create ATTENDANCE table with correct structure for ProductionPayrollPage
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_user_id UUID NOT NULL REFERENCES public.staff_users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  clock_in TIME,
  clock_out TIME,
  break_duration INTEGER DEFAULT 60, -- minutes
  total_hours DECIMAL(5,2) DEFAULT 0,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  regular_hours DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'sick', 'vacation')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payroll_staff_user_id ON public.payroll(staff_user_id);
CREATE INDEX IF NOT EXISTS idx_payroll_period ON public.payroll(pay_period_start, pay_period_end);
CREATE INDEX IF NOT EXISTS idx_payroll_status ON public.payroll(status);

CREATE INDEX IF NOT EXISTS idx_attendance_staff_user_id ON public.attendance(staff_user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_staff_date ON public.attendance(staff_user_id, date);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
DROP TRIGGER IF EXISTS handle_updated_at_payroll ON public.payroll;
CREATE TRIGGER handle_updated_at_payroll
  BEFORE UPDATE ON public.payroll
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_attendance ON public.attendance;
CREATE TRIGGER handle_updated_at_attendance
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for authenticated users)
DROP POLICY IF EXISTS "Authenticated users can access payroll" ON public.payroll;
CREATE POLICY "Authenticated users can access payroll"
  ON public.payroll FOR ALL
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can access attendance" ON public.attendance;
CREATE POLICY "Authenticated users can access attendance"
  ON public.attendance FOR ALL
  USING (true);

-- Add hourly_rate column to staff_users if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_users'
    AND column_name = 'hourly_rate'
  ) THEN
    ALTER TABLE public.staff_users ADD COLUMN hourly_rate DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

-- Set default hourly rates based on role
UPDATE public.staff_users SET
  hourly_rate = CASE
    WHEN role = 'dentist' THEN 800.00
    WHEN role = 'admin' THEN 500.00
    WHEN role = 'staff' THEN 250.00
    WHEN role = 'receptionist' THEN 280.00
    WHEN role = 'front_desk' THEN 200.00
    ELSE 200.00
  END
WHERE hourly_rate IS NULL OR hourly_rate = 0;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.payroll TO authenticated;
GRANT ALL ON public.attendance TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify tables were created
SELECT 'PAYROLL TABLE CREATED' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'payroll'
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'ATTENDANCE TABLE CREATED' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'attendance'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check staff users have hourly rates
SELECT 'STAFF HOURLY RATES:' as info;
SELECT full_name, role, hourly_rate
FROM public.staff_users
WHERE is_active = true
ORDER BY role, full_name;