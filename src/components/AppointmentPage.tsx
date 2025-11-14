import { useState } from "react";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  User, 
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  dentist: string;
  service: string;
  date: Date;
  time: string;
  duration: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  notes?: string;
}

// Mock appointments data
const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientName: "John Smith",
    patientEmail: "john@example.com",
    patientPhone: "+1 234-567-8900",
    dentist: "DRA. CAMILA CAÑARES-PRICE",
    service: "Regular Checkup",
    date: new Date(2025, 10, 14),
    time: "09:00 AM",
    duration: "30 min",
    status: "confirmed",
    notes: "First visit"
  },
  {
    id: "2",
    patientName: "Emma Wilson",
    patientEmail: "emma@example.com",
    patientPhone: "+1 234-567-8901",
    dentist: "DR. JEROME OH",
    service: "Teeth Cleaning",
    date: new Date(2025, 10, 14),
    time: "10:30 AM",
    duration: "45 min",
    status: "scheduled"
  },
  {
    id: "3",
    patientName: "Robert Brown",
    patientEmail: "robert@example.com",
    patientPhone: "+1 234-567-8902",
    dentist: "DRA. FATIMA PORCIUNCULA",
    service: "Root Canal",
    date: new Date(2025, 10, 14),
    time: "02:00 PM",
    duration: "90 min",
    status: "confirmed"
  },
  {
    id: "4",
    patientName: "Lisa Anderson",
    patientEmail: "lisa@example.com",
    patientPhone: "+1 234-567-8903",
    dentist: "DR. FELIPE SUPILANA",
    service: "Dental Filling",
    date: new Date(2025, 10, 15),
    time: "11:00 AM",
    duration: "60 min",
    status: "scheduled"
  },
  {
    id: "5",
    patientName: "David Martinez",
    patientEmail: "david@example.com",
    patientPhone: "+1 234-567-8904",
    dentist: "DRA. CLENCY",
    service: "Teeth Whitening",
    date: new Date(2025, 10, 14),
    time: "09:00 AM",
    duration: "60 min",
    status: "scheduled",
    notes: "Double booking - concurrent appointment"
  },
  {
    id: "6",
    patientName: "Sarah Thompson",
    patientEmail: "sarah@example.com",
    patientPhone: "+1 234-567-8905",
    dentist: "DRA. SHIRLEY BAYOG",
    service: "Emergency Consultation",
    date: new Date(2025, 10, 14),
    time: "02:00 PM",
    duration: "30 min",
    status: "confirmed",
    notes: "Double booking - urgent case"
  },
];

export function AppointmentPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);

  // Filter appointments by selected date
  const selectedDateAppointments = appointments.filter(apt => 
    apt.date.toDateString() === date?.toDateString()
  );

  // Filter by search and status
  const filteredAppointments = selectedDateAppointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get dates with appointments for calendar highlighting
  const appointmentDates = appointments.map(apt => apt.date);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500";
      case "scheduled": return "bg-blue-500";
      case "completed": return "bg-gray-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  // Count appointments per date
  const getAppointmentCount = (date: Date) => {
    return appointments.filter(apt => 
      apt.date.toDateString() === date.toDateString()
    ).length;
  };

  // Check for double bookings at same time
  const hasDoubleBooking = (selectedDate: Date) => {
    const dayAppointments = appointments.filter(apt => 
      apt.date.toDateString() === selectedDate.toDateString()
    );
    const times = dayAppointments.map(apt => apt.time);
    return times.length !== new Set(times).size;
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    // Create appointment logic will be implemented
    setIsNewAppointmentOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900">Appointment Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? 's' : ''} on {date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {date && hasDoubleBooking(date) && (
              <span className="ml-2 inline-flex items-center gap-1 text-orange-600">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                Double bookings detected
              </span>
            )}
          </p>
        </div>
        
        <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new appointment
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient-name">Patient Name</Label>
                <Input id="patient-name" placeholder="Enter patient name" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patient-email">Email</Label>
                <Input id="patient-email" type="email" placeholder="patient@example.com" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patient-phone">Phone Number</Label>
                <Input id="patient-phone" type="tel" placeholder="+1 234-567-8900" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dentist">Dentist</Label>
                <Select required>
                  <SelectTrigger id="dentist">
                    <SelectValue placeholder="Select dentist" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-canares">DRA. CAMILA CAÑARES-PRICE</SelectItem>
                    <SelectItem value="dr-oh">DR. JEROME OH</SelectItem>
                    <SelectItem value="dr-clency">DRA. CLENCY</SelectItem>
                    <SelectItem value="dr-porciuncula">DRA. FATIMA PORCIUNCULA</SelectItem>
                    <SelectItem value="dr-torralba">DRA. FEVI STELLA TORRALBA-PIO</SelectItem>
                    <SelectItem value="dr-pineda">DR. JONATHAN PINEDA</SelectItem>
                    <SelectItem value="dr-supilana">DR. FELIPE SUPILANA</SelectItem>
                    <SelectItem value="dr-bayog">DRA. SHIRLEY BAYOG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Select required>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkup">Regular Checkup</SelectItem>
                    <SelectItem value="cleaning">Teeth Cleaning</SelectItem>
                    <SelectItem value="filling">Dental Filling</SelectItem>
                    <SelectItem value="root-canal">Root Canal</SelectItem>
                    <SelectItem value="extraction">Tooth Extraction</SelectItem>
                    <SelectItem value="whitening">Teeth Whitening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apt-date">Date</Label>
                  <Input id="apt-date" type="date" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="apt-time">Time</Label>
                  <Input id="apt-time" type="time" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select required>
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" placeholder="Add any special notes..." rows={3} />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsNewAppointmentOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Create Appointment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <Card className="lg:col-span-1 border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border-0"
              modifiers={{
                hasAppointment: appointmentDates,
              }}
              modifiersStyles={{
                hasAppointment: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  textDecorationColor: '#3b82f6',
                },
              }}
            />
            
            {/* Appointment Count Indicator */}
            {date && getAppointmentCount(date) > 0 && (
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Appointments on this date:</span>
                  <Badge className={`${getAppointmentCount(date) > 3 ? 'bg-orange-500' : 'bg-blue-500'}`}>
                    {getAppointmentCount(date)}
                  </Badge>
                </div>
                {hasDoubleBooking(date) && (
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    Contains double bookings
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointments List Section */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>Appointments</CardTitle>
              
              {/* Search and Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No appointments found</p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchQuery || filterStatus !== "all" 
                    ? "Try adjusting your filters"
                    : "Schedule a new appointment to get started"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Appointment Card Component
function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-gradient-to-r from-green-500 to-emerald-500";
      case "scheduled": return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "completed": return "bg-gray-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-gray-900">{appointment.patientName}</h4>
            <p className="text-sm text-gray-600">{appointment.service}</p>
          </div>
        </div>
        <Badge className={`${getStatusColor(appointment.status)} text-white capitalize`}>
          {appointment.status}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{appointment.time} ({appointment.duration})</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <User className="w-4 h-4" />
          <span>{appointment.dentist}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{appointment.patientPhone}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Mail className="w-4 h-4" />
          <span className="truncate">{appointment.patientEmail}</span>
        </div>
      </div>
      
      {appointment.notes && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="text-gray-900">Notes:</span> {appointment.notes}
          </p>
        </div>
      )}
      
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          Reschedule
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          View Details
        </Button>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
          Cancel
        </Button>
      </div>
    </div>
  );
}