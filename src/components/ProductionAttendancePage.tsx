import { useState, useEffect } from "react";
import { Calendar, Clock, User, Plus, Search, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import type { User } from "../data/users";
import { PageWrapper } from "./PageWrapper";

// ... (interfaces remain the same)
interface AttendanceRecord {
  id: string;
  staff_user_id: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  break_duration: number;
  total_hours?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  staff_name?: string;
  staff_hourly_rate?: number;
  daily_pay?: number;
}

interface StaffUser {
  id: string;
  full_name: string;
  hourly_rate?: number;
  is_active: boolean;
}

interface AttendancePageProps {
  currentUser: User;
}

export function ProductionAttendancePage({ currentUser }: AttendancePageProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewAttendanceOpen, setIsNewAttendanceOpen] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);

  console.log('=== ProductionAttendancePage COMPONENT RENDERING ===');
  console.log('currentUser:', currentUser);

  // Component-level error boundary
  if (componentError) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-red-600">Attendance Page Error</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Component Error:</strong> {componentError}
        </div>
      </div>
    );
  }

  const [newAttendance, setNewAttendance] = useState({
    staff_user_id: '',
    date: new Date().toISOString().split('T')[0],
    clock_in: '',
    clock_out: '',
    break_duration: 60, // 1 hour default
    notes: ''
  });

  // Permission check
  const canManageAttendance = ['admin'].includes(currentUser.role);
  const canViewOwnAttendance = true;

  // Fetch staff users
  const fetchStaffUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_users')
        .select('id, full_name, hourly_rate, is_active')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setStaffUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff list');
    }
  };

  // Calculate hours worked
  const calculateHours = (clockIn: string, clockOut: string, breakMinutes: number = 0): number => {
    if (!clockIn || !clockOut) return 0;

    const [inHour, inMinute] = clockIn.split(':').map(Number);
    const [outHour, outMinute] = clockOut.split(':').map(Number);

    const inTotalMinutes = inHour * 60 + inMinute;
    const outTotalMinutes = outHour * 60 + outMinute;

    const workedMinutes = outTotalMinutes - inTotalMinutes - breakMinutes;
    return Math.max(0, workedMinutes / 60); // Convert to hours
  };

  // Calculate daily pay
  const calculateDailyPay = (hours: number, hourlyRate: number = 0): number => {
    const regularHours = Math.min(hours, 8);
    const overtimeHours = Math.max(0, hours - 8);

    const regularPay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * hourlyRate * 1.25; // 25% overtime premium

    return regularPay + overtimePay;
  };

  // Fetch attendance records
  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          staff_users!inner(full_name, hourly_rate, employee_number)
        `)
        .order('date', { ascending: false })
        .order('clock_in', { ascending: true });

      // If not admin, only show own records
      if (!canManageAttendance) {
        const { data: staffData } = await supabase
          .from('staff_users')
          .select('id')
          .eq('employee_number', currentUser.employeeId)
          .single();

        if (staffData) {
          query = query.eq('staff_user_id', staffData.id);
        }
      }

      // Apply filters
      if (selectedDate) {
        query = query.eq('date', selectedDate);
      }

      if (selectedStaff) {
        query = query.eq('staff_user_id', selectedStaff);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process data with calculations
      const processedData = (data || []).map(record => {
        const totalHours = calculateHours(record.clock_in, record.clock_out, record.break_duration);
        const hourlyRate = record.staff_users?.hourly_rate || 0;
        const dailyPay = calculateDailyPay(totalHours, hourlyRate);

        return {
          ...record,
          staff_name: record.staff_users?.full_name,
          staff_hourly_rate: hourlyRate,
          total_hours: totalHours,
          daily_pay: dailyPay
        };
      });

      setAttendanceRecords(processedData);
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  // Clock in/out functionality
  const handleClockAction = async (staffUserId: string, action: 'in' | 'out') => {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5);

    try {
      if (action === 'in') {
        // Create new attendance record
        const { error } = await supabase
          .from('attendance')
          .insert([{
            staff_user_id: staffUserId,
            date: today,
            clock_in: currentTime,
            break_duration: 60 // Default 1 hour break
          }]);

        if (error) throw error;
        toast.success('Clocked in successfully');
      } else {
        // Update existing record with clock out
        const { error } = await supabase
          .from('attendance')
          .update({
            clock_out: currentTime,
            updated_at: new Date().toISOString()
          })
          .eq('staff_user_id', staffUserId)
          .eq('date', today)
          .is('clock_out', null);

        if (error) throw error;
        toast.success('Clocked out successfully');
      }

      fetchAttendanceRecords();
    } catch (error: any) {
      console.error('Error with clock action:', error);
      toast.error(`Failed to clock ${action}`);
    }
  };

  // Create manual attendance record
  const handleCreateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageAttendance) {
      toast.error('You do not have permission to create attendance records');
      return;
    }

    setLoading(true);
    try {
      const totalHours = calculateHours(newAttendance.clock_in, newAttendance.clock_out, newAttendance.break_duration);

      const { error } = await supabase
        .from('attendance')
        .insert([{
          ...newAttendance,
          break_duration: newAttendance.break_duration || 0
        }]);

      if (error) throw error;

      toast.success('Attendance record created successfully');
      setIsNewAttendanceOpen(false);
      setNewAttendance({
        staff_user_id: '',
        date: new Date().toISOString().split('T')[0],
        clock_in: '',
        clock_out: '',
        break_duration: 60,
        notes: ''
      });
      fetchAttendanceRecords();
    } catch (error: any) {
      console.error('Error creating attendance:', error);
      toast.error('Failed to create attendance record');
    } finally {
      setLoading(false);
    }
  };

  // Get today's attendance for quick actions
  const getTodayAttendance = (staffUserId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.find(r => r.staff_user_id === staffUserId && r.date === today);
  };

  // Load data on component mount
  useEffect(() => {
    console.log('=== ProductionAttendancePage useEffect - INITIAL LOAD ===');
    try {
      fetchStaffUsers();
      fetchAttendanceRecords();
    } catch (error: any) {
      console.error('Error in initial useEffect:', error);
      setComponentError(`Initial load error: ${error.message}`);
    }
  }, []);

  // Refresh when filters change
  useEffect(() => {
    console.log('=== ProductionAttendancePage useEffect - FILTER CHANGE ===');
    try {
      fetchAttendanceRecords();
    } catch (error: any) {
      console.error('Error in filter useEffect:', error);
      setComponentError(`Filter update error: ${error.message}`);
    }
  }, [selectedDate, selectedStaff, currentUser]);

  const pageActions = (
    <div className="donezo-attendance-actions">
      {canManageAttendance && (
        <button className="donezo-header-button" onClick={() => setIsNewAttendanceOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </button>
      )}
    </div>
  );

  try {
    console.log('=== ProductionAttendancePage RENDER START ===');

    return (
      <PageWrapper
        title="Attendance Tracking"
        subtitle={canManageAttendance ? "Track staff attendance and work hours" : "View your attendance records"}
        actions={pageActions}
      >
        {/* Quick Clock Actions */}
        {canManageAttendance && (
          <div className="donezo-section" style={{ marginBottom: '24px' }}>
            <div className="donezo-section-header">
              <h3 className="donezo-section-title">Quick Clock Actions - Today</h3>
            </div>
            <div className="donezo-quick-clock-grid">
              {staffUsers.slice(0, 8).map((staff) => {
                const todayRecord = getTodayAttendance(staff.id);
                const isCheckedIn = todayRecord && todayRecord.clock_in && !todayRecord.clock_out;
                const isCheckedOut = todayRecord && todayRecord.clock_out;

                return (
                  <div key={staff.id} className="donezo-quick-clock-card">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium text-sm">{staff.full_name}</span>
                      </div>

                      {todayRecord && (
                        <div className="text-xs text-muted-foreground">
                          {todayRecord.clock_in && (
                            <div>In: {todayRecord.clock_in}</div>
                          )}
                          {todayRecord.clock_out && (
                            <div>Out: {todayRecord.clock_out}</div>
                          )}
                          {todayRecord.total_hours && (
                            <div>Hours: {todayRecord.total_hours.toFixed(2)}</div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {!isCheckedIn && !isCheckedOut && (
                          <button
                            onClick={() => handleClockAction(staff.id, 'in')}
                            className="donezo-header-button"
                            style={{ flex: 1, background: 'var(--primary-green)' }}
                          >
                            Clock In
                          </button>
                        )}

                        {isCheckedIn && (
                          <button
                            onClick={() => handleClockAction(staff.id, 'out')}
                            className="donezo-header-button secondary"
                            style={{ flex: 1, color: '#ef4444', borderColor: '#ef4444' }}
                          >
                            Clock Out
                          </button>
                        )}

                        {isCheckedOut && (
                          <span className="donezo-dentist-badge inactive" style={{ flex: 1, textAlign: 'center' }}>
                            Complete
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="donezo-section" style={{ marginBottom: '24px' }}>
          <div className="appointments-filter-bar">
            <div className="donezo-form-field">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="donezo-input"
              />
            </div>

            {canManageAttendance && (
              <div className="donezo-form-field">
                <label htmlFor="staff">Staff Member</label>
                <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)} className="donezo-select" style={{ width: '200px' }}>
                  <option value="">All Staff</option>
                  {staffUsers.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-end">
              <button className="donezo-header-button secondary" onClick={fetchAttendanceRecords}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="donezo-section">
          <div className="donezo-section-header">
            <h3 className="donezo-section-title">Attendance Records</h3>
          </div>
          {loading ? (
            <div className="text-center py-8">Loading attendance records...</div>
          ) : attendanceRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="donezo-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Break (min)</th>
                    <th>Total Hours</th>
                    <th>Hourly Rate</th>
                    <th>Daily Pay</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="font-medium">
                        {record.staff_name}
                      </td>
                      <td>
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td>
                        {record.clock_in ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {record.clock_in}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td>
                        {record.clock_out ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {record.clock_out}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td>{record.break_duration}</td>
                      <td>
                        {record.total_hours ? (
                          <span className="font-medium">
                            {record.total_hours.toFixed(2)}h
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td>
                        {record.staff_hourly_rate ? (
                          <span>₱{record.staff_hourly_rate}/hr</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td>
                        {record.daily_pay ? (
                          <span className="font-medium" style={{ color: 'var(--primary-green)' }}>
                            ₱{record.daily_pay.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td>
                        {record.clock_in && record.clock_out ? (
                          <span className="donezo-dentist-badge active">Complete</span>
                        ) : record.clock_in ? (
                          <span className="donezo-dentist-badge on-leave">In Progress</span>
                        ) : (
                          <span className="donezo-dentist-badge inactive">Not Started</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {isNewAttendanceOpen && (
          <div className="donezo-dialog-overlay" onClick={() => setIsNewAttendanceOpen(false)}>
            <div className="donezo-dialog-content" onClick={e => e.stopPropagation()}>
              <div className="donezo-dialog-header">
                <h3 className="donezo-dialog-title">Add Attendance Record</h3>
              </div>
              <form onSubmit={handleCreateAttendance} className="space-y-4">
                <div className="donezo-form-field">
                  <label htmlFor="staff">Staff Member *</label>
                  <select
                    value={newAttendance.staff_user_id}
                    onChange={(e) => setNewAttendance(prev => ({ ...prev, staff_user_id: e.target.value }))}
                    className="donezo-select"
                  >
                    <option value="">Select staff member</option>
                    {staffUsers.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="donezo-form-field">
                  <label htmlFor="date">Date *</label>
                  <input
                    type="date"
                    value={newAttendance.date}
                    onChange={(e) => setNewAttendance(prev => ({ ...prev, date: e.target.value }))}
                    className="donezo-input"
                    required
                  />
                </div>

                <div className="donezo-form-grid">
                  <div className="donezo-form-field">
                    <label htmlFor="clock_in">Clock In</label>
                    <input
                      type="time"
                      value={newAttendance.clock_in}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, clock_in: e.target.value }))}
                      className="donezo-input"
                    />
                  </div>
                  <div className="donezo-form-field">
                    <label htmlFor="clock_out">Clock Out</label>
                    <input
                      type="time"
                      value={newAttendance.clock_out}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, clock_out: e.target.value }))}
                      className="donezo-input"
                    />
                  </div>
                </div>

                <div className="donezo-form-field">
                  <label htmlFor="break_duration">Break Duration (minutes)</label>
                  <input
                    type="number"
                    value={newAttendance.break_duration}
                    onChange={(e) => setNewAttendance(prev => ({ ...prev, break_duration: parseInt(e.target.value) || 0 }))}
                    className="donezo-input"
                  />
                </div>

                <div className="donezo-dialog-footer">
                  <button type="button" className="donezo-header-button secondary" onClick={() => setIsNewAttendanceOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="donezo-header-button">
                    {loading ? 'Creating...' : 'Create Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PageWrapper>
    );
  } catch (error: any) {
    console.error('=== ProductionAttendancePage RENDER ERROR ===', error);
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-red-600">Attendance Page Render Error</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Render Error:</strong> {error.message}
        </div>
      </div>
    );
  }
}