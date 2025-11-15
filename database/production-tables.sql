-- PRODUCTION TABLES FOR KREATIVDENTAL PLUS
-- Additional tables needed for full production functionality

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to safely add columns
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

-- UPDATED INVENTORY TABLE (with proper structure for ProductionInventoryPage)
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('supplies', 'equipment', 'ppe', 'consumables')),
  unit_type TEXT NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  maximum_stock INTEGER,
  cost_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0,
  supplier TEXT,
  location TEXT,
  description TEXT,
  last_restocked TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STOCK MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_number TEXT,
  performed_by UUID NOT NULL REFERENCES public.staff_users(id) ON DELETE RESTRICT,
  movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PAYMENT TRANSACTIONS TABLE (for ProductionFinancialPage)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'bank_transfer', 'installment')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'refunded')),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXPENSES TABLE (for ProductionFinancialPage)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('supplies', 'equipment', 'utilities', 'rent', 'miscellaneous')),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  vendor TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing inventory table if it exists with wrong structure
DO $$
BEGIN
  -- Check if old inventory table exists and needs updating
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
    -- Add missing columns to existing inventory table
    SELECT add_missing_column('inventory', 'item_code', 'TEXT');
    SELECT add_missing_column('inventory', 'current_stock', 'INTEGER DEFAULT 0');
    SELECT add_missing_column('inventory', 'minimum_stock', 'INTEGER DEFAULT 0');
    SELECT add_missing_column('inventory', 'maximum_stock', 'INTEGER');
    SELECT add_missing_column('inventory', 'cost_per_unit', 'DECIMAL(10,2) DEFAULT 0');
    SELECT add_missing_column('inventory', 'unit_type', 'TEXT');
    SELECT add_missing_column('inventory', 'location', 'TEXT');
    SELECT add_missing_column('inventory', 'last_restocked', 'TIMESTAMP WITH TIME ZONE');

    -- Update old columns to new names if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'quantity') THEN
      UPDATE public.inventory SET current_stock = quantity WHERE current_stock = 0 AND quantity > 0;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'unit_price') THEN
      UPDATE public.inventory SET cost_per_unit = unit_price WHERE cost_per_unit = 0 AND unit_price > 0;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'reorder_level') THEN
      UPDATE public.inventory SET minimum_stock = reorder_level WHERE minimum_stock = 0 AND reorder_level > 0;
    END IF;

    -- Generate item codes for existing items without codes
    UPDATE public.inventory
    SET item_code =
      CASE
        WHEN category = 'supplies' THEN 'SUP-' || LPAD(ROW_NUMBER() OVER (PARTITION BY category ORDER BY created_at)::TEXT, 3, '0')
        WHEN category = 'equipment' THEN 'EQP-' || LPAD(ROW_NUMBER() OVER (PARTITION BY category ORDER BY created_at)::TEXT, 3, '0')
        WHEN category = 'ppe' THEN 'PPE-' || LPAD(ROW_NUMBER() OVER (PARTITION BY category ORDER BY created_at)::TEXT, 3, '0')
        ELSE 'ITM-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 3, '0')
      END
    WHERE item_code IS NULL OR item_code = '';

    -- Set default unit type for items without it
    UPDATE public.inventory SET unit_type = 'pieces' WHERE unit_type IS NULL OR unit_type = '';
  END IF;
END $$;

-- Update ATTENDANCE table structure
SELECT add_missing_column('attendance', 'status', 'TEXT DEFAULT ''present''');
SELECT add_missing_column('attendance', 'overtime_hours', 'DECIMAL(4,2) DEFAULT 0');
SELECT add_missing_column('attendance', 'regular_hours', 'DECIMAL(4,2) DEFAULT 0');

-- Update PATIENTS table for production compatibility
SELECT add_missing_column('patients', 'emergency_contact', 'TEXT');
SELECT add_missing_column('patients', 'emergency_phone', 'TEXT');
SELECT add_missing_column('patients', 'insurance_provider', 'TEXT');
SELECT add_missing_column('patients', 'insurance_number', 'TEXT');

-- Update STAFF_USERS table
SELECT add_missing_column('staff_users', 'department', 'TEXT');
SELECT add_missing_column('staff_users', 'is_active', 'BOOLEAN DEFAULT TRUE');
SELECT add_missing_column('staff_users', 'passcode_reset_required', 'BOOLEAN DEFAULT FALSE');
SELECT add_missing_column('staff_users', 'last_passcode_change', 'TIMESTAMP WITH TIME ZONE');

-- Create indexes for performance
DO $$
BEGIN
  -- Inventory indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_inventory_item_code') THEN
    CREATE INDEX idx_inventory_item_code ON public.inventory(item_code);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_inventory_category') THEN
    CREATE INDEX idx_inventory_category ON public.inventory(category);
  END IF;

  -- Stock movements indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stock_movements_item') THEN
    CREATE INDEX idx_stock_movements_item ON public.stock_movements(inventory_item_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stock_movements_date') THEN
    CREATE INDEX idx_stock_movements_date ON public.stock_movements(movement_date);
  END IF;

  -- Payment transactions indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payment_transactions_patient') THEN
    CREATE INDEX idx_payment_transactions_patient ON public.payment_transactions(patient_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payment_transactions_date') THEN
    CREATE INDEX idx_payment_transactions_date ON public.payment_transactions(transaction_date);
  END IF;

  -- Expenses indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_expenses_date') THEN
    CREATE INDEX idx_expenses_date ON public.expenses(expense_date);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_expenses_category') THEN
    CREATE INDEX idx_expenses_category ON public.expenses(category);
  END IF;

  -- Attendance indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_attendance_staff_date') THEN
    CREATE INDEX idx_attendance_staff_date ON public.attendance(staff_user_id, date);
  END IF;

  -- Payroll indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payroll_staff_period') THEN
    CREATE INDEX idx_payroll_staff_period ON public.payroll(staff_user_id, pay_period_start, pay_period_end);
  END IF;
END $$;

-- Create or update triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to new tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
    DROP TRIGGER IF EXISTS handle_updated_at ON public.inventory;
    CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_transactions') THEN
    DROP TRIGGER IF EXISTS handle_updated_at ON public.payment_transactions;
    CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.payment_transactions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expenses') THEN
    DROP TRIGGER IF EXISTS handle_updated_at ON public.expenses;
    CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for authenticated users for now)
DO $$
BEGIN
  -- Inventory policies
  DROP POLICY IF EXISTS "Authenticated users can access inventory" ON public.inventory;
  CREATE POLICY "Authenticated users can access inventory" ON public.inventory FOR ALL USING (true);

  -- Stock movements policies
  DROP POLICY IF EXISTS "Authenticated users can access stock movements" ON public.stock_movements;
  CREATE POLICY "Authenticated users can access stock movements" ON public.stock_movements FOR ALL USING (true);

  -- Payment transactions policies
  DROP POLICY IF EXISTS "Authenticated users can access payment transactions" ON public.payment_transactions;
  CREATE POLICY "Authenticated users can access payment transactions" ON public.payment_transactions FOR ALL USING (true);

  -- Expenses policies
  DROP POLICY IF EXISTS "Authenticated users can access expenses" ON public.expenses;
  CREATE POLICY "Authenticated users can access expenses" ON public.expenses FOR ALL USING (true);
END $$;

-- Insert sample inventory items for production testing
INSERT INTO public.inventory (item_code, name, category, unit_type, current_stock, minimum_stock, cost_per_unit, supplier)
SELECT * FROM (VALUES
  ('SUP-001', 'Disposable Syringes', 'supplies', 'pieces', 0, 100, 2.50, 'Medical Supplies Co.'),
  ('SUP-002', 'Cotton Gauze', 'supplies', 'rolls', 0, 50, 45.00, 'Medical Supplies Co.'),
  ('PPE-001', 'Surgical Masks', 'ppe', 'box', 0, 20, 350.00, 'PPE Distributors'),
  ('PPE-002', 'Nitrile Gloves', 'ppe', 'box', 0, 15, 580.00, 'PPE Distributors'),
  ('PPE-003', 'Face Shields', 'ppe', 'pieces', 0, 25, 45.00, 'PPE Distributors'),
  ('EQP-001', 'Digital Thermometer', 'equipment', 'pieces', 0, 5, 2500.00, 'Medical Equipment Ltd.'),
  ('CON-001', 'Dental Floss', 'consumables', 'packages', 0, 100, 15.00, 'Dental Supplies Inc.'),
  ('CON-002', 'Mouthwash', 'consumables', 'bottles', 0, 30, 180.00, 'Dental Supplies Inc.')
) AS v(item_code, name, category, unit_type, current_stock, minimum_stock, cost_per_unit, supplier)
WHERE NOT EXISTS (SELECT 1 FROM public.inventory WHERE item_code = v.item_code);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Clean up helper function
DROP FUNCTION add_missing_column;