import { useState } from "react";
import {
  Heart,
  Users,
  Calendar,
  Settings,
  LogOut,
  Plus,
  Search,
  Home,
  Menu,
  BarChart3,
  HelpCircle,
  Package,
  Wallet,
  Clock,
} from "lucide-react";
import { NewAppointmentPage } from "./NewAppointmentPage";
import { AppointmentsPage } from "./AppointmentsPage";
import { PaymentsPage } from "./PaymentsPage";
import { AppointmentStatusManager } from "./AppointmentStatusManager";
import { DentistsPage } from "./DentistsPage";
import { KreativPayrollPage } from "./KreativPayrollPage";
import { ServiceCatalogPage } from "./ServiceCatalogPage";
import { ProductionFinancialPage } from "./ProductionFinancialPage";
import { ProductionPatientPage } from "./ProductionPatientPage";
import { ProductionAttendancePage } from "./ProductionAttendancePage";
import { ProductionInventoryPage } from "./ProductionInventoryPage";
import type { User, UserRole } from "../data/users";
import { DashboardPage } from "./DashboardPage";
import { HelpPage } from "./HelpPage";

type TabType = "dashboard" | "appointment" | "appointments-list" | "payments" | "appointment-status" | "dentists" | "patient-record" | "financial" | "service-catalog" | "kreativ-payroll" | "attendance" | "inventory" | "help";

interface MainLayoutProps {
  currentUser: User;
  onLogout: () => void;
}

const navItems: { tab: TabType; label: string; icon: React.ElementType; badge?: number }[] = [
  { tab: "dashboard", label: "Dashboard", icon: Home },
  { tab: "appointments-list", label: "Appointments", icon: Calendar, badge: 12 },
  { tab: "patient-record", label: "Patients", icon: Users },
  { tab: "financial", label: "Analytics", icon: BarChart3 },
  { tab: "dentists", label: "Team", icon: Users },
  { tab: "service-catalog", label: "Settings", icon: Settings },
   { tab: "kreativ-payroll", label: "KreativPayroll", icon: Wallet },
  { tab: "attendance", label: "Attendance", icon: Clock },
  { tab: "inventory", label: "Inventory", icon: Package },
  { tab: "help", label: "Help", icon: HelpCircle },
];

const navConfig: Record<UserRole, TabType[]> = {
  admin: ["dashboard", "appointments-list", "patient-record", "financial", "dentists", "service-catalog", "kreativ-payroll", "attendance", "inventory", "help"],
  it_admin: ["dashboard", "appointments-list", "patient-record", "financial", "dentists", "service-catalog", "kreativ-payroll", "attendance", "inventory", "help"],
  dentist: ["dashboard", "appointments-list", "patient-record", "financial", "dentists", "service-catalog", "help"],
  staff: ["dashboard", "appointments-list", "patient-record", "attendance", "help"],
  receptionist: ["dashboard", "appointments-list", "patient-record", "financial", "inventory", "help"],
  front_desk: ["dashboard", "appointments-list", "patient-record", "financial", "kreativ-payroll", "attendance", "inventory", "help"],
};


export function MainLayout({ currentUser, onLogout }: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavClick = (tab: TabType) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const allowedTabs = navConfig[currentUser.role];
  const filteredNavItems = navItems.filter(item => allowedTabs.includes(item.tab));

  return (
    <div className="donezo-layout">
      {/* Sidebar */}
      <div className={`donezo-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="donezo-logo">
          <div className="donezo-logo-icon">
            <Heart className="w-4 h-4" />
          </div>
          <div className="donezo-logo-text">KreativDental+</div>
        </div>

        {/* Navigation */}
        <div className="donezo-nav">
          {/* Main Navigation */}
          <div className="donezo-nav-section">
            <div className="donezo-nav-title">Menu</div>

            {filteredNavItems.map(item => (
              <button
                key={item.tab}
                onClick={() => handleNavClick(item.tab)}
                className={`donezo-nav-item ${activeTab === item.tab ? "active" : ""}`}
              >
                <item.icon className="donezo-nav-icon" />
                <span>{item.label}</span>
                {item.badge && <span className="donezo-nav-badge">{item.badge}</span>}
              </button>
            ))}
          </div>

          {/* General Section */}
          <div className="donezo-nav-section">
            <div className="donezo-nav-title">General</div>

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
            <button className=".donezo-header-button secondary">
              Import Data
            </button>

            {/* User Profile */}
            <div className="donezo-user-profile">
              <div className="donezo-user-avatar">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="donezo-user-info">
                <div className="donezo-user-name">{currentUser.name}</div>
                <div className="donezo-user-email">{currentUser.role}@kreativdental.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="donezo-dashboard">
          {activeTab === "dashboard" && (
            <DashboardPage />
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
          {activeTab === "kreativ-payroll" && <KreativPayrollPage />}
          {activeTab === "attendance" && <ProductionAttendancePage currentUser={currentUser} />}
          {activeTab === "inventory" && <ProductionInventoryPage currentUser={currentUser} />}
          {activeTab === "help" && <HelpPage />}
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