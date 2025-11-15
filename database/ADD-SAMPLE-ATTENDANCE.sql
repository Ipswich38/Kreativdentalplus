-- ADD SAMPLE ATTENDANCE DATA FOR TESTING PAYROLL SYSTEM
-- This provides realistic data for the payroll functionality

-- First run the schema fix, then insert sample attendance records
-- Insert sample attendance records for the current month

INSERT INTO public.attendance (staff_user_id, date, clock_in, clock_out, break_duration, status, total_hours, overtime_hours)
SELECT
  su.id as staff_user_id,
  CURRENT_DATE - INTERVAL '1 day' * gs.day_offset as date,
  '08:00'::TIME as clock_in,
  CASE
    WHEN gs.day_offset % 7 IN (0, 6) THEN NULL  -- Weekend
    WHEN gs.day_offset % 5 = 0 THEN '19:00'::TIME  -- Overtime day
    ELSE '17:00'::TIME  -- Regular day
  END as clock_out,
  60 as break_duration,  -- 1 hour break
  CASE
    WHEN gs.day_offset % 7 IN (0, 6) THEN 'absent'  -- Weekend
    WHEN gs.day_offset % 10 = 0 THEN 'sick'  -- Occasional sick day
    ELSE 'present'
  END as status,
  CASE
    WHEN gs.day_offset % 7 IN (0, 6) THEN 0  -- Weekend
    WHEN gs.day_offset % 10 = 0 THEN 0  -- Sick day
    WHEN gs.day_offset % 5 = 0 THEN 10  -- Overtime day (11 hours - 1 hour break)
    ELSE 8  -- Regular day (9 hours - 1 hour break)
  END as total_hours,
  CASE
    WHEN gs.day_offset % 5 = 0 AND gs.day_offset % 7 NOT IN (0, 6) THEN 2  -- 2 hours overtime
    ELSE 0
  END as overtime_hours
FROM
  public.staff_users su
  CROSS JOIN generate_series(0, 29) as gs(day_offset)  -- Last 30 days
WHERE
  su.is_active = true
  AND su.role IN ('staff', 'dentist', 'admin', 'receptionist')
  AND NOT EXISTS (
    SELECT 1 FROM public.attendance a
    WHERE a.staff_user_id = su.id
    AND a.date = CURRENT_DATE - INTERVAL '1 day' * gs.day_offset
  );

-- Update staff_users with hourly rates if they don't have them
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

-- Verify sample data was created
SELECT 'ATTENDANCE SAMPLE DATA:' as info;
SELECT
  su.full_name,
  su.role,
  su.hourly_rate,
  COUNT(a.id) as attendance_days,
  SUM(a.total_hours) as total_hours,
  SUM(a.overtime_hours) as overtime_hours
FROM public.staff_users su
LEFT JOIN public.attendance a ON su.id = a.staff_user_id
WHERE su.is_active = true
GROUP BY su.id, su.full_name, su.role, su.hourly_rate
ORDER BY su.full_name;

SELECT 'SAMPLE ATTENDANCE DATA ADDED' as status;