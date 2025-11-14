import { Clock, DollarSign, Calendar, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import type { User } from "../data/users";

interface StaffDashboardProps {
  currentUser: User;
}

export function StaffDashboard({ currentUser }: StaffDashboardProps) {
  // Mock data - in production, this would be filtered by staff ID
  const thisMonthAttendance = {
    daysWorked: 18,
    totalHours: 144,
    lateCount: 2,
    overtimeHours: 12,
  };

  const thisMonthEarnings = {
    basicPay: 9000, // 18 days * 500
    overtimePay: 1200,
    commissions: 2500,
    lateDeductions: -200,
    total: 12500,
  };

  const recentTasks = [
    { date: "Nov 14", task: "Assisted Dr. Jerome - Root Canal", status: "completed" },
    { date: "Nov 13", task: "Patient coordination - Maria Santos", status: "completed" },
    { date: "Nov 13", task: "Assisted Dr. Camila - Tooth Extraction", status: "completed" },
    { date: "Nov 12", task: "Treatment planning - Juan Dela Cruz", status: "completed" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <h2 className="text-gray-900 mb-1">Welcome, {currentUser.name}</h2>
        <p className="text-gray-600">{currentUser.position}</p>
        <p className="text-sm text-gray-500 mt-1">Employee ID: {currentUser.employeeId}</p>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Days Worked" 
          value={thisMonthAttendance.daysWorked.toString()} 
          icon={Calendar} 
          color="blue" 
        />
        <StatCard 
          title="Total Hours" 
          value={thisMonthAttendance.totalHours.toString()} 
          icon={Clock} 
          color="cyan" 
        />
        <StatCard 
          title="This Month Salary" 
          value={`₱${thisMonthEarnings.total.toLocaleString()}`} 
          icon={DollarSign} 
          color="green" 
        />
        <StatCard 
          title="Overtime Hours" 
          value={thisMonthAttendance.overtimeHours.toString()} 
          icon={CheckCircle2} 
          color="purple" 
        />
      </div>

      {/* Salary Breakdown */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>This Month Salary Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Basic Pay ({thisMonthAttendance.daysWorked} days)</span>
            <span className="text-gray-900">₱{thisMonthEarnings.basicPay.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Overtime Pay ({thisMonthAttendance.overtimeHours} hrs)</span>
            <span className="text-green-600">+₱{thisMonthEarnings.overtimePay.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Commissions</span>
            <span className="text-green-600">+₱{thisMonthEarnings.commissions.toLocaleString()}</span>
          </div>
          {thisMonthEarnings.lateDeductions !== 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Late Deductions</span>
              <span className="text-red-600">₱{thisMonthEarnings.lateDeductions.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="text-gray-900">Net Salary</span>
            <span className="text-lg text-gray-900">₱{thisMonthEarnings.total.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Attendance Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-900">{thisMonthAttendance.daysWorked}</p>
              <p className="text-xs text-gray-600">Days Present</p>
            </div>
            <div className="text-center">
              <p className="text-gray-900">{thisMonthAttendance.totalHours}</p>
              <p className="text-xs text-gray-600">Total Hours</p>
            </div>
            <div className="text-center">
              <p className="text-gray-900">{thisMonthAttendance.overtimeHours}</p>
              <p className="text-xs text-gray-600">Overtime</p>
            </div>
            <div className="text-center">
              <p className="text-orange-600">{thisMonthAttendance.lateCount}</p>
              <p className="text-xs text-gray-600">Late Count</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {recentTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-900">{task.task}</p>
                  <p className="text-xs text-gray-600">{task.date}</p>
                </div>
                <Badge 
                  variant="default"
                  className="bg-green-100 text-green-700 hover:bg-green-100"
                >
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Quick Access</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg hover:shadow-md transition-all text-center">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-900">My Attendance</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg hover:shadow-md transition-all text-center">
              <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-900">My Payroll</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-all text-center">
              <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-900">Schedule</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: "blue" | "cyan" | "green" | "purple";
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    cyan: "from-cyan-500 to-cyan-600",
    green: "from-green-500 to-emerald-600",
    purple: "from-purple-500 to-pink-500",
  };

  return (
    <div className="bg-white rounded-xl p-5 border-0 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-gray-900">{value}</p>
        </div>
        <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
