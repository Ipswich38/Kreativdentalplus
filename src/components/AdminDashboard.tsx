import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Wallet, Activity, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DashboardService, type DashboardStats, type RecentActivity } from '../services/dashboardService';
import type { User } from "../data/users";

interface AdminDashboardProps {
  currentUser: User;
}

export function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    totalPatients: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    lowStockItems: 0,
    activeStaff: 0,
    completedAppointments: 0,
    pendingAppointments: 0
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardStats, recentActivities] = await Promise.all([
          DashboardService.getDashboardStats(),
          DashboardService.getRecentActivity(8)
        ]);
        setStats(dashboardStats);
        setActivities(recentActivities);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

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
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome back, {currentUser.name}</h2>
        <p className="text-blue-100 text-sm sm:text-base">System Administrator • Full Access</p>
        <div className="flex items-center gap-2 mt-3">
          <Activity className="w-4 h-4" />
          <span className="text-sm text-blue-100">Real-time system overview</span>
        </div>
      </div>

      {/* Mobile-Optimized Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MobileStatCard
          title="Today's Appointments"
          value={stats.todayAppointments.toString()}
          icon={Calendar}
          color="blue"
          subtitle={`${stats.completedAppointments} completed`}
        />
        <MobileStatCard
          title="Total Patients"
          value={stats.totalPatients.toString()}
          icon={Users}
          color="cyan"
          subtitle="Active records"
        />
        <MobileStatCard
          title="Monthly Revenue"
          value={`₱${stats.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          subtitle="This month"
        />
        <MobileStatCard
          title="Low Stock"
          value={stats.lowStockItems.toString()}
          icon={Wallet}
          color="orange"
          subtitle="Items need restocking"
        />
      </div>

      {/* Mobile-First System Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Active Staff
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.activeStaff}</p>
            <p className="text-sm text-gray-600">Total employees online</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.todayAppointments}</p>
            <p className="text-sm text-gray-600">{stats.completedAppointments} completed, {stats.pendingAppointments} pending</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-blue-50 sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-bold text-green-600 mb-1">Healthy</p>
            <p className="text-sm text-gray-600">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-Optimized Recent Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gray-50 rounded-t-lg">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400">Activities will appear here as they happen</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <MobileActivityItem
                  key={activity.id || index}
                  title={activity.title}
                  description={activity.description}
                  time={activity.time}
                  type={activity.type}
                />
              ))}
            </div>
          )}
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
  color: "blue" | "cyan" | "green" | "orange";
  subtitle?: string;
}

function MobileStatCard({ title, value, icon: Icon, color, subtitle }: MobileStatCardProps) {
  const colorClasses = {
    blue: "bg-blue-600",
    cyan: "bg-blue-600",
    green: "bg-blue-600",
    orange: "bg-blue-600",
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

// Mobile-Optimized Activity Item Component
interface MobileActivityItemProps {
  title: string;
  description: string;
  time: string;
  type: "appointment" | "payment" | "patient" | "attendance";
}

function MobileActivityItem({ title, description, time, type }: MobileActivityItemProps) {
  const iconColors = {
    appointment: "bg-blue-100 text-blue-600",
    payment: "bg-green-100 text-green-600",
    patient: "bg-purple-100 text-purple-600",
    attendance: "bg-orange-100 text-orange-600",
  };

  const icons = {
    appointment: Calendar,
    payment: DollarSign,
    patient: Users,
    attendance: Clock,
  };

  const IconComponent = icons[type];

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors active:scale-98">
      <div className={`w-10 h-10 ${iconColors[type]} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <IconComponent className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 line-clamp-1">{title}</p>
        <p className="text-xs text-gray-600 line-clamp-1">{description}</p>
        <p className="text-xs text-gray-500 mt-0.5">{time}</p>
      </div>
    </div>
  );
}
