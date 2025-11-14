import { useState, useEffect } from "react";
import { Clock, LogIn, LogOut, Coffee, AlertCircle, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { staff } from "../data/staff";
import { dentists } from "../data/dentists";
import { 
  addAttendanceRecord,
  calculateHoursWorked,
  calculateLateDeduction,
  calculateOvertimePay,
  getAllAttendanceRecords
} from "../data/payroll";

export function AttendancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [timeIn, setTimeIn] = useState<string | null>(null);
  const [breakStart, setBreakStart] = useState<string | null>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate hours worked
  const getHoursWorked = () => {
    if (!timeIn) return "0h 0m";
    const start = new Date(timeIn);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleLogIn = () => {
    const now = new Date();
    setTimeIn(now.toISOString());
    setIsLoggedIn(true);
  };

  const handleLogOut = () => {
    // Record attendance
    if (timeIn) {
      const now = new Date();
      const timeOutStr = now.toTimeString().slice(0, 5);
      const timeInStr = new Date(timeIn).toTimeString().slice(0, 5);
      
      // For demo - using first staff member
      const staffMember = staff[0];
      const { regularHours, overtimeHours } = calculateHoursWorked(timeInStr, timeOutStr);
      const dailyRate = staffMember.salaryStructure.basicRate;
      const overtimePay = calculateOvertimePay(overtimeHours, dailyRate);
      
      addAttendanceRecord({
        employeeId: staffMember.id,
        employeeName: staffMember.name,
        employeeType: "staff",
        date: now.toISOString().split('T')[0],
        timeIn: timeInStr,
        timeOut: timeOutStr,
        regularHours,
        overtimeHours,
        lateMinutes: 0,
        basicPay: dailyRate,
        overtimePay,
        lateDeduction: 0,
        netDailyPay: dailyRate + overtimePay
      });
    }
    
    setIsLoggedIn(false);
    setTimeIn(null);
    setBreakStart(null);
    setIsOnBreak(false);
  };

  const handleStartBreak = () => {
    setBreakStart(new Date().toISOString());
    setIsOnBreak(true);
  };

  const handleEndBreak = () => {
    setIsOnBreak(false);
    setBreakStart(null);
  };

  return (
    <div className="space-y-6">
      {/* Current Time Display */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-sm opacity-90 mb-2">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-6xl mb-4">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            
            {isLoggedIn ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-lg">Logged In</span>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm opacity-90 mb-1">Time In: {new Date(timeIn!).toLocaleTimeString()}</p>
                  <p className="text-2xl">Hours Today: {getHoursWorked()}</p>
                </div>

                <div className="flex gap-3 justify-center">
                  {!isOnBreak ? (
                    <>
                      <Button 
                        onClick={handleStartBreak}
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30 text-white border-0"
                      >
                        <Coffee className="w-4 h-4 mr-2" />
                        Start Break
                      </Button>
                      <Button 
                        onClick={handleLogOut}
                        variant="secondary"
                        className="bg-red-500 hover:bg-red-600 text-white border-0"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log Out
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={handleEndBreak}
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white border-0"
                    >
                      <Coffee className="w-4 h-4 mr-2" />
                      End Break
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleLogIn}
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Log In Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-gray-900">32h 15m</p>
                <p className="text-xs text-gray-500 mt-1">4 days worked</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Overtime</p>
                <p className="text-gray-900">2h 15m</p>
                <p className="text-xs text-gray-500 mt-1">This week</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-gray-900">Perfect</p>
                <p className="text-xs text-gray-500 mt-1">No absences</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="flex gap-4">
        <ManualAttendanceEntry />
        <OvertimeRequest />
      </div>

      {/* Attendance History */}
      <AttendanceHistory />
    </div>
  );
}

// Manual Attendance Entry (Admin only)
function ManualAttendanceEntry() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    staffMember: "",
    date: "",
    timeIn: "",
    timeOut: "",
    lateMinutes: "0"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const staffMember = staff.find(s => s.id === formData.staffMember);
    if (!staffMember) return;
    
    const lateMinutes = parseInt(formData.lateMinutes) || 0;
    const dailyRate = staffMember.salaryStructure.basicRate;
    
    let regularHours = 0;
    let overtimeHours = 0;
    
    if (formData.timeOut) {
      const hoursWorked = calculateHoursWorked(formData.timeIn, formData.timeOut);
      regularHours = hoursWorked.regularHours;
      overtimeHours = hoursWorked.overtimeHours;
    } else {
      regularHours = 8;
    }
    
    const basicPay = dailyRate;
    const overtimePay = calculateOvertimePay(overtimeHours, dailyRate);
    const lateDeduction = calculateLateDeduction(lateMinutes, dailyRate);
    const netDailyPay = basicPay + overtimePay - lateDeduction;
    
    addAttendanceRecord({
      employeeId: formData.staffMember,
      employeeName: staffMember.name,
      employeeType: "staff",
      date: formData.date,
      timeIn: formData.timeIn,
      timeOut: formData.timeOut || undefined,
      regularHours: regularHours,
      overtimeHours: overtimeHours,
      lateMinutes: lateMinutes,
      basicPay: basicPay,
      overtimePay: overtimePay,
      lateDeduction: lateDeduction,
      netDailyPay: netDailyPay
    });
    
    setOpen(false);
    setFormData({
      staffMember: "",
      date: "",
      timeIn: "",
      timeOut: "",
      lateMinutes: "0"
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Manual Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manual Attendance Entry</DialogTitle>
          <DialogDescription>Enter attendance details manually.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="staffMember">Staff Member</Label>
            <Select value={formData.staffMember} onValueChange={(value) => setFormData({ ...formData, staffMember: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map(staffMember => (
                  <SelectItem key={staffMember.id} value={staffMember.id}>{staffMember.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeIn">Time In</Label>
              <Input
                id="timeIn"
                type="time"
                value={formData.timeIn}
                onChange={(e) => setFormData({ ...formData, timeIn: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeOut">Time Out</Label>
              <Input
                id="timeOut"
                type="time"
                value={formData.timeOut}
                onChange={(e) => setFormData({ ...formData, timeOut: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lateMinutes">Late (minutes)</Label>
            <Input
              id="lateMinutes"
              type="number"
              min="0"
              placeholder="0"
              value={formData.lateMinutes}
              onChange={(e) => setFormData({ ...formData, lateMinutes: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Save Attendance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Overtime Request
function OvertimeRequest() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    reason: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Overtime request:", formData);
    setOpen(false);
    setFormData({
      date: "",
      startTime: "",
      endTime: "",
      reason: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Clock className="w-4 h-4 mr-2" />
          Request Overtime
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Overtime</DialogTitle>
          <DialogDescription>Request overtime for a specific date and time.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Reason for overtime..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Attendance History
function AttendanceHistory() {
  const records = getAllAttendanceRecords();
  const recentRecords = records.slice(0, 7); // Last 7 days

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b">
        <CardTitle>Attendance History</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {recentRecords.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No attendance records yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-gray-900">{new Date(record.date).toLocaleDateString()}</p>
                    <Badge variant="outline" className="text-xs">{record.employeeName}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>In: {record.timeIn}</span>
                    {record.timeOut && <span>Out: {record.timeOut}</span>}
                    <span>Hours: {record.regularHours.toFixed(1)}h</span>
                    {record.overtimeHours > 0 && (
                      <span className="text-orange-600">OT: {record.overtimeHours.toFixed(1)}h</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Net Pay</p>
                  <p className="text-gray-900">₱{record.netDailyPay.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}