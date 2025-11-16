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
  Wallet,
  Menu,
  X
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
    <div className="min-h-screen flex">
      {/* Mobile Navigation Overlay */}
      <div
        className={`nav-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Side Navigation Panel */}
      <aside className={`sidebar-bento ${sidebarOpen ? 'open' : ''}`}>
        {/* Navigation Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <div className="sidebar-title">KreativDental+</div>
            <div className="sidebar-subtitle">Healthcare Management</div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors ml-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="bento-card bento-card-gradient-blue mb-6">
          <div className="bento-card-header">
            <div className="bento-card-icon-large">
              {currentUser.name.charAt(0)}
            </div>
            <div className="bento-card-status">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
          <div className="bento-card-value text-xl font-bold">{currentUser.name.split(' ')[0]}</div>
          <div className="bento-card-label opacity-90">{currentUser.role}</div>
          <div className="bento-card-meta text-xs opacity-75">Online • Active</div>
        </div>

        {/* Navigation Items */}
        <div className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-item-bento ${isActive ? 'active' : ''} hover:scale-105 transition-all duration-300`}
              >
                <div className={`nav-item-icon-wrapper ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                  <Icon className="nav-item-icon" />
                </div>
                <span className="font-medium">{item.label}</span>
                {isActive && <div className="nav-item-indicator"></div>}
              </button>
            );
          })}
        </div>

        {/* Logout Section */}
        <div className="mt-auto pt-4">
          <button
            onClick={onLogout}
            className="nav-item-bento text-red-600 hover:bg-red-50"
          >
            <LogOut className="nav-item-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content-bento">
        {/* Content Header */}
        <div className="content-header-bento">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="content-title-bento">Good morning, {currentUser.name.split(' ')[0]} ✨</h2>
              <p className="content-subtitle-bento">Welcome back to your dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patients..."
                className="input-bento pl-10 w-64"
              />
            </div>

            <button className="relative p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {activeTab === "dashboard" && (
            <>
              {/* Welcome Section */}
              <div className="bento-hero mb-6">
                <div className="bento-hero-title">How are you feeling today?</div>
                <div className="bento-hero-subtitle">Track your practice metrics and patient care</div>
                <div className="bento-hero-actions">
                  <button
                    onClick={() => setActiveTab("appointments-list")}
                    className="bento-hero-action"
                  >
                    Appointments
                  </button>
                  <button
                    onClick={() => setActiveTab("patient-record")}
                    className="bento-hero-action"
                  >
                    Patients
                  </button>
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => setActiveTab("financial")}
                      className="bento-hero-action"
                    >
                      Reports
                    </button>
                  )}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="bento-grid bento-grid-4 mb-8">
                {/* Today's Appointments */}
                <div className="bento-card bento-card-blue">
                  <div className="bento-card-header">
                    <div className="bento-card-icon">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="bento-card-label">Today</span>
                  </div>
                  <div className="bento-card-value">{todayMetrics.appointments}</div>
                  <div className="bento-card-label">Appointments</div>
                  <div className="bento-card-meta">+2 from yesterday</div>
                </div>

                {/* New Patients */}
                <div className="bento-card bento-card-pink">
                  <div className="bento-card-header">
                    <div className="bento-card-icon">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="bento-card-label">New</span>
                  </div>
                  <div className="bento-card-value">{todayMetrics.newPatients}</div>
                  <div className="bento-card-label">New Patients</div>
                  <div className="bento-card-meta">This week</div>
                </div>

                {/* Revenue */}
                <div className="bento-card bento-card-orange">
                  <div className="bento-card-header">
                    <div className="bento-card-icon">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <span className="bento-card-label">Revenue</span>
                  </div>
                  <div className="bento-card-value">₱{todayMetrics.revenue.toLocaleString()}</div>
                  <div className="bento-card-label">Today's Total</div>
                  <div className="bento-card-meta flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +12% vs yesterday
                  </div>
                </div>

                {/* Occupancy Rate */}
                <div className="bento-card bento-card-green">
                  <div className="bento-card-header">
                    <div className="bento-card-icon">
                      <Activity className="w-5 h-5" />
                    </div>
                    <span className="bento-card-label">Rate</span>
                  </div>
                  <div className="bento-card-value">{todayMetrics.occupancy}%</div>
                  <div className="bento-card-label">Occupancy</div>
                  <div className="bento-card-meta">Optimal level</div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Schedule */}
                <div className="bento-list">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900">Today's Schedule</h3>
                    <p className="text-gray-600">Upcoming appointments</p>
                  </div>

                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="bento-list-item">
                      <div className="bento-list-icon bg-blue-100 text-blue-600">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="bento-list-content">
                        <div className="bento-list-title">{appointment.patient}</div>
                        <div className="bento-list-subtitle">{appointment.treatment}</div>
                      </div>
                      <div className="bento-list-meta">{appointment.time}</div>
                    </div>
                  ))}
                </div>

                {/* Patient Status */}
                <div className="bento-list">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900">Patient Status</h3>
                    <p className="text-gray-600">Current patient flow</p>
                  </div>

                  {recentPatients.map((patient) => (
                    <div key={patient.id} className="bento-list-item">
                      <div className="bento-list-icon bg-pink-100 text-pink-600">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="bento-list-content">
                        <div className="bento-list-title">{patient.name}</div>
                        <div className="bento-list-subtitle">{patient.time}</div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                          patient.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          patient.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {patient.status}
                        </span>
                      </div>
                    </div>
                  ))}
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
        className="bento-fab"
        title="New Appointment"
      >
        <Plus className="w-8 h-8" />
        <div className="bento-fab-glow"></div>
      </button>
    </div>
  );
}