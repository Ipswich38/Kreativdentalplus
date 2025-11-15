import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock, TrendingUp, Activity, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { DashboardService, type TodayAppointment } from '../services/dashboardService';
import type { User } from "../data/users";

interface DentistDashboardProps {
  currentUser: User;
}

export function DentistDashboard({ currentUser }: DentistDashboardProps) {
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    myPatients: 0,
    monthlyEarnings: 0,
    completedToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDentistData = async () => {
      try {
        setLoading(true);
        const [appointments, dentistStats] = await Promise.all([
          DashboardService.getTodayAppointments(currentUser.id),
          DashboardService.getDentistStats(currentUser.id)
        ]);
        setTodayAppointments(appointments);
        setStats(dentistStats);
      } catch (error) {
        console.error('Error loading dentist data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDentistData();
  }, [currentUser.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 sm:px-6 lg:px-0">
      {/* Mobile-First Welcome Message */}
      <div className="bg-blue-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome, {currentUser.name}</h2>
        <p className="text-green-100 text-sm sm:text-base">{currentUser.position}</p>
        <div className="flex items-center gap-2 mt-3">
          <Stethoscope className="w-4 h-4" />
          <span className="text-sm text-green-100">Your personalized dashboard</span>
        </div>
      </div>

      {/* Mobile-Optimized Personal Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MobileStatCard title="Today's Appointments" value={stats.todayAppointments.toString()} icon={Calendar} color="blue" subtitle="Scheduled" />
        <MobileStatCard title="My Patients" value={stats.myPatients.toString()} icon={Users} color="cyan" subtitle="Total assigned" />
        <MobileStatCard title="Month Earnings" value={`₱${stats.monthlyEarnings.toLocaleString()}`} icon={DollarSign} color="green" subtitle="This month" />
        <MobileStatCard title="Completed Today" value={stats.completedToday.toString()} icon={Clock} color="purple" subtitle="Finished" />
      </div>

      {/* Mobile-Optimized Today's Schedule */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-blue-50 rounded-t-lg">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No appointments today</p>
              <p className="text-sm text-gray-400">Enjoy your day off!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appointment, index) => (
                <div key={appointment.id || index} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:shadow-md transition-all active:scale-98">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="bg-white rounded-lg p-2 shadow-sm">
                      <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{appointment.patient_name}</p>
                      <p className="text-xs text-gray-600 line-clamp-1">{appointment.service_name}</p>
                    </div>
                  </div>
                  <Badge
                    variant={appointment.status === "completed" ? "default" : "secondary"}
                    className={appointment.status === "completed"
                      ? "bg-green-100 text-green-700 hover:bg-green-100 flex-shrink-0"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-100 flex-shrink-0"
                    }
                  >
                    {appointment.status === "completed" ? "✓" : "⏱"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile-First Performance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-0 shadow-lg bg-blue-50">
          <CardHeader className="border-b bg-white/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Month Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 mb-1">₱{stats.monthlyEarnings.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total this month</p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">Professional earnings</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-blue-50">
          <CardHeader className="border-b bg-white/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.myPatients}</p>
                <p className="text-xs text-gray-600">My Patients</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
                <p className="text-xs text-gray-600">Completed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-Optimized Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-blue-50 rounded-t-lg">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <button className="p-4 bg-blue-50 rounded-2xl hover:shadow-lg transition-all active:scale-95 text-center">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Schedule</p>
              <p className="text-xs text-gray-500">View appointments</p>
            </button>
            <button className="p-4 bg-blue-50 rounded-2xl hover:shadow-lg transition-all active:scale-95 text-center">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Patients</p>
              <p className="text-xs text-gray-500">Manage records</p>
            </button>
            <button className="p-4 bg-blue-50 rounded-2xl hover:shadow-lg transition-all active:scale-95 text-center">
              <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Earnings</p>
              <p className="text-xs text-gray-500">View reports</p>
            </button>
            <button className="p-4 bg-blue-50 rounded-2xl hover:shadow-lg transition-all active:scale-95 text-center">
              <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Attendance</p>
              <p className="text-xs text-gray-500">Clock in/out</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Mobile-First Stat Card Component
interface MobileStatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: "blue" | "cyan" | "green" | "purple";
  subtitle?: string;
}

function MobileStatCard({ title, value, icon: Icon, color, subtitle }: MobileStatCardProps) {
  const colorClasses = {
    blue: "bg-blue-600",
    cyan: "bg-blue-600",
    green: "bg-blue-600",
    purple: "bg-blue-600",
  };

  return (
    <div className="bg-white rounded-2xl p-4 border-0 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1 line-clamp-1">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
}
