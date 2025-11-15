import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "../data/users";

interface AttendanceTestProps {
  currentUser: User;
}

export function SimpleAttendanceTest({ currentUser }: AttendanceTestProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tests, setTests] = useState<string[]>([]);
  const [attendanceCount, setAttendanceCount] = useState<number>(0);
  const [staffCount, setStaffCount] = useState<number>(0);

  useEffect(() => {
    console.log('SimpleAttendanceTest component mounted - currentUser:', currentUser);

    const testDatabaseConnection = async () => {
      try {
        console.log('=== ATTENDANCE DEBUG TEST ===');

        // Test 1: Check if staff_users table exists
        console.log('Testing staff_users table...');
        const { data: staffData, error: staffError } = await supabase
          .from('staff_users')
          .select('count(*)', { count: 'exact' })
          .limit(1);

        if (staffError) {
          console.error('Staff error:', staffError);
          setError(`Staff table error: ${staffError.message}`);
        } else {
          console.log('Staff data:', staffData);
          setStaffCount(staffData?.[0]?.count || 0);
        }

        // Test 2: Check if attendance table exists
        console.log('Testing attendance table...');
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('count(*)', { count: 'exact' })
          .limit(1);

        if (attendanceError) {
          console.error('Attendance error:', attendanceError);
          setError(`Attendance table error: ${attendanceError.message}`);
        } else {
          console.log('Attendance data:', attendanceData);
          setAttendanceCount(attendanceData?.[0]?.count || 0);
        }

        // Test 3: Try the actual query from ProductionAttendancePage
        console.log('Testing attendance query with staff join...');
        const { data: joinData, error: joinError } = await supabase
          .from('attendance')
          .select(`
            *,
            staff_users!inner(full_name, hourly_rate, employee_number)
          `)
          .limit(5);

        if (joinError) {
          console.error('Join error:', joinError);
          setError(`Join query error: ${joinError.message}`);
        } else {
          console.log('Join data:', joinData);
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Database test error:', err);
        setError(`Database connection error: ${err.message}`);
        setLoading(false);
      }
    };

    testDatabaseConnection();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Attendance Debug Test</h2>
        <div className="text-center py-8">Testing database connection...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Attendance Debug Test</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Attendance Debug Test</h2>
      <div className="space-y-4">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>Success:</strong> Database connection working!
        </div>

        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p><strong>Staff Users Count:</strong> {staffCount}</p>
          <p><strong>Attendance Records Count:</strong> {attendanceCount}</p>
        </div>

        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded">
          <p><strong>Current User:</strong> {currentUser.name} ({currentUser.role})</p>
          <p><strong>Employee ID:</strong> {currentUser.employeeId}</p>
        </div>
      </div>
    </div>
  );
}