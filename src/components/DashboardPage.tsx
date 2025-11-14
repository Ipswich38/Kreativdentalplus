import { useState } from "react";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Wallet, 
  Package, 
  UserPlus, 
  CalendarPlus, 
  CreditCard, 
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  ClipboardCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { dentists } from "../data/dentists";
import { staff } from "../data/staff";
import { 
  addAttendanceRecord, 
  addCommissionRecord, 
  calculateHoursWorked,
  calculateLateDeduction,
  calculateOvertimePay,
  calculateDentistCommission,
  calculateStaffCommission
} from "../data/payroll";
import { createAppointment, getAppointmentStats } from "../data/appointments";
import { createPatient, getPatientStats } from "../data/patients";
import { services } from "../data/services";

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Appointments" value="12" icon={Calendar} color="blue" />
        <StatCard title="Total Patients" value="342" icon={Users} color="cyan" />
        <StatCard title="Monthly Revenue" value="₱245,000" icon={DollarSign} color="green" />
        <StatCard title="Pending Payments" value="8" icon={Wallet} color="orange" />
      </div>

      {/* Quick Access Forms */}
      <div>
        <h3 className="text-gray-900 mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AddAppointmentDialog />
          <AddPatientDialog />
          <RecordPaymentDialog />
          <StaffAttendanceDialog />
          <QuickAccessCard
            title="Service Catalog"
            description="View all available services"
            icon={Package}
            color="from-purple-500 to-pink-500"
            onClick={() => {
              // This will be handled by navigation
              const event = new CustomEvent('navigateTo', { detail: 'service-catalog' });
              window.dispatchEvent(event);
            }}
          />
        </div>
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

// Quick Access Card Component
interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
}

function QuickAccessCard({ title, description, icon: Icon, color, onClick }: QuickAccessCardProps) {
  return (
    <Card 
      className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-gray-900 mb-1">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Add Appointment Dialog
function AddAppointmentDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    dentist: "",
    service: "",
    date: "",
    time: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedDentist = dentists.find(d => d.id === formData.dentist);
    if (!selectedDentist) {
      toast.error("Please select a dentist");
      return;
    }
    
    const appointmentData = {
      patientId: "1", // TODO: Link to actual patient
      patientName: formData.patientName,
      dentistId: formData.dentist,
      dentistName: selectedDentist.name,
      roomNumber: 1, // Default room
      date: formData.date,
      time: formData.time,
      duration: 30, // Default 30 minutes
      services: [formData.service],
      status: "scheduled" as const,
      notes: formData.notes
    };
    
    createAppointment(appointmentData);
    toast.success("Appointment scheduled successfully!");
    setOpen(false);
    // Reset form
    setFormData({
      patientName: "",
      dentist: "",
      service: "",
      date: "",
      time: "",
      notes: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <CalendarPlus className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-gray-900 mb-1">Add Appointment</h4>
                <p className="text-sm text-gray-600">Schedule a new appointment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Appointment</DialogTitle>
          <DialogDescription>
            Schedule a new appointment for a patient
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name</Label>
            <Input
              id="patientName"
              placeholder="Enter patient name"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dentist">Dentist</Label>
            <Select value={formData.dentist} onValueChange={(value) => setFormData({ ...formData, dentist: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select dentist" />
              </SelectTrigger>
              <SelectContent>
                {dentists.map(dentist => (
                  <SelectItem key={dentist.id} value={dentist.id}>{dentist.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="service">Service</Label>
            <Select value={formData.service} onValueChange={(value) => setFormData({ ...formData, service: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {services.map(service => (
                  <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
              Schedule Appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Add Patient Dialog
function AddPatientDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    medicalHistory: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate age from birth date
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    const patientData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      birthDate: formData.dateOfBirth,
      age,
      gender: "Male", // Default, should be a field
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      city: "Manila", // Default
      province: "Metro Manila", // Default
      medicalHistory: formData.medicalHistory,
      allergies: "None",
      medications: "None",
      insuranceType: "Private",
      insuranceProvider: "",
      insuranceCardNumber: "",
      status: "active" as const
    };
    
    createPatient(patientData);
    toast.success("Patient registered successfully!");
    setOpen(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      medicalHistory: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-gray-900 mb-1">Add Patient</h4>
                <p className="text-sm text-gray-600">Register a new patient</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Register a new patient in the system
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+63 XXX XXX XXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Full address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History (Optional)</Label>
            <Textarea
              id="medicalHistory"
              placeholder="Allergies, conditions, medications..."
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              Add Patient
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Record Payment Dialog
function RecordPaymentDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    dentistId: "",
    assistingStaffId: "",
    service: "",
    amount: "",
    paymentMethod: "",
    referenceNumber: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const today = new Date().toISOString().split('T')[0];
    const amount = parseFloat(formData.amount);
    const transactionId = `TXN${Date.now()}`;
    
    // Calculate and record dentist commission if dentist is selected
    if (formData.dentistId) {
      const dentist = dentists.find(d => d.id === formData.dentistId);
      if (dentist) {
        const commissionAmount = calculateDentistCommission(formData.dentistId, formData.service, amount);
        const commissionRate = dentist.rateStructure.type === "commission" 
          ? dentist.rateStructure.commissions?.[0]?.rate || "N/A"
          : "Mixed";
        
        addCommissionRecord({
          employeeId: formData.dentistId,
          employeeName: dentist.name,
          employeeType: "dentist",
          date: today,
          patientName: formData.patientName,
          service: formData.service,
          treatmentAmount: amount,
          commissionRate: commissionRate,
          commissionAmount: commissionAmount,
          transactionId: transactionId
        });
      }
    }
    
    // Calculate and record staff commission if assisting staff is selected
    if (formData.assistingStaffId) {
      const staffMember = staff.find(s => s.id === formData.assistingStaffId);
      if (staffMember) {
        const commissionAmount = calculateStaffCommission(formData.service, amount);
        
        if (commissionAmount > 0) {
          addCommissionRecord({
            employeeId: formData.assistingStaffId,
            employeeName: staffMember.name,
            employeeType: "staff",
            date: today,
            patientName: formData.patientName,
            service: formData.service,
            treatmentAmount: amount,
            commissionRate: "Variable",
            commissionAmount: commissionAmount,
            transactionId: transactionId
          });
        }
      }
    }
    
    console.log("Payment recorded with commissions updated in payroll");
    toast.success("Payment recorded and commissions updated!");
    setOpen(false);
    setFormData({
      patientName: "",
      dentistId: "",
      assistingStaffId: "",
      service: "",
      amount: "",
      paymentMethod: "",
      referenceNumber: "",
      notes: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-gray-900 mb-1">Record Payment</h4>
                <p className="text-sm text-gray-600">Record a payment transaction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a treatment payment and update commission tracking
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name</Label>
            <Input
              id="patientName"
              placeholder="Enter patient name"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dentistId">Dentist</Label>
            <Select value={formData.dentistId} onValueChange={(value) => setFormData({ ...formData, dentistId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select dentist" />
              </SelectTrigger>
              <SelectContent>
                {dentists.map(dentist => (
                  <SelectItem key={dentist.id} value={dentist.id}>{dentist.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assistingStaffId">Assisting Staff (Optional)</Label>
            <Select value={formData.assistingStaffId} onValueChange={(value) => setFormData({ ...formData, assistingStaffId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff" />
              </SelectTrigger>
              <SelectContent>
                {staff.map(staffMember => (
                  <SelectItem key={staffMember.id} value={staffMember.id}>{staffMember.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="service">Service/Treatment</Label>
            <Input
              id="service"
              placeholder="Service provided"
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₱)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="gcash">GCash</SelectItem>
                <SelectItem value="maya">Maya</SelectItem>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(formData.paymentMethod === "gcash" || formData.paymentMethod === "maya" || formData.paymentMethod === "bank-transfer") && (
            <div className="space-y-2">
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                placeholder="Transaction reference number"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Staff Attendance Dialog
function StaffAttendanceDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    staffMember: "",
    date: "",
    timeIn: "",
    timeOut: "",
    lateMinutes: "0",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const staffMember = staff.find(s => s.id === formData.staffMember);
    if (!staffMember) return;
    
    const lateMinutes = parseInt(formData.lateMinutes) || 0;
    const dailyRate = staffMember.salaryStructure.basicRate;
    
    // Calculate hours worked and overtime
    let regularHours = 0;
    let overtimeHours = 0;
    
    if (formData.timeOut) {
      const hoursWorked = calculateHoursWorked(formData.timeIn, formData.timeOut);
      regularHours = hoursWorked.regularHours;
      overtimeHours = hoursWorked.overtimeHours;
    } else {
      // If no time out yet, assume still working
      regularHours = 8;
    }
    
    // Calculate pay components
    const basicPay = dailyRate;
    const overtimePay = calculateOvertimePay(overtimeHours, dailyRate);
    const lateDeduction = calculateLateDeduction(lateMinutes, dailyRate);
    const netDailyPay = basicPay + overtimePay - lateDeduction;
    
    // Record attendance
    addAttendanceRecord({
      employeeId: formData.staffMember,
      employeeName: staffMember.name,
      employeeType: "staff",
      date: formData.date,
      timeIn: formData.timeIn,
      timeOut: formData.timeOut || undefined,
      regularHours: regularHours,
      overtimeHours: overtimeHours,
      lateMinutes: lateMinutes,
      basicPay: basicPay,
      overtimePay: overtimePay,
      lateDeduction: lateDeduction,
      netDailyPay: netDailyPay
    });
    
    console.log("Attendance recorded - payroll updated with daily details");
    toast.success("Attendance logged successfully!");
    setOpen(false);
    setFormData({
      staffMember: "",
      date: "",
      timeIn: "",
      timeOut: "",
      lateMinutes: "0",
      notes: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-gray-900 mb-1">Staff Attendance</h4>
                <p className="text-sm text-gray-600">Log staff attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Staff Attendance Entry</DialogTitle>
          <DialogDescription>
            Log attendance with automatic overtime and late deduction calculation
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="staffMember">Staff Member</Label>
            <Select value={formData.staffMember} onValueChange={(value) => setFormData({ ...formData, staffMember: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map(staffMember => (
                  <SelectItem key={staffMember.id} value={staffMember.id}>{staffMember.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeIn">Time In</Label>
              <Input
                id="timeIn"
                type="time"
                value={formData.timeIn}
                onChange={(e) => setFormData({ ...formData, timeIn: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeOut">Time Out</Label>
              <Input
                id="timeOut"
                type="time"
                value={formData.timeOut}
                onChange={(e) => setFormData({ ...formData, timeOut: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lateMinutes">Late (minutes)</Label>
            <Input
              id="lateMinutes"
              type="number"
              min="0"
              placeholder="0"
              value={formData.lateMinutes}
              onChange={(e) => setFormData({ ...formData, lateMinutes: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Late deductions will be calculated automatically
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
              Log Attendance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Activity Item Component
interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
  type: "appointment" | "payment" | "patient";
}

function ActivityItem({ title, description, time, type }: ActivityItemProps) {
  const iconMap = {
    appointment: Calendar,
    payment: DollarSign,
    patient: Users
  };

  const colorMap = {
    appointment: "from-blue-500 to-cyan-500",
    payment: "from-green-500 to-emerald-500",
    patient: "from-purple-500 to-pink-500"
  };

  const Icon = iconMap[type];

  return (
    <div className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0">
      <div className={`w-10 h-10 bg-gradient-to-br ${colorMap[type]} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-gray-900 mb-1">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <span className="text-xs text-gray-500 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {time}
      </span>
    </div>
  );
}