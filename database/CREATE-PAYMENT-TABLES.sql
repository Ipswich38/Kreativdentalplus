-- CREATE PAYMENT SYSTEM TABLES
-- This creates the comprehensive payment and commission tracking system

-- Create enhanced payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number VARCHAR(20) UNIQUE NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  patient_id UUID REFERENCES patients(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'gcash', 'maya', 'bank_transfer', 'hmo')),
  reference_number VARCHAR(100),
  hmo_provider VARCHAR(50),
  hmo_approved_amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  processed_by VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment add-ons table (for additional services)
CREATE TABLE IF NOT EXISTS payment_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create commission tracking table
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  staff_id UUID REFERENCES staff_users(id),
  commission_type VARCHAR(20) NOT NULL CHECK (commission_type IN ('dentist', 'assistant', 'hygienist', 'coordinator')),
  base_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL, -- e.g., 0.40 for 40%
  commission_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clinic earnings table
CREATE TABLE IF NOT EXISTS clinic_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  gross_amount DECIMAL(10,2) NOT NULL,
  total_commissions DECIMAL(10,2) NOT NULL,
  net_earnings DECIMAL(10,2) NOT NULL,
  earning_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add appointment status tracking for patient flow
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS assigned_staff VARCHAR(255),
ADD COLUMN IF NOT EXISTS patient_status VARCHAR(30) DEFAULT 'scheduled'
CHECK (patient_status IN ('scheduled', 'arrived', 'ready_for_treatment', 'in_treatment', 'completed', 'awaiting_payment', 'paid', 'no_show', 'cancelled'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_appointment ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_commissions_staff ON commissions(staff_id);
CREATE INDEX IF NOT EXISTS idx_commissions_period ON commissions(period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(patient_status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- Insert sample HMO providers reference data
CREATE TABLE IF NOT EXISTS hmo_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  contact_info JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common HMO providers in the Philippines
INSERT INTO hmo_providers (name, code, contact_info, is_active) VALUES
('PhilHealth', 'PHILHEALTH', '{"phone": "+632-441-7444", "website": "https://philhealth.gov.ph"}', true),
('Maxicare Healthcare Corporation', 'MAXICARE', '{"phone": "+632-582-1900", "website": "https://maxicare.com.ph"}', true),
('Intellicare', 'INTELLICARE', '{"phone": "+632-982-1500", "website": "https://intellicare.com.ph"}', true),
('Medicard Philippines', 'MEDICARD', '{"phone": "+632-988-1800", "website": "https://medicard.ph"}', true),
('Avega Managed Care', 'AVEGA', '{"phone": "+632-654-8888", "website": "https://avega.ph"}', true),
('CareHealth Plus Systems', 'CAREHEALTH', '{"phone": "+632-889-1700", "website": "https://carehealth.ph"}', true),
('MediAccess Philippines', 'MEDIACCESS', '{"phone": "+632-478-7777", "website": "https://mediaccess.ph"}', true),
('AsianLife and General Assurance Corporation', 'ASIAN_LIFE', '{"phone": "+632-526-9999", "website": "https://asianlife.com"}', true)
ON CONFLICT (code) DO NOTHING;

-- Create payment summary view for reporting
CREATE OR REPLACE VIEW payment_summary AS
SELECT
  p.payment_number,
  p.created_at::date as payment_date,
  pt.first_name || ' ' || pt.last_name as patient_name,
  su.full_name as dentist_name,
  su.specialization as dentist_specialization,
  p.amount as total_amount,
  p.payment_method,
  p.status,
  p.processed_by,
  -- Calculate total add-ons
  COALESCE(addon_total.total_addons, 0) as addons_amount,
  -- Calculate total commissions
  COALESCE(comm_total.total_commissions, 0) as total_commissions,
  -- Calculate clinic earnings
  (p.amount - COALESCE(comm_total.total_commissions, 0)) as clinic_earnings
FROM payments p
LEFT JOIN appointments a ON p.appointment_id = a.id
LEFT JOIN patients pt ON p.patient_id = pt.id
LEFT JOIN staff_users su ON a.dentist_id = su.id
LEFT JOIN (
  SELECT payment_id, SUM(amount) as total_addons
  FROM payment_addons
  GROUP BY payment_id
) addon_total ON p.id = addon_total.payment_id
LEFT JOIN (
  SELECT payment_id, SUM(commission_amount) as total_commissions
  FROM commissions
  GROUP BY payment_id
) comm_total ON p.id = comm_total.payment_id;

-- Create commission summary view for staff
CREATE OR REPLACE VIEW commission_summary AS
SELECT
  su.employee_number,
  su.full_name as staff_name,
  su.position,
  c.commission_type,
  c.period_month,
  c.period_year,
  COUNT(c.id) as total_transactions,
  SUM(c.base_amount) as total_base_amount,
  AVG(c.commission_rate) as average_rate,
  SUM(c.commission_amount) as total_commission,
  c.status as payment_status
FROM commissions c
JOIN staff_users su ON c.staff_id = su.id
GROUP BY su.employee_number, su.full_name, su.position, c.commission_type,
         c.period_month, c.period_year, c.status
ORDER BY c.period_year DESC, c.period_month DESC, su.full_name;

-- Grant necessary permissions (adjust based on your RLS policies)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON payments TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON payment_addons TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON commissions TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON clinic_earnings TO authenticated;
-- GRANT SELECT ON hmo_providers TO authenticated;
-- GRANT SELECT ON payment_summary TO authenticated;
-- GRANT SELECT ON commission_summary TO authenticated;

SELECT 'Payment system tables created successfully!' as status;