import { Calendar, Users, Clock, CheckCircle2, AlertCircle, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import type { User } from "../data/users";

interface ReceptionistDashboardProps {
  currentUser: User;
}

export function ReceptionistDashboard({ currentUser }: ReceptionistDashboardProps) {
  // Mock data - receptionist focused on appointments and patient coordination
  const todayAppointments = [
    { time: "09:00 AM", patient: "Maria Santos", dentist: "Dr. Camila", service: "Oral Prophylaxis", status: "completed" },
    { time: "10:30 AM", patient: "Juan Dela Cruz", dentist: "Dr. Jerome", service: "Tooth Extraction", status: "in-progress" },
    { time: "02:00 PM", patient: "Anna Reyes", dentist: "Dr. Camila", service: "Dental Filling", status: "confirmed" },
    { time: "03:30 PM", patient: "Pedro Garcia", dentist: "Dr. Jerome", service: "Root Canal", status: "pending" },
    { time: "04:30 PM", patient: "Lisa Tan", dentist: "Dr. Maria", service: "Braces Adjustment", status: "pending" },
  ];

  const upcomingAppointments = [
    { date: "Nov 15", patient: "Carlos Mendoza", service: "Checkup" },
    { date: "Nov 15", patient: "Sofia Reyes", service: "Cleaning" },
    { date: "Nov 16", patient: "Miguel Torres", service: "Filling" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <h2 className="text-gray-900 mb-1">Welcome, {currentUser.name}</h2>
        <p className="text-gray-600">{currentUser.position}</p>
        <p className="text-sm text-gray-500 mt-1">Employee ID: {currentUser.employeeId}</p>
      </div>

      {/* Daily Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Today's Appointments" 
          value="5" 
          icon={Calendar} 
          color="blue" 
        />
        <StatCard 
          title="Checked In" 
          value="2" 
          icon={CheckCircle2} 
          color="green" 
        />
        <StatCard 
          title="Pending" 
          value="2" 
          icon={Clock} 
          color="orange" 
        />
        <StatCard 
          title="Total Patients" 
          value="342" 
          icon={Users} 
          color="cyan" 
        />
      </div>

      {/* Today's Schedule */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Today's Appointments</CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {todayAppointments.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {todayAppointments.map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[60px]">
                    <p className="text-sm text-gray-900">{appointment.time}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{appointment.patient}</p>
                    <p className="text-xs text-gray-600">{appointment.service} • {appointment.dentist}</p>
                  </div>
                </div>
                <StatusBadge status={appointment.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Appointments & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upcoming Appointments */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {upcomingAppointments.map((appointment, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-900">{appointment.patient}</p>
                    <p className="text-xs text-gray-600">{appointment.service}</p>
                  </div>
                  <Badge variant="secondary" className="bg-white">
                    {appointment.date}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <button className="w-full p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg hover:shadow-md transition-all text-left flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-900">Schedule Appointment</p>
                  <p className="text-xs text-gray-600">Book new appointment</p>
                </div>
              </button>
              <button className="w-full p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg hover:shadow-md transition-all text-left flex items-center gap-3">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-900">Register Patient</p>
                  <p className="text-xs text-gray-600">Add new patient</p>
                </div>
              </button>
              <button className="w-full p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-all text-left flex items-center gap-3">
                <Phone className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-900">Appointment Reminders</p>
                  <p className="text-xs text-gray-600">Call patients</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="border-0 shadow-lg border-l-4 border-l-orange-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <CardTitle>Reminders & Alerts</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
            <p className="text-sm text-gray-600">2 patients need confirmation calls for tomorrow</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
            <p className="text-sm text-gray-600">Pedro Garcia appointment at 3:30 PM - needs to be confirmed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; label: string }> = {
    completed: { color: "bg-green-100 text-green-700", label: "Completed" },
    "in-progress": { color: "bg-blue-100 text-blue-700", label: "In Progress" },
    confirmed: { color: "bg-cyan-100 text-cyan-700", label: "Confirmed" },
    pending: { color: "bg-orange-100 text-orange-700", label: "Pending" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge 
      variant="secondary" 
      className={`${config.color} hover:${config.color}`}
    >
      {config.label}
    </Badge>
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
