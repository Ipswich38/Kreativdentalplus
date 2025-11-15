import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Calendar, Clock, User, Plus, Search, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import type { User } from "../data/users";

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

  try {
    console.log('=== ProductionAttendancePage RENDER START ===');

    return (
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance Tracking</h2>
          <p className="text-muted-foreground">
            {canManageAttendance
              ? "Track staff attendance and work hours"
              : "View your attendance records"}
          </p>
        </div>

        {canManageAttendance && (
          <Dialog open={isNewAttendanceOpen} onOpenChange={setIsNewAttendanceOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Attendance Record</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreateAttendance} className="space-y-4">
                <div>
                  <Label htmlFor="staff">Staff Member *</Label>
                  <Select
                    value={newAttendance.staff_user_id}
                    onValueChange={(value) => setNewAttendance(prev => ({ ...prev, staff_user_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffUsers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    type="date"
                    value={newAttendance.date}
                    onChange={(e) => setNewAttendance(prev => ({ ...prev, date: e.target.value }))}
                    className="touch-feedback text-base"
                    style={{ fontSize: '16px' }}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clock_in">Clock In</Label>
                    <Input
                      type="time"
                      value={newAttendance.clock_in}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, clock_in: e.target.value }))}
                      className="touch-feedback text-base"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clock_out">Clock Out</Label>
                    <Input
                      type="time"
                      value={newAttendance.clock_out}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, clock_out: e.target.value }))}
                      className="touch-feedback text-base"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="break_duration">Break Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={newAttendance.break_duration}
                    onChange={(e) => setNewAttendance(prev => ({ ...prev, break_duration: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsNewAttendanceOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Record'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Quick Clock Actions */}
      {canManageAttendance && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Clock Actions - Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {staffUsers.slice(0, 8).map((staff) => {
                const todayRecord = getTodayAttendance(staff.id);
                const isCheckedIn = todayRecord && todayRecord.clock_in && !todayRecord.clock_out;
                const isCheckedOut = todayRecord && todayRecord.clock_out;

                return (
                  <Card key={staff.id} className="p-4">
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
                          <Button
                            onClick={() => handleClockAction(staff.id, 'in')}
                            className="flex-1 touch-feedback min-h-[48px] text-base md:text-sm font-medium bg-emerald-600 hover:bg-emerald-700"
                            style={{ fontSize: '16px' }}
                          >
                            🟢 Clock In
                          </Button>
                        )}

                        {isCheckedIn && (
                          <Button
                            variant="outline"
                            onClick={() => handleClockAction(staff.id, 'out')}
                            className="flex-1 touch-feedback min-h-[48px] text-base md:text-sm font-medium border-red-300 text-red-600 hover:bg-red-50"
                            style={{ fontSize: '16px' }}
                          >
                            🔴 Clock Out
                          </Button>
                        )}

                        {isCheckedOut && (
                          <Badge variant="secondary" className="flex-1 justify-center">
                            Complete
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {canManageAttendance && (
              <div>
                <Label htmlFor="staff">Staff Member</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Staff</SelectItem>
                    {staffUsers.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-end">
              <Button variant="outline" onClick={fetchAttendanceRecords}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>

          {/* Attendance Table */}
          {loading ? (
            <div className="text-center py-8">Loading attendance records...</div>
          ) : attendanceRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Break (min)</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead>Daily Pay</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.staff_name}
                      </TableCell>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {record.clock_in ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {record.clock_in}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.clock_out ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {record.clock_out}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{record.break_duration}</TableCell>
                      <TableCell>
                        {record.total_hours ? (
                          <span className="font-medium">
                            {record.total_hours.toFixed(2)}h
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.staff_hourly_rate ? (
                          <span>₱{record.staff_hourly_rate}/hr</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.daily_pay ? (
                          <span className="font-medium text-green-600">
                            ₱{record.daily_pay.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.clock_in && record.clock_out ? (
                          <Badge variant="default">Complete</Badge>
                        ) : record.clock_in ? (
                          <Badge variant="secondary">In Progress</Badge>
                        ) : (
                          <Badge variant="outline">Not Started</Badge>
                        )}
                      </TableCell>
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