import { Calendar, Users, DollarSign, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { User } from "../data/users";

interface AdminDashboardProps {
  currentUser: User;
}

export function AdminDashboard({ currentUser }: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <h2 className="text-gray-900 mb-1">Welcome back, {currentUser.name}</h2>
        <p className="text-gray-600">System Administrator - Full Access</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Appointments" value="12" icon={Calendar} color="blue" />
        <StatCard title="Total Patients" value="342" icon={Users} color="cyan" />
        <StatCard title="Monthly Revenue" value="₱245,000" icon={DollarSign} color="green" />
        <StatCard title="Pending Payments" value="8" icon={Wallet} color="orange" />
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Active Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">9 Employees</p>
            <p className="text-sm text-gray-600 mt-1">3 Dentists, 5 Staff, 1 Receptionist</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">12 Appointments</p>
            <p className="text-sm text-gray-600 mt-1">8 Completed, 4 Pending</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Payroll Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">₱125,000</p>
            <p className="text-sm text-gray-600 mt-1">Current month payable</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <ActivityItem 
              title="New appointment scheduled"
              description="Maria Santos - Oral Prophylaxis"
              time="5 minutes ago"
              type="appointment"
            />
            <ActivityItem 
              title="Payment received"
              description="₱15,000 - Juan dela Cruz"
              time="1 hour ago"
              type="payment"
            />
            <ActivityItem 
              title="New patient registered"
              description="Anna Reyes"
              time="2 hours ago"
              type="patient"
            />
            <ActivityItem 
              title="Attendance logged"
              description="STF-002 - MS. MHAY BLANQUEZA"
              time="3 hours ago"
              type="attendance"
            />
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
  color: "blue" | "cyan" | "green" | "orange";
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    cyan: "from-cyan-500 to-cyan-600",
    green: "from-green-500 to-emerald-600",
    orange: "from-orange-500 to-amber-600",
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

// Activity Item Component
interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
  type: "appointment" | "payment" | "patient" | "attendance";
}

function ActivityItem({ title, description, time, type }: ActivityItemProps) {
  const colors = {
    appointment: "bg-blue-100 text-blue-600",
    payment: "bg-green-100 text-green-600",
    patient: "bg-purple-100 text-purple-600",
    attendance: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="flex items-start gap-3">
      <div className={`w-2 h-2 rounded-full mt-2 ${colors[type].replace('100', '500')}`} />
      <div className="flex-1">
        <p className="text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-600">{description}</p>
        <p className="text-xs text-gray-500 mt-0.5">{time}</p>
      </div>
    </div>
  );
}
