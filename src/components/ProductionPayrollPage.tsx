import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Calculator, Users, DollarSign, FileSpreadsheet, Download, Plus, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from '../lib/supabase';
import type { User } from "../data/users";

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

  // Permission checks - more permissive for testing
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
          toast.error('Payroll table not found. Please contact IT administrator to set up the database.');
          setPayrollRecords([]);
          return;
        }
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          toast.error('Payroll table structure needs updating. Please contact IT administrator.');
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
      toast.error('Failed to load payroll records. Database may need setup.');
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
          toast.error('Attendance table not found. Please contact IT administrator to set up the database.');
          setAttendanceSummary([]);
          return;
        }
        if (attendanceError.message.includes('column') && attendanceError.message.includes('does not exist')) {
          toast.error('Attendance table structure needs updating. Please contact IT administrator.');
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

      setAttendanceSummary(Object.values(staffSummary));
    } catch (error: any) {
      console.error('Error calculating attendance summary:', error);
      toast.error('Failed to calculate attendance summary');
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
    try {
      fetchPayrollRecords();
    } catch (error) {
      console.error('Error in initial fetchPayrollRecords:', error);
    }
  }, []);

  // Refresh when period changes
  useEffect(() => {
    console.log('ProductionPayrollPage period/user changed, refetching...');
    try {
      fetchPayrollRecords();
    } catch (error) {
      console.error('Error in refresh fetchPayrollRecords:', error);
    }
  }, [selectedPeriod, currentUser]);

  // Add error boundary protection
  try {
    return (
      <div className="space-y-6">
        {/* Debug info */}
        <div className="text-xs text-gray-500">
          Debug: User role: {currentUser.role}, Can manage: {canManagePayroll.toString()}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-emerald-800">KreativPayroll</h2>
          <p className="text-muted-foreground">
            {canManagePayroll
              ? "Automated payroll processing and management"
              : "View your payroll information"}
          </p>
        </div>

        <div className="flex gap-2">
          {canManagePayroll && (
            <>
              <Dialog open={isGeneratePayrollOpen} onOpenChange={setIsGeneratePayrollOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Calculator className="mr-2 h-4 w-4" />
                    Generate Payroll
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Generate Payroll</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleGeneratePayroll} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_date">Pay Period Start *</Label>
                        <Input
                          type="date"
                          value={payrollPeriod.start_date}
                          onChange={(e) => setPayrollPeriod(prev => ({ ...prev, start_date: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_date">Pay Period End *</Label>
                        <Input
                          type="date"
                          value={payrollPeriod.end_date}
                          onChange={(e) => setPayrollPeriod(prev => ({ ...prev, end_date: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    {/* Show attendance summary if period is selected */}
                    {payrollPeriod.start_date && payrollPeriod.end_date && (
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => calculateAttendanceSummary(payrollPeriod.start_date, payrollPeriod.end_date)}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Preview Attendance Summary
                        </Button>

                        {attendanceSummary.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-2">Attendance Summary</h4>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Staff</TableHead>
                                    <TableHead>Days Worked</TableHead>
                                    <TableHead>Regular Hours</TableHead>
                                    <TableHead>Overtime Hours</TableHead>
                                    <TableHead>Hourly Rate</TableHead>
                                    <TableHead>Gross Pay</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {attendanceSummary.map((staff) => (
                                    <TableRow key={staff.staff_user_id}>
                                      <TableCell>{staff.staff_name}</TableCell>
                                      <TableCell>{staff.days_worked}</TableCell>
                                      <TableCell>{staff.regular_hours.toFixed(2)}h</TableCell>
                                      <TableCell>{staff.overtime_hours.toFixed(2)}h</TableCell>
                                      <TableCell>₱{staff.hourly_rate}/hr</TableCell>
                                      <TableCell className="font-medium">₱{staff.gross_pay.toFixed(2)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsGeneratePayrollOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading || attendanceSummary.length === 0}>
                        {loading ? 'Generating...' : `Generate Payroll for ${attendanceSummary.length} Staff`}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={exportPayrollData}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {canManagePayroll && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(payrollRecords.map(r => r.staff_user_id)).size}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payroll</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payrollRecords.filter(r => r.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gross Pay</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₱{payrollRecords.reduce((sum, r) => sum + r.gross_pay, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Net Pay</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                ₱{payrollRecords.reduce((sum, r) => sum + r.net_pay, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payroll Records */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payroll Records</CardTitle>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All periods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Periods</SelectItem>
                  {generatePayPeriods().map(period => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading payroll records...</div>
          ) : payrollRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payroll records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Pay Period</TableHead>
                    <TableHead>Regular Hours</TableHead>
                    <TableHead>Overtime Hours</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    {canManagePayroll && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.staff_name}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(record.pay_period_start).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            to {new Date(record.pay_period_end).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{record.regular_hours.toFixed(2)}h</TableCell>
                      <TableCell>{record.overtime_hours.toFixed(2)}h</TableCell>
                      <TableCell className="font-medium">₱{record.gross_pay.toFixed(2)}</TableCell>
                      <TableCell>₱{record.deductions.toFixed(2)}</TableCell>
                      <TableCell className="font-bold text-emerald-600">
                        ₱{record.net_pay.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === 'paid' ? 'default' :
                            record.status === 'approved' ? 'secondary' : 'outline'
                          }
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      {canManagePayroll && (
                        <TableCell>
                          <div className="flex gap-1">
                            {record.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => updatePayrollStatus(record.id, 'approved')}
                              >
                                Approve
                              </Button>
                            )}
                            {record.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePayrollStatus(record.id, 'paid')}
                              >
                                Mark Paid
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
  } catch (error) {
    console.error('Error rendering ProductionPayrollPage:', error);
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold text-red-600">Payroll System Error</h2>
        <p className="text-gray-600">There was an error loading the payroll page.</p>
        <details className="mt-4">
          <summary className="cursor-pointer">Error Details</summary>
          <pre className="mt-2 p-2 bg-gray-100 text-xs overflow-auto">
            {error instanceof Error ? error.stack : String(error)}
          </pre>
        </details>
      </div>
    );
  }
}