import { useState } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  DollarSign, 
  Package, 
  Wallet,
  Menu,
  X,
  Smile,
  LogOut,
  Bell,
  Settings,
  UserCog
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { NewAppointmentPage } from "./NewAppointmentPage";
import { AppointmentsPage } from "./AppointmentsPage";
import { DentistsPage } from "./DentistsPage";
import { ProductionPayrollPage } from "./ProductionPayrollPage";
import { ServiceCatalogPage } from "./ServiceCatalogPage";
import { ProductionFinancialPage } from "./ProductionFinancialPage";
import { ProductionPatientPage } from "./ProductionPatientPage";
import { ProductionAttendancePage } from "./ProductionAttendancePage";
import { ProductionInventoryPage } from "./ProductionInventoryPage";
import { AdminDashboard } from "./AdminDashboard";
import { ITAdminDashboard } from "./ITAdminDashboard";
import { DentistDashboard } from "./DentistDashboard";
import { StaffDashboard } from "./StaffDashboard";
import { ReceptionistDashboard } from "./ReceptionistDashboard";
import { FrontDeskDashboard } from "./FrontDeskDashboard";
import type { User } from "../data/users";

type TabType = "dashboard" | "appointment" | "appointments-list" | "dentists" | "patient-record" | "financial" | "service-catalog" | "kreativ-payroll" | "attendance" | "inventory";

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
    // IT Admin gets special navigation (hidden from regular users)
    if (currentUser.role === "it_admin") {
      return [
        { id: "dashboard" as TabType, label: "🔒 IT Control Center", icon: LayoutDashboard, roles: ["it_admin"] },
        { id: "appointment" as TabType, label: "System Monitor", icon: Calendar, roles: ["it_admin"] },
        { id: "appointments-list" as TabType, label: "User Activity", icon: Users, roles: ["it_admin"] },
      ];
    }

    const allItems = [
      { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "dentist", "staff", "receptionist", "front_desk"] },
      { id: "appointment" as TabType, label: "Book Appointment", icon: Calendar, roles: ["admin", "dentist", "receptionist", "front_desk"] },
      { id: "appointments-list" as TabType, label: "View Appointments", icon: Users, roles: ["admin", "dentist", "receptionist", "front_desk"] },
      { id: "dentists" as TabType, label: "Dentists", icon: UserCog, roles: ["admin"] },
      { id: "patient-record" as TabType, label: "Patient Record", icon: Users, roles: ["admin", "dentist", "receptionist", "staff", "front_desk"] },
      { id: "financial" as TabType, label: "Financial", icon: DollarSign, roles: ["admin"] },
      { id: "service-catalog" as TabType, label: "Service Catalog", icon: Package, roles: ["admin", "dentist", "receptionist", "front_desk"] },
      // kreativPayroll is EXCLUDED for front_desk users
      { id: "kreativ-payroll" as TabType, label: "kreativPayroll", icon: Wallet, roles: ["admin", "dentist", "staff", "receptionist"] },
      { id: "attendance" as TabType, label: "Attendance", icon: Users, roles: ["admin", "dentist", "staff"] },
      { id: "inventory" as TabType, label: "Inventory", icon: Package, roles: ["admin", "front_desk"] },
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

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col sidebar-mobile ${sidebarOpen ? 'open' : ''}
          overflow-y-auto overscroll-contain
        `}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              currentUser.role === 'it_admin'
                ? 'bg-gradient-to-br from-red-600 to-purple-800'
                : 'bg-gradient-to-br from-purple-500 to-pink-500'
            }`}>
              <Smile className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-gray-900">
                {currentUser.role === 'it_admin' ? 'IT Control' : 'kreativDental'}
              </h2>
              <p className="text-xs text-gray-500">
                {currentUser.role === 'it_admin' ? 'Admin' : 'Plus'}
              </p>
            </div>
          </div>
          <button 
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{currentUser.name}</p>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
              </Badge>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">ID: {currentUser.employeeId}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isKreativPayroll = item.id === "kreativ-payroll";
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg
                  transition-all duration-200 min-h-[48px] md:min-h-[auto]
                  touch-feedback text-base md:text-sm
                  ${isActive
                    ? isKreativPayroll
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : isKreativPayroll
                      ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 hover:from-emerald-100 hover:to-green-100'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {isKreativPayroll && (
                  <Badge className="ml-auto bg-emerald-600 text-white text-xs px-1.5 py-0.5">
                    Payroll
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-gray-200 space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-gray-600 hover:text-gray-900 p-2 rounded-lg touch-feedback min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-gray-900">
                {navItems.find(item => item.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                {currentUser.position}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Avatar>
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto p-4 lg:p-6 ${activeTab === "kreativ-payroll" ? "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50" : ""}`}>
          {activeTab === "dashboard" && (
            <>
              {console.log('Rendering dashboard for role:', currentUser.role)}
              {currentUser.role === "it_admin" && <ITAdminDashboard currentUser={currentUser} />}
              {currentUser.role === "admin" && <AdminDashboard currentUser={currentUser} />}
              {currentUser.role === "dentist" && <DentistDashboard currentUser={currentUser} />}
              {currentUser.role === "staff" && <StaffDashboard currentUser={currentUser} />}
              {currentUser.role === "receptionist" && <ReceptionistDashboard currentUser={currentUser} />}
              {currentUser.role === "front_desk" && <FrontDeskDashboard currentUser={currentUser} />}
            </>
          )}
          {activeTab === "appointment" && (
            currentUser.role === "it_admin" ? <ITAdminDashboard currentUser={currentUser} /> : <NewAppointmentPage />
          )}
          {activeTab === "appointments-list" && (
            currentUser.role === "it_admin" ? <ITAdminDashboard currentUser={currentUser} /> : <AppointmentsPage />
          )}
          {activeTab === "dentists" && <DentistsPage />}
          {activeTab === "patient-record" && <ProductionPatientPage currentUser={currentUser} />}
          {activeTab === "financial" && <ProductionFinancialPage currentUser={currentUser} />}
          {activeTab === "service-catalog" && <ServiceCatalogPage />}
          {activeTab === "kreativ-payroll" && <ProductionPayrollPage currentUser={currentUser} />}
          {activeTab === "attendance" && <ProductionAttendancePage currentUser={currentUser} />}
          {activeTab === "inventory" && <ProductionInventoryPage currentUser={currentUser} />}
        </main>
      </div>
    </div>
  );
}