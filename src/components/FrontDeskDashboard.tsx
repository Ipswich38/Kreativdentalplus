import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Calendar,
  Users,
  Clock,
  AlertCircle,
  Phone,
  UserPlus,
  CalendarPlus,
  Package
} from "lucide-react";
import type { User } from "../data/users";

interface FrontDeskDashboardProps {
  currentUser: User;
}

export function FrontDeskDashboard({ currentUser }: FrontDeskDashboardProps) {
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [waitingPatients, setWaitingPatients] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);

  // Mock data for demonstration - in production, this would fetch from Supabase
  useEffect(() => {
    // Simulate fetching real-time data
    setTodayAppointments(12);
    setWaitingPatients(3);
    setTotalPatients(245);
    setLowStockItems(5);
  }, []);

  const quickActions = [
    {
      title: "Add New Patient",
      description: "Register a new patient",
      icon: UserPlus,
      action: () => window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'patient-record' })),
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Schedule Appointment",
      description: "Book new appointment",
      icon: CalendarPlus,
      action: () => window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'appointment' })),
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Check Inventory",
      description: "View stock levels",
      icon: Package,
      action: () => window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'inventory' })),
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Service Catalog",
      description: "View treatments & pricing",
      icon: Calendar,
      action: () => window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'service-catalog' })),
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ];

  const upcomingAppointments = [
    { time: "9:00 AM", patient: "John Doe", dentist: "Dr. Santos", service: "Cleaning" },
    { time: "10:30 AM", patient: "Jane Smith", dentist: "Dr. Oh", service: "Root Canal" },
    { time: "2:00 PM", patient: "Bob Wilson", dentist: "Dr. Rodriguez", service: "Extraction" },
    { time: "3:30 PM", patient: "Alice Brown", dentist: "Dr. Chen", service: "Filling" },
    { time: "4:00 PM", patient: "Mike Davis", dentist: "Dr. Martinez", service: "Consultation" }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Front Desk Terminal</h2>
            <p className="text-gray-600">Complete dental practice management without payroll access</p>
            <Badge className="mt-2 bg-blue-100 text-blue-800">Dental Operations Only</Badge>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {waitingPatients} waiting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Active patient records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Common front desk tasks and operations
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={index}
                  onClick={action.action}
                  className={`h-auto p-4 flex flex-col items-center gap-3 ${action.color} touch-feedback`}
                  style={{ minHeight: '100px' }}
                >
                  <IconComponent className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upcoming appointments for today
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingAppointments.map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium text-blue-600">
                    {appointment.time}
                  </div>
                  <div>
                    <div className="font-medium">{appointment.patient}</div>
                    <div className="text-sm text-gray-600">{appointment.service}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {appointment.dentist}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">System Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Patient Management</span>
                <Badge className="bg-green-100 text-green-800">✓ Full Access</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Appointment Booking</span>
                <Badge className="bg-green-100 text-green-800">✓ Full Access</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Service Catalog</span>
                <Badge className="bg-green-100 text-green-800">✓ View Access</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Inventory Check</span>
                <Badge className="bg-green-100 text-green-800">✓ View Access</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">Restricted Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Payroll System</span>
                <Badge className="bg-red-100 text-red-800">✗ No Access</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Financial Reports</span>
                <Badge className="bg-red-100 text-red-800">✗ No Access</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Staff Management</span>
                <Badge className="bg-red-100 text-red-800">✗ No Access</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">System Settings</span>
                <Badge className="bg-red-100 text-red-800">✗ No Access</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Important Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Front Desk Terminal</h4>
              <p className="text-sm text-blue-800 mt-1">
                This terminal is designed for front desk operations only. Staff payroll and financial data are not accessible from this account to maintain privacy and security.
              </p>
              <p className="text-xs text-blue-700 mt-2">
                For payroll access, staff should use their individual employee accounts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}