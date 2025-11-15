import { useState, useEffect } from "react";
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
  ChevronRight,
  Activity
} from "lucide-react";
import { supabase } from '../lib/supabase';

interface Appointment {
  id: string;
  appointment_number: string;
  patient_name: string;
  patient_phone: string;
  dentist_name: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  notes?: string;
}

export function MobileAppointmentPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list'); // Mobile-first: start with list

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_number,
          appointment_date,
          appointment_time,
          status,
          notes,
          patients!inner(first_name, last_name, phone),
          services!inner(name),
          staff_users!inner(full_name)
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      const formattedAppointments: Appointment[] = (data || []).map((apt: any) => ({
        id: apt.id,
        appointment_number: apt.appointment_number,
        patient_name: `${apt.patients.first_name} ${apt.patients.last_name}`,
        patient_phone: apt.patients.phone,
        dentist_name: apt.staff_users.full_name,
        service_name: apt.services.name,
        appointment_date: apt.appointment_date,
        appointment_time: apt.appointment_time,
        status: apt.status,
        notes: apt.notes
      }));

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedDateAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.appointment_date);
    return appointmentDate.toDateString() === date.toDateString();
  });

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.dentist_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.service_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const appointmentDates = Array.from(new Set(
    appointments.map(apt => new Date(apt.appointment_date).toDateString())
  )).map(dateStr => new Date(dateStr));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 sm:px-6 lg:px-0">
      {/* Mobile-First Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Appointments</h2>
            <p className="text-purple-100 text-sm">
              {appointments.length} total appointments
            </p>
          </div>
          <Activity className="w-8 h-8 text-purple-200" />
        </div>

        {/* Mobile View Toggle */}
        <div className="flex gap-2 mt-4 sm:hidden">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-white text-purple-600'
                : 'bg-purple-500 text-white border border-purple-400'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
              viewMode === 'calendar'
                ? 'bg-white text-purple-600'
                : 'bg-purple-500 text-white border border-purple-400'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search patients, dentists, or services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl border-0 shadow-lg"
          />
        </div>

        <div className="flex gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32 h-12 rounded-xl border-0 shadow-lg">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
                <DialogDescription>
                  Create a new appointment for a patient
                </DialogDescription>
              </DialogHeader>
              {/* Form content would go here - keeping existing form structure */}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Mobile-First Content Layout */}
      <div className="space-y-4">
        {/* Desktop: Side-by-side, Mobile: Stacked based on viewMode */}
        <div className={`grid gap-4 ${viewMode === 'calendar' ? 'grid-cols-1' : 'grid-cols-1'} lg:grid-cols-3`}>

          {/* Calendar Section - Hidden on mobile unless calendar view */}
          <div className={`${viewMode === 'list' ? 'hidden sm:block' : 'block'} lg:block`}>
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-xl border-0 w-full"
                  modifiers={{
                    hasAppointment: appointmentDates,
                  }}
                  modifiersStyles={{
                    hasAppointment: {
                      fontWeight: 'bold',
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8',
                      borderRadius: '8px',
                    },
                  }}
                />

                {/* Selected Date Info */}
                {selectedDateAppointments.length > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </span>
                      <Badge className="bg-blue-500">
                        {selectedDateAppointments.length}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? 's' : ''} scheduled
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Appointments List Section */}
          <div className={`${viewMode === 'calendar' ? 'hidden sm:block' : 'block'} lg:block lg:col-span-2`}>
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                  Appointments {searchQuery || filterStatus !== 'all' ? '(Filtered)' : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No appointments found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {searchQuery || filterStatus !== "all"
                        ? "Try adjusting your filters"
                        : "Schedule a new appointment to get started"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl hover:shadow-lg transition-all active:scale-98 border"
                      >
                        {/* Mobile-Optimized Appointment Card */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <h4 className="font-medium text-gray-900 line-clamp-1">
                                {appointment.patient_name}
                              </h4>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {appointment.service_name}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(appointment.status)} flex-shrink-0`}>
                            {appointment.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {new Date(appointment.appointment_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {formatTime(appointment.appointment_time)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="line-clamp-1">{appointment.dentist_name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}