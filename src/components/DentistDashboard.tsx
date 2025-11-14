import { Calendar, Users, DollarSign, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import type { User } from "../data/users";

interface DentistDashboardProps {
  currentUser: User;
}

export function DentistDashboard({ currentUser }: DentistDashboardProps) {
  // Mock data - in production, this would be filtered by dentist ID
  const todayAppointments = [
    { time: "09:00 AM", patient: "Maria Santos", service: "Oral Prophylaxis", status: "completed" },
    { time: "10:30 AM", patient: "Juan Dela Cruz", service: "Tooth Extraction", status: "completed" },
    { time: "02:00 PM", patient: "Anna Reyes", service: "Dental Filling", status: "pending" },
    { time: "03:30 PM", patient: "Pedro Garcia", service: "Root Canal", status: "pending" },
  ];

  const thisMonthEarnings = {
    commissions: 45000,
    basicPay: 0,
    total: 45000,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <h2 className="text-gray-900 mb-1">Welcome, {currentUser.name}</h2>
        <p className="text-gray-600">{currentUser.position}</p>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Appointments" value="4" icon={Calendar} color="blue" />
        <StatCard title="My Patients" value="87" icon={Users} color="cyan" />
        <StatCard title="This Month Earnings" value={`₱${thisMonthEarnings.total.toLocaleString()}`} icon={DollarSign} color="green" />
        <StatCard title="Completed Today" value="2" icon={Clock} color="purple" />
      </div>

      {/* Today's Schedule */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {todayAppointments.map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-sm text-gray-900">{appointment.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{appointment.patient}</p>
                    <p className="text-xs text-gray-600">{appointment.service}</p>
                  </div>
                </div>
                <Badge 
                  variant={appointment.status === "completed" ? "default" : "secondary"}
                  className={appointment.status === "completed" 
                    ? "bg-green-100 text-green-700 hover:bg-green-100" 
                    : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                  }
                >
                  {appointment.status === "completed" ? "Completed" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>This Month Earnings</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Commissions</span>
              <span className="text-gray-900">₱{thisMonthEarnings.commissions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Basic Pay</span>
              <span className="text-gray-900">₱{thisMonthEarnings.basicPay.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-gray-900">Total</span>
              <span className="text-lg text-gray-900">₱{thisMonthEarnings.total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>This Month Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Appointments</span>
              <span className="text-gray-900">48</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-gray-900">45</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cancelled</span>
              <span className="text-gray-900">3</span>
            </div>
            <div className="border-t pt-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">15% increase from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Quick Access</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg hover:shadow-md transition-all text-center">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-900">My Schedule</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg hover:shadow-md transition-all text-center">
              <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-900">My Patients</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-all text-center">
              <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-900">Earnings</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg hover:shadow-md transition-all text-center">
              <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-900">Attendance</p>
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
