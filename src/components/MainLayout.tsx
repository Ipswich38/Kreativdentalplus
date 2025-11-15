import { useState } from "react";
import {
  Heart,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Plus,
  Bell,
  Search,
  Activity,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowLeft,
  Home,
  Package,
  Wallet
} from "lucide-react";
import { NewAppointmentPage } from "./NewAppointmentPage";
import { AppointmentsPage } from "./AppointmentsPage";
import { PaymentsPage } from "./PaymentsPage";
import { AppointmentStatusManager } from "./AppointmentStatusManager";
import { DentistsPage } from "./DentistsPage";
import { ProductionPayrollPage } from "./ProductionPayrollPage";
import { ServiceCatalogPage } from "./ServiceCatalogPage";
import { ProductionFinancialPage } from "./ProductionFinancialPage";
import { ProductionPatientPage } from "./ProductionPatientPage";
import { ProductionAttendancePage } from "./ProductionAttendancePage";
import { ProductionInventoryPage } from "./ProductionInventoryPage";
import type { User } from "../data/users";

type TabType = "dashboard" | "appointment" | "appointments-list" | "payments" | "appointment-status" | "dentists" | "patient-record" | "financial" | "service-catalog" | "kreativ-payroll" | "attendance" | "inventory";

interface MainLayoutProps {
  currentUser: User;
  onLogout: () => void;
}

export function MainLayout({ currentUser, onLogout }: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Debug logging
  console.log('MainLayout - currentUser:', currentUser);
  console.log('MainLayout - activeTab:', activeTab);

  // Listen for navigation events from dashboard
  useState(() => {
    const handleNavigate = (e: CustomEvent<TabType>) => {
      setActiveTab(e.detail);
    };
    window.addEventListener('navigateTo', handleNavigate as EventListener);
    return () => window.removeEventListener('navigateTo', handleNavigate as EventListener);
  });

  // Define navigation items based on user role
  const getNavItems = () => {
    const allItems = [
      { id: "dashboard" as TabType, label: "Dashboard", icon: Home, roles: ["admin", "dentist", "staff", "receptionist", "front_desk"] },
      { id: "appointment" as TabType, label: "Book Appointment", icon: Calendar, roles: ["admin", "dentist", "receptionist", "front_desk"] },
      { id: "appointments-list" as TabType, label: "Appointments", icon: Calendar, roles: ["admin", "dentist", "receptionist", "front_desk"] },
      { id: "payments" as TabType, label: "Payments", icon: DollarSign, roles: ["admin", "receptionist", "front_desk"] },
      { id: "appointment-status" as TabType, label: "Patient Flow", icon: Activity, roles: ["admin", "receptionist", "front_desk"] },
      { id: "patient-record" as TabType, label: "Patients", icon: Users, roles: ["admin", "dentist", "receptionist", "staff", "front_desk"] },
      { id: "financial" as TabType, label: "Financial", icon: DollarSign, roles: ["admin"] },
      { id: "service-catalog" as TabType, label: "Services", icon: FileText, roles: ["admin", "dentist", "receptionist", "front_desk"] },
      { id: "kreativ-payroll" as TabType, label: "Payroll", icon: Wallet, roles: ["admin", "dentist", "staff", "receptionist"] },
      { id: "attendance" as TabType, label: "Attendance", icon: Clock, roles: ["admin", "dentist", "staff"] },
      { id: "inventory" as TabType, label: "Inventory", icon: Package, roles: ["admin", "front_desk", "dentist"] },
    ];

    return allItems.filter(item => item.roles.includes(currentUser.role));
  };

  const navItems = getNavItems();

  const handleNavClick = (tab: TabType) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  // Get initials for avatar
  const getInitials = () => {
    const names = currentUser.name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[names.length - 1][0];
    }
    return currentUser.name.substring(0, 2).toUpperCase();
  };

  // Mock data for dashboard metrics
  const todayMetrics = {
    appointments: 12,
    newPatients: 3,
    revenue: 2850,
    occupancy: 85
  };

  const upcomingAppointments = [
    { id: 1, time: "9:00 AM", patient: "Sarah Johnson", treatment: "Cleaning" },
    { id: 2, time: "10:30 AM", patient: "Mike Chen", treatment: "Root Canal" },
    { id: 3, time: "2:00 PM", patient: "Emily Davis", treatment: "Check-up" },
  ];

  const recentPatients = [
    { id: 1, name: "Alice Brown", status: "Completed", time: "8:30 AM" },
    { id: 2, name: "John Smith", status: "In Progress", time: "9:45 AM" },
    { id: 3, name: "Maria Garcia", status: "Waiting", time: "10:15 AM" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Side Navigation Panel */}
      <aside className="side-nav">
        {/* Navigation Header */}
        <div className="nav-header">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background: 'var(--color-blue-medium)'}}>
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">KreativDental+</h1>
              <p className="text-sm text-gray-600">Healthcare Management</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div style={{padding: '16px 24px', borderBottom: '1px solid var(--color-gray-200)'}}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{background: 'var(--color-blue-medium)'}}>
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{currentUser.name}</p>
              <p className="text-sm text-gray-600">{currentUser.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="nav-content">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5 nav-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Logout Section */}
        <div style={{padding: '16px', borderTop: '1px solid var(--color-gray-200)'}}>
          <button
            onClick={onLogout}
            className="nav-item"
            style={{color: 'var(--color-pink-medium)'}}
          >
            <LogOut className="w-5 h-5 nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Content Header */}
        <div className="content-header">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Good morning, {currentUser.name.split(' ')[0]}</h2>
            <p className="text-gray-600">Welcome back to your dashboard</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patients..."
                className="input-modern pl-10 w-64"
              />
            </div>

            <button className="relative p-3 rounded-2xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="content-body">
          {activeTab === "dashboard" && (
            <>
              {/* Welcome Section */}
              <div className="welcome-section">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold mb-2">How are you feeling today?</h3>
                    <p className="welcome-text mb-6">Track your practice metrics and patient care</p>

                    {/* Quick Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setActiveTab("appointments-list")}
                        className="quick-action"
                      >
                        Appointments
                      </button>
                      <button
                        onClick={() => setActiveTab("patient-record")}
                        className="quick-action"
                      >
                        Patients
                      </button>
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => setActiveTab("financial")}
                          className="quick-action"
                        >
                          Reports
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Large Heart Icon */}
                  <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
                    <Heart className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="metric-grid">
                {/* Today's Appointments */}
                <div className="metric-card metric-card-blue">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-8 h-8" />
                    <span className="text-sm font-medium">Today</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{todayMetrics.appointments}</div>
                  <div className="text-sm opacity-90">Appointments</div>
                  <div className="mt-3 text-xs rounded-full px-3 py-1 w-fit" style={{background: 'rgba(255, 255, 255, 0.2)'}}>
                    +2 from yesterday
                  </div>
                </div>

                {/* New Patients */}
                <div className="metric-card metric-card-pink">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8" />
                    <span className="text-sm font-medium">New</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{todayMetrics.newPatients}</div>
                  <div className="text-sm opacity-90">New Patients</div>
                  <div className="mt-3 text-xs rounded-full px-3 py-1 w-fit" style={{background: 'rgba(255, 255, 255, 0.2)'}}>
                    This week
                  </div>
                </div>

                {/* Revenue */}
                <div className="metric-card metric-card-yellow">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8" />
                    <span className="text-sm font-medium">Revenue</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">₱{todayMetrics.revenue.toLocaleString()}</div>
                  <div className="text-sm opacity-90">Today's Total</div>
                  <div className="mt-3 text-xs rounded-full px-3 py-1 w-fit flex items-center" style={{background: 'rgba(0, 0, 0, 0.1)'}}>
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    +12% vs yesterday
                  </div>
                </div>

                {/* Occupancy Rate */}
                <div className="metric-card metric-card-green">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8" />
                    <span className="text-sm font-medium">Rate</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{todayMetrics.occupancy}%</div>
                  <div className="text-sm opacity-90">Occupancy</div>
                  <div className="mt-3 text-xs rounded-full px-3 py-1 w-fit" style={{background: 'rgba(255, 255, 255, 0.2)'}}>
                    Optimal level
                  </div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="content-grid">
                {/* Today's Schedule */}
                <div className="bento-card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
                    <button
                      onClick={() => setActiveTab("appointments-list")}
                      className="text-sm font-medium"
                      style={{color: 'var(--color-blue-medium)'}}
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center gap-4 p-4 rounded-2xl" style={{background: 'var(--color-gray-100)'}}>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background: 'var(--color-blue-light)'}}>
                          <Clock className="w-6 h-6" style={{color: 'var(--color-blue-medium)'}} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{appointment.patient}</div>
                          <div className="text-sm text-gray-600">{appointment.treatment}</div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{appointment.time}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Patient Status */}
                <div className="bento-card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Patient Status</h3>
                    <button
                      onClick={() => setActiveTab("appointment-status")}
                      className="text-sm font-medium"
                      style={{color: 'var(--color-blue-medium)'}}
                    >
                      Refresh
                    </button>
                  </div>

                  <div className="space-y-4">
                    {recentPatients.map((patient) => (
                      <div key={patient.id} className="flex items-center gap-4 p-4 rounded-2xl" style={{background: 'var(--color-gray-100)'}}>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background: 'var(--color-pink-light)'}}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{background: 'var(--color-pink-medium)'}}>
                            {patient.name.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-600">{patient.time}</div>
                        </div>
                        <span className={`badge ${
                          patient.status === 'Completed' ? 'badge-green' :
                          patient.status === 'In Progress' ? 'badge-blue' :
                          'badge-yellow'
                        }`}>
                          {patient.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Other Tab Content */}
          {activeTab === "appointment" && <NewAppointmentPage />}
          {activeTab === "appointments-list" && <AppointmentsPage />}
          {activeTab === "payments" && <PaymentsPage currentUser={currentUser} />}
          {activeTab === "appointment-status" && <AppointmentStatusManager />}
          {activeTab === "dentists" && <DentistsPage />}
          {activeTab === "patient-record" && <ProductionPatientPage currentUser={currentUser} />}
          {activeTab === "financial" && <ProductionFinancialPage currentUser={currentUser} />}
          {activeTab === "service-catalog" && <ServiceCatalogPage />}
          {activeTab === "kreativ-payroll" && <ProductionPayrollPage currentUser={currentUser} />}
          {activeTab === "attendance" && <ProductionAttendancePage currentUser={currentUser} />}
          {activeTab === "inventory" && <ProductionInventoryPage currentUser={currentUser} />}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setActiveTab("appointment")}
        className="fab"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}