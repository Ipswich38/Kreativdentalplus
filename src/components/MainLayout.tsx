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
  X,
  BarChart3,
  MessageSquare,
  HelpCircle,
  Command,
  Play,
  Square,
  Zap,
  Download,
  Smartphone
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

  // Mock data for dental practice dashboard
  const todayStats = {
    totalPatients: 147,
    completedTreatments: 23,
    upcomingAppointments: 8,
    pendingApprovals: 3
  };

  const recentPatients = [
    { id: 1, name: "Alexandra Rodriguez", treatment: "Dental Implant Procedure", status: "Completed", avatar: "AR" },
    { id: 2, name: "Marcus Johnson", treatment: "Root Canal Treatment", status: "In Progress", avatar: "MJ" },
    { id: 3, name: "Sarah Williams", treatment: "Orthodontic Consultation", status: "Pending", avatar: "SW" },
    { id: 4, name: "David Chen", treatment: "Teeth Whitening Session", status: "Completed", avatar: "DC" }
  ];

  const upcomingAppointments = [
    { id: 1, time: "09:00 AM", patient: "Emergency Checkup", action: "Start Treatment" },
    { id: 2, time: "11:30 AM", patient: "Cleaning Appointment", action: "Prepare Room" },
    { id: 3, time: "02:00 PM", patient: "Consultation Visit", action: "Review Files" }
  ];

  const projectTasks = [
    { icon: Zap, title: "Develop Patient Portal", due: "Due next day", type: "development" },
    { icon: Users, title: "Staff Training Program", due: "Due next week", type: "training" },
    { icon: FileText, title: "Update Treatment Protocols", due: "Due next week", type: "documentation" },
    { icon: BarChart3, title: "Monthly Practice Analytics", due: "Due next month", type: "analytics" },
    { icon: MessageSquare, title: "Patient Satisfaction Survey", due: "Due next month", type: "feedback" }
  ];

  const handleNavClick = (tab: TabType) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <div className="donezo-layout">
      {/* Sidebar */}
      <div className={`donezo-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="donezo-logo">
          <div className="donezo-logo-icon">
            <Heart className="w-4 h-4" />
          </div>
          <div className="donezo-logo-text">DentalPro</div>
        </div>

        {/* Navigation */}
        <div className="donezo-nav">
          {/* Main Navigation */}
          <div className="donezo-nav-section">
            <div className="donezo-nav-title">Menu</div>

            <button
              onClick={() => handleNavClick("dashboard")}
              className={`donezo-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            >
              <Home className="donezo-nav-icon" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleNavClick("appointments-list")}
              className={`donezo-nav-item ${activeTab === "appointments-list" ? "active" : ""}`}
            >
              <Calendar className="donezo-nav-icon" />
              <span>Appointments</span>
              <span className="donezo-nav-badge">12</span>
            </button>

            <button
              onClick={() => handleNavClick("patient-record")}
              className={`donezo-nav-item ${activeTab === "patient-record" ? "active" : ""}`}
            >
              <Users className="donezo-nav-icon" />
              <span>Patients</span>
            </button>

            <button
              onClick={() => handleNavClick("financial")}
              className={`donezo-nav-item ${activeTab === "financial" ? "active" : ""}`}
            >
              <BarChart3 className="donezo-nav-icon" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => handleNavClick("dentists")}
              className={`donezo-nav-item ${activeTab === "dentists" ? "active" : ""}`}
            >
              <Users className="donezo-nav-icon" />
              <span>Team</span>
            </button>
          </div>

          {/* General Section */}
          <div className="donezo-nav-section">
            <div className="donezo-nav-title">General</div>

            <button
              onClick={() => handleNavClick("service-catalog")}
              className={`donezo-nav-item ${activeTab === "service-catalog" ? "active" : ""}`}
            >
              <Settings className="donezo-nav-icon" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => handleNavClick("inventory")}
              className="donezo-nav-item"
            >
              <HelpCircle className="donezo-nav-icon" />
              <span>Help</span>
            </button>

            <button onClick={onLogout} className="donezo-nav-item">
              <LogOut className="donezo-nav-icon" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="donezo-main">
        {/* Header */}
        <div className="donezo-header">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="donezo-search">
            <Search className="donezo-search-icon" />
            <input
              type="text"
              placeholder="Search patients, treatments..."
              className="donezo-search-input"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">⌘F</span>
          </div>

          {/* Header Actions */}
          <div className="donezo-header-actions">
            <button className="donezo-header-button">
              <Plus className="w-4 h-4" />
              Add Patient
            </button>
            <button className="donezo-header-button secondary">
              Import Data
            </button>

            {/* User Profile */}
            <div className="donezo-user-profile">
              <div className="donezo-user-avatar">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="donezo-user-info">
                <div className="donezo-user-name">{currentUser.name}</div>
                <div className="donezo-user-email">{currentUser.role}@dentalcare.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="donezo-dashboard">
          {activeTab === "dashboard" && (
            <>
              {/* Dashboard Header */}
              <div className="donezo-dashboard-header">
                <h1 className="donezo-dashboard-title">Dashboard</h1>
                <p className="donezo-dashboard-subtitle">Plan, prioritize, and accomplish your dental practice tasks with ease.</p>
              </div>

              {/* Stats Grid */}
              <div className="donezo-stats-grid">
                {/* Total Patients */}
                <div className="donezo-stat-card primary">
                  <div className="donezo-stat-header">
                    <span className="donezo-stat-label">Total Patients</span>
                    <TrendingUp className="donezo-stat-icon" />
                  </div>
                  <div className="donezo-stat-value">{todayStats.totalPatients}</div>
                  <div className="donezo-stat-meta">
                    <TrendingUp className="donezo-stat-trend" />
                    Increased from last month
                  </div>
                </div>

                {/* Completed Treatments */}
                <div className="donezo-stat-card">
                  <div className="donezo-stat-header">
                    <span className="donezo-stat-label">Completed Treatments</span>
                    <Activity className="donezo-stat-icon" />
                  </div>
                  <div className="donezo-stat-value">{todayStats.completedTreatments}</div>
                  <div className="donezo-stat-meta">
                    <TrendingUp className="donezo-stat-trend" />
                    Increased from last month
                  </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="donezo-stat-card">
                  <div className="donezo-stat-header">
                    <span className="donezo-stat-label">Upcoming Appointments</span>
                    <Calendar className="donezo-stat-icon" />
                  </div>
                  <div className="donezo-stat-value">{todayStats.upcomingAppointments}</div>
                  <div className="donezo-stat-meta">
                    <Clock className="donezo-stat-trend" />
                    Increased from last month
                  </div>
                </div>

                {/* Pending Approvals */}
                <div className="donezo-stat-card">
                  <div className="donezo-stat-header">
                    <span className="donezo-stat-label">Pending Review</span>
                    <FileText className="donezo-stat-icon" />
                  </div>
                  <div className="donezo-stat-value">{todayStats.pendingApprovals}</div>
                  <div className="donezo-stat-meta">On Review</div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="donezo-content-grid">
                {/* Patient Analytics Chart */}
                <div className="donezo-section">
                  <div className="donezo-section-header">
                    <h3 className="donezo-section-title">Patient Analytics</h3>
                  </div>
                  <div className="donezo-chart-container">
                    <div className="donezo-chart-bars">
                      {[40, 80, 60, 90, 30, 70, 50, 85, 45, 75].map((height, i) => (
                        <div
                          key={i}
                          className="donezo-chart-bar"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reminders */}
                <div className="donezo-section">
                  <div className="donezo-section-header">
                    <h3 className="donezo-section-title">Reminders</h3>
                  </div>

                  <div className="donezo-reminder-item">
                    <div className="donezo-reminder-icon">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="donezo-reminder-content">
                      <div className="donezo-reminder-title">Weekly Team Meeting</div>
                      <div className="donezo-reminder-time">Today 3:00 - 04:00 pm</div>
                    </div>
                    <button className="donezo-start-button">Start Meeting</button>
                  </div>
                </div>
              </div>

              {/* Bottom Grid */}
              <div className="donezo-bottom-grid">
                {/* Team Collaboration */}
                <div className="donezo-section">
                  <div className="donezo-section-header">
                    <h3 className="donezo-section-title">Team Collaboration</h3>
                    <button className="donezo-section-action">
                      <Plus className="w-3 h-3" />
                      Add Member
                    </button>
                  </div>

                  <div className="donezo-team-list">
                    {recentPatients.map((patient) => (
                      <div key={patient.id} className="donezo-team-member">
                        <div className="donezo-team-avatar">{patient.avatar}</div>
                        <div className="donezo-team-info">
                          <div className="donezo-team-name">{patient.name}</div>
                          <div className="donezo-team-role">Working on • {patient.treatment}</div>
                        </div>
                        <span className={`donezo-team-status ${patient.status.toLowerCase().replace(' ', '')}`}>
                          {patient.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practice Progress */}
                <div className="donezo-section">
                  <div className="donezo-section-header">
                    <h3 className="donezo-section-title">Practice Progress</h3>
                  </div>

                  <div className="donezo-progress-circle">
                    <svg className="donezo-progress-svg" viewBox="0 0 120 120">
                      <circle
                        className="donezo-progress-bg"
                        cx="60"
                        cy="60"
                        r="54"
                      />
                      <circle
                        className="donezo-progress-bar"
                        cx="60"
                        cy="60"
                        r="54"
                        strokeDasharray={339.292}
                        strokeDashoffset={200}
                      />
                    </svg>
                    <div className="donezo-progress-text">41%</div>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Practice Progress</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                        Completed
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6b7280' }}></div>
                        In Progress
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e5e7eb' }}></div>
                        Pending
                      </span>
                    </div>
                  </div>
                </div>

                {/* Time Tracker */}
                <div className="donezo-section donezo-time-tracker">
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Time Tracker</h3>
                  <div className="donezo-time-display">{formatTime(currentTime)}</div>
                  <div className="donezo-time-controls">
                    <button className="donezo-time-button">
                      <Play className="w-4 h-4" />
                    </button>
                    <button className="donezo-time-button">
                      <Square className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Section - Mobile App Download */}
              <div style={{ marginTop: '24px' }}>
                <div className="donezo-section donezo-mobile-app">
                  <div className="donezo-mobile-title">Download our Mobile App</div>
                  <div className="donezo-mobile-subtitle">Get our app for your IOS and Android device</div>
                  <button className="donezo-download-button">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
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

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}