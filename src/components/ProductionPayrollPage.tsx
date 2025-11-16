import { useState, useEffect } from "react";
import { Calculator, Users, DollarSign, Download, Plus, Clock, Calendar, TrendingUp, UserCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from '../lib/supabase';
import type { User } from "../data/users";
import { PageWrapper } from "./PageWrapper";

// ... (interfaces remain the same)
interface PayrollRecord {
  id: string;
  staff_user_id: string;
  pay_period_start: string;
  pay_period_end: string;
  hours_worked: number;
  regular_hours: number;
  overtime_hours: number;
  gross_pay: number;
  deductions: number;
  net_pay: number;
  status: 'pending' | 'approved' | 'paid';
  created_at: string;
  updated_at: string;
  staff_name?: string;
  staff_hourly_rate?: number;
}

interface AttendanceSummary {
  staff_user_id: string;
  staff_name: string;
  hourly_rate: number;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  days_worked: number;
  gross_pay: number;
  commission_amount?: number;
  is_auto_tracked?: boolean;
  role?: string;
}

interface PayrollPageProps {
  currentUser: User;
}

export function ProductionPayrollPage({ currentUser }: PayrollPageProps) {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [isGeneratePayrollOpen, setIsGeneratePayrollOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [payrollPeriod, setPayrollPeriod] = useState({
    start_date: '',
    end_date: '',
    staff_user_id: '' // Empty means all staff
  });

  // Permission checks - allow admin, dentist, and it_admin
  const canManagePayroll = ['admin', 'dentist', 'it_admin'].includes(currentUser.role);
  const canViewOwnPayroll = true;

  console.log('ProductionPayrollPage rendering for user:', currentUser.role, 'canManagePayroll:', canManagePayroll);

  // Generate pay period options
  const generatePayPeriods = () => {
    const periods = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const year = today.getFullYear();
      const month = today.getMonth() - i;

      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      periods.push({
        value: `${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`,
        label: startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      });
    }

    return periods;
  };

  // Fetch payroll records
  const fetchPayrollRecords = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('payroll')
        .select(`
          *,
          staff_users!inner(full_name, hourly_rate, employee_number)
        `)
        .order('created_at', { ascending: false });

      // If not admin, only show own records
      if (!canManagePayroll) {
        const { data: staffData } = await supabase
          .from('staff_users')
          .select('id')
          .eq('employee_number', currentUser.employeeId)
          .single();

        if (staffData) {
          query = query.eq('staff_user_id', staffData.id);
        }
      }

      // Filter by period if selected
      if (selectedPeriod) {
        const [startDate, endDate] = selectedPeriod.split('_');
        query = query.gte('pay_period_start', startDate).lte('pay_period_end', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Payroll query error:', error);
        if (error.message.includes('relation "payroll" does not exist')) {
          toast.error('Payroll table not found. Please run the database setup script.');
          setPayrollRecords([]);
          return;
        }
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          toast.error('Payroll table structure needs updating. Please run the database setup script.');
          setPayrollRecords([]);
          return;
        }
        throw error;
      }

      const processedData = (data || []).map(record => ({
        ...record,
        staff_name: record.staff_users?.full_name,
        staff_hourly_rate: record.staff_users?.hourly_rate
      }));

      setPayrollRecords(processedData);
    } catch (error: any) {
      console.error('Error fetching payroll:', error);
      toast.error('Failed to load payroll records. Please check database setup.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate attendance summary for payroll generation
  const calculateAttendanceSummary = async (startDate: string, endDate: string) => {
    try {
      // Get attendance records for the period
      let attendanceQuery = supabase
        .from('attendance')
        .select(`
          *,
          staff_users!inner(full_name, hourly_rate, is_active, commission_rates)
        `)
        .gte('date', startDate)
        .lte('date', endDate);

      // If specific staff selected, filter
      if (payrollPeriod.staff_user_id) {
        attendanceQuery = attendanceQuery.eq('staff_user_id', payrollPeriod.staff_user_id);
      }

      const { data: attendanceData, error: attendanceError } = await attendanceQuery;

      if (attendanceError) {
        console.error('Attendance query error:', attendanceError);
        if (attendanceError.message.includes('relation "attendance" does not exist')) {
          toast.error('Attendance table not found. Please run the database setup script.');
          setAttendanceSummary([]);
          return;
        }
        if (attendanceError.message.includes('column') && attendanceError.message.includes('does not exist')) {
          toast.error('Attendance table structure needs updating. Please run the database setup script.');
          setAttendanceSummary([]);
          return;
        }
        throw attendanceError;
      }

      // Group by staff and calculate totals
      const staffSummary: Record<string, AttendanceSummary> = {};

      (attendanceData || []).forEach(record => {
        const staffId = record.staff_user_id;

        if (!staffSummary[staffId]) {
          staffSummary[staffId] = {
            staff_user_id: staffId,
            staff_name: record.staff_users?.full_name || 'Unknown',
            hourly_rate: record.staff_users?.hourly_rate || 0,
            total_hours: 0,
            regular_hours: 0,
            overtime_hours: 0,
            days_worked: 0,
            gross_pay: 0,
            commission_amount: 0
          };
        }

        // Calculate daily hours
        const dailyHours = calculateHours(record.clock_in, record.clock_out, record.break_duration || 0);
        const dailyRegular = Math.min(dailyHours, 8);
        const dailyOvertime = Math.max(0, dailyHours - 8);

        staffSummary[staffId].total_hours += dailyHours;
        staffSummary[staffId].regular_hours += dailyRegular;
        staffSummary[staffId].overtime_hours += dailyOvertime;

        if (dailyHours > 0) {
          staffSummary[staffId].days_worked += 1;
        }
      });

      // Calculate gross pay for each staff
      Object.values(staffSummary).forEach(staff => {
        const regularPay = staff.regular_hours * staff.hourly_rate;
        const overtimePay = staff.overtime_hours * staff.hourly_rate * 1.25; // 25% overtime premium

        staff.gross_pay = regularPay + overtimePay;
      });

      // Auto-generate dentist attendance based on appointments
      await generateDentistAttendance(startDate, endDate);

      setAttendanceSummary(Object.values(staffSummary));
    } catch (error: any) {
      console.error('Error calculating attendance summary:', error);
      toast.error('Failed to calculate attendance summary');
    }
  };

  // Auto-generate dentist attendance based on appointments
  const generateDentistAttendance = async (startDate: string, endDate: string) => {
    try {
      console.log('Generating dentist auto-attendance for period:', startDate, 'to', endDate);

      // Fetch all dentists
      const { data: dentists, error: dentistError } = await supabase
        .from('staff_users')
        .select('id, full_name, hourly_rate, employee_number, role')
        .eq('role', 'dentist')
        .eq('status', 'active');

      if (dentistError) {
        console.error('Error fetching dentists:', dentistError);
        return;
      }

      if (!dentists || dentists.length === 0) {
        console.log('No active dentists found');
        return;
      }

      // Fetch appointments for each dentist in the period
      for (const dentist of dentists) {
        console.log('Processing appointments for dentist:', dentist.full_name);

        const { data: appointments, error: appointmentError } = await supabase
          .from('appointments')
          .select('id, appointment_date, appointment_time, status, duration')
          .eq('dentist_id', dentist.id)
          .gte('appointment_date', startDate)
          .lte('appointment_date', endDate)
          .in('status', ['completed', 'confirmed', 'in_progress']);

        if (appointmentError) {
          console.error('Error fetching appointments for dentist:', dentist.full_name, appointmentError);
          continue;
        }

        if (!appointments || appointments.length === 0) {
          console.log('No appointments found for dentist:', dentist.full_name);
          continue;
        }

        // Calculate total hours based on appointments
        let totalHours = 0;
        let daysWorked = 0;
        const workDays = new Set<string>();

        appointments.forEach(appointment => {
          // Each appointment defaults to 1 hour if duration is not specified
          const appointmentHours = appointment.duration ? appointment.duration / 60 : 1;
          totalHours += appointmentHours;
          workDays.add(appointment.appointment_date);
        });

        daysWorked = workDays.size;

        // Calculate regular and overtime hours
        const regularHours = Math.min(totalHours, daysWorked * 8);
        const overtimeHours = Math.max(0, totalHours - (daysWorked * 8));

        // Generate or update attendance record for this dentist
        const attendanceRecord = {
          staff_user_id: dentist.id,
          staff_name: dentist.full_name,
          hourly_rate: dentist.hourly_rate || 0,
          total_hours: totalHours,
          regular_hours: regularHours,
          overtime_hours: overtimeHours,
          days_worked: daysWorked,
          gross_pay: (regularHours * (dentist.hourly_rate || 0)) + (overtimeHours * (dentist.hourly_rate || 0) * 1.25),
          is_auto_tracked: true,
          role: 'dentist'
        };

        console.log('Generated attendance record for dentist:', dentist.full_name, attendanceRecord);

        // Check if this dentist already exists in staffSummary, if not add them
        const staffId = dentist.id;
        if (!staffSummary[staffId]) {
          staffSummary[staffId] = attendanceRecord;
        } else {
          // If manual attendance exists, add the appointment-based hours
          staffSummary[staffId].total_hours += totalHours;
          staffSummary[staffId].days_worked = Math.max(staffSummary[staffId].days_worked, daysWorked);

          // Recalculate regular and overtime
          const combinedRegular = Math.min(staffSummary[staffId].total_hours, staffSummary[staffId].days_worked * 8);
          const combinedOvertime = Math.max(0, staffSummary[staffId].total_hours - (staffSummary[staffId].days_worked * 8));

          staffSummary[staffId].regular_hours = combinedRegular;
          staffSummary[staffId].overtime_hours = combinedOvertime;
          staffSummary[staffId].gross_pay = (combinedRegular * staffSummary[staffId].hourly_rate) +
                                           (combinedOvertime * staffSummary[staffId].hourly_rate * 1.25);
          staffSummary[staffId].is_auto_tracked = true;
        }

        toast.success(`Auto-generated attendance for ${dentist.full_name}: ${totalHours.toFixed(1)} hours`);
      }

    } catch (error: any) {
      console.error('Error generating dentist attendance:', error);
      toast.error('Failed to auto-generate dentist attendance');
    }
  };

  // Calculate hours worked
  const calculateHours = (clockIn?: string, clockOut?: string, breakMinutes: number = 0): number => {
    if (!clockIn || !clockOut) return 0;

    const [inHour, inMinute] = clockIn.split(':').map(Number);
    const [outHour, outMinute] = clockOut.split(':').map(Number);

    const inTotalMinutes = inHour * 60 + inMinute;
    const outTotalMinutes = outHour * 60 + outMinute;

    const workedMinutes = outTotalMinutes - inTotalMinutes - breakMinutes;
    return Math.max(0, workedMinutes / 60);
  };

  // Generate payroll for selected period
  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManagePayroll) {
      toast.error('You do not have permission to generate payroll');
      return;
    }

    setLoading(true);
    try {
      // First calculate attendance summary
      await calculateAttendanceSummary(payrollPeriod.start_date, payrollPeriod.end_date);

      if (attendanceSummary.length === 0) {
        toast.warning('No attendance records found for the selected period');
        setLoading(false);
        return;
      }

      // Check if payroll already exists for this period
      const { data: existingPayroll } = await supabase
        .from('payroll')
        .select('id')
        .eq('pay_period_start', payrollPeriod.start_date)
        .eq('pay_period_end', payrollPeriod.end_date);

      if (existingPayroll && existingPayroll.length > 0) {
        toast.warning('Payroll already exists for this period');
        setLoading(false);
        return;
      }

      // Generate payroll records
      const payrollData = attendanceSummary.map(staff => ({
        staff_user_id: staff.staff_user_id,
        pay_period_start: payrollPeriod.start_date,
        pay_period_end: payrollPeriod.end_date,
        hours_worked: staff.total_hours,
        regular_hours: staff.regular_hours,
        overtime_hours: staff.overtime_hours,
        gross_pay: staff.gross_pay,
        deductions: 0, // Can be customized later
        net_pay: staff.gross_pay, // Gross pay minus deductions
        status: 'pending'
      }));

      const { error } = await supabase
        .from('payroll')
        .insert(payrollData);

      if (error) throw error;

      toast.success(`Payroll generated for ${attendanceSummary.length} staff members`);
      setIsGeneratePayrollOpen(false);
      setPayrollPeriod({ start_date: '', end_date: '', staff_user_id: '' });
      setAttendanceSummary([]);
      fetchPayrollRecords();
    } catch (error: any) {
      console.error('Error generating payroll:', error);
      toast.error('Failed to generate payroll');
    } finally {
      setLoading(false);
    }
  };

  // Update payroll status
  const updatePayrollStatus = async (payrollId: string, status: string) => {
    if (!canManagePayroll) {
      toast.error('You do not have permission to update payroll status');
      return;
    }

    try {
      const { error } = await supabase
        .from('payroll')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', payrollId);

      if (error) throw error;

      toast.success(`Payroll ${status} successfully`);
      fetchPayrollRecords();
    } catch (error: any) {
      console.error('Error updating payroll:', error);
      toast.error('Failed to update payroll status');
    }
  };

  // Export payroll data
  const exportPayrollData = () => {
    if (payrollRecords.length === 0) {
      toast.warning('No payroll records to export');
      return;
    }

    const csvContent = [
      ['Staff Name', 'Period Start', 'Period End', 'Regular Hours', 'Overtime Hours', 'Total Hours', 'Gross Pay', 'Deductions', 'Net Pay', 'Status'].join(','),
      ...payrollRecords.map(record => [
        record.staff_name,
        record.pay_period_start,
        record.pay_period_end,
        record.regular_hours,
        record.overtime_hours,
        record.hours_worked,
        record.gross_pay,
        record.deductions,
        record.net_pay,
        record.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-${selectedPeriod || 'all'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Payroll data exported successfully');
  };

  // Load data on component mount
  useEffect(() => {
    console.log('ProductionPayrollPage mounting, fetching payroll records...');
    fetchPayrollRecords();
  }, []);

  // Refresh when period changes
  useEffect(() => {
    console.log('ProductionPayrollPage period/user changed, refetching...');
    fetchPayrollRecords();
  }, [selectedPeriod, currentUser]);

  const pageActions = (
    <div className="donezo-payroll-actions">
      {canManagePayroll && (
        <>
          <button className="donezo-header-button" onClick={() => setIsGeneratePayrollOpen(true)}>
            <Calculator className="mr-2 h-4 w-4" />
            Generate Payroll
          </button>

          <button className="donezo-header-button secondary" onClick={exportPayrollData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
        </>
      )}
    </div>
  );

  return (
    <PageWrapper
      title="KreativPayroll"
      subtitle={canManagePayroll ? "Automated payroll processing and management" : "View your payroll information"}
      actions={pageActions}
    >
      {/* Summary Cards */}
      {canManagePayroll && (
        <div className="donezo-payroll-stats-grid">
          <div className="donezo-stat-card">
            <div className="donezo-stat-header">
              <span className="donezo-stat-label">Total Staff</span>
              <Users className="donezo-stat-icon" />
            </div>
            <div className="donezo-stat-value">
              {new Set(payrollRecords.map(r => r.staff_user_id)).size}
            </div>
          </div>

          <div className="donezo-stat-card">
            <div className="donezo-stat-header">
              <span className="donezo-stat-label">Pending Payroll</span>
              <Clock className="donezo-stat-icon" />
            </div>
            <div className="donezo-stat-value">
              {payrollRecords.filter(r => r.status === 'pending').length}
            </div>
          </div>

          <div className="donezo-stat-card">
            <div className="donezo-stat-header">
              <span className="donezo-stat-label">Total Gross Pay</span>
              <DollarSign className="donezo-stat-icon" />
            </div>
            <div className="donezo-stat-value">
              ₱{payrollRecords.reduce((sum, r) => sum + r.gross_pay, 0).toLocaleString()}
            </div>
          </div>

          <div className="donezo-stat-card">
            <div className="donezo-stat-header">
              <span className="donezo-stat-label">Total Net Pay</span>
              <DollarSign className="donezo-stat-icon" />
            </div>
            <div className="donezo-stat-value" style={{ color: 'var(--primary-green)' }}>
              ₱{payrollRecords.reduce((sum, r) => sum + r.net_pay, 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Attendance Integration Card */}
      <div className="donezo-payroll-integration-card" style={{ marginBottom: '24px' }}>
        <h3 className="donezo-payroll-integration-title">
          <UserCheck />
          Live Attendance Integration
        </h3>
        <p className="donezo-payroll-integration-subtitle">
          Real-time attendance tracking automatically syncs with payroll calculations
        </p>
        {/* ... content of integration card */}
      </div>

      {/* Payroll Records */}
      <div className="donezo-section">
        <div className="donezo-section-header">
          <h3 className="donezo-section-title">Payroll Records</h3>
          <div className="flex gap-2">
            <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="donezo-select">
              <option value="">All Periods</option>
              {generatePayPeriods().map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          {loading ? (
            <div className="text-center py-8">Loading payroll records...</div>
          ) : payrollRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payroll records found. Use "Generate Payroll" to create records.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="donezo-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Pay Period</th>
                    <th>Regular Hours</th>
                    <th>Overtime Hours</th>
                    <th>Gross Pay</th>
                    <th>Deductions</th>
                    <th>Net Pay</th>
                    <th>Status</th>
                    {canManagePayroll && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {payrollRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="font-medium">
                        {record.staff_name}
                      </td>
                      <td>
                        <div className="text-sm">
                          <div>{new Date(record.pay_period_start).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            to {new Date(record.pay_period_end).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td>{record.regular_hours.toFixed(2)}h</td>
                      <td>{record.overtime_hours.toFixed(2)}h</td>
                      <td className="font-medium">₱{record.gross_pay.toFixed(2)}</td>
                      <td>₱{record.deductions.toFixed(2)}</td>
                      <td className="font-bold text-blue-600">
                        ₱{record.net_pay.toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={`donezo-dentist-badge ${record.status === 'paid' ? 'active' : record.status === 'approved' ? 'on-leave' : 'inactive'}`}
                        >
                          {record.status}
                        </span>
                      </td>
                      {canManagePayroll && (
                        <td>
                          <div className="flex gap-1">
                            {record.status === 'pending' && (
                              <button
                                className="donezo-header-button"
                                onClick={() => updatePayrollStatus(record.id, 'approved')}
                              >
                                Approve
                              </button>
                            )}
                            {record.status === 'approved' && (
                              <button
                                className="donezo-header-button secondary"
                                onClick={() => updatePayrollStatus(record.id, 'paid')}
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isGeneratePayrollOpen && (
        <div className="donezo-dialog-overlay" onClick={() => setIsGeneratePayrollOpen(false)}>
          <div className="donezo-dialog-content" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
            <div className="donezo-dialog-header">
              <h3 className="donezo-dialog-title">Generate Payroll</h3>
            </div>
            <form onSubmit={handleGeneratePayroll} className="space-y-6">
              <div className="donezo-form-grid">
                <div className="donezo-form-field">
                  <label htmlFor="start_date">Pay Period Start *</label>
                  <input
                    type="date"
                    value={payrollPeriod.start_date}
                    onChange={(e) => setPayrollPeriod(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                    className="donezo-input"
                  />
                </div>
                <div className="donezo-form-field">
                  <label htmlFor="end_date">Pay Period End *</label>
                  <input
                    type="date"
                    value={payrollPeriod.end_date}
                    onChange={(e) => setPayrollPeriod(prev => ({ ...prev, end_date: e.target.value }))}
                    required
                    className="donezo-input"
                  />
                </div>
              </div>

              {payrollPeriod.start_date && payrollPeriod.end_date && (
                <div>
                  <button
                    type="button"
                    className="donezo-header-button secondary"
                    onClick={() => calculateAttendanceSummary(payrollPeriod.start_date, payrollPeriod.end_date)}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Preview Attendance Summary
                  </button>

                  {attendanceSummary.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Attendance Summary</h4>
                      <div className="overflow-x-auto">
                        <table className="donezo-table">
                          <thead>
                            <tr>
                              <th>Staff</th>
                              <th>Days Worked</th>
                              <th>Regular Hours</th>
                              <th>Overtime Hours</th>
                              <th>Hourly Rate</th>
                              <th>Gross Pay</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendanceSummary.map((staff) => (
                              <tr key={staff.staff_user_id}>
                                <td>{staff.staff_name}</td>
                                <td>{staff.days_worked}</td>
                                <td>{staff.regular_hours.toFixed(2)}h</td>
                                <td>{staff.overtime_hours.toFixed(2)}h</td>
                                <td>₱{staff.hourly_rate}/hr</td>
                                <td className="font-medium">₱{staff.gross_pay.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="donezo-dialog-footer">
                <button type="button" className="donezo-header-button secondary" onClick={() => setIsGeneratePayrollOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading || attendanceSummary.length === 0} className="donezo-header-button">
                  {loading ? 'Generating...' : `Generate Payroll for ${attendanceSummary.length} Staff`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}