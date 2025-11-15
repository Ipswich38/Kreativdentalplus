import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
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
  Search,
  Filter,
  Activity,
  List,
  BookOpen
} from "lucide-react";
import { NewAppointmentPage } from './NewAppointmentPage';
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

export function AppointmentManagementPage() {
  const [view, setView] = useState<'list' | 'book'>('list');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (view === 'list') {
      loadAppointments();
    }
  }, [view]);

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
        .order('appointment_date', { ascending: false })
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

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.dentist_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.service_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  if (view === 'book') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-0">
          <Button
            onClick={() => setView('list')}
            variant="ghost"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
          >
            <List className="w-4 h-4" />
            View Appointments
          </Button>
        </div>
        <NewAppointmentPage />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Appointment Management</h2>
            <p className="text-blue-100 text-sm">
              {appointments.length} total appointments
            </p>
          </div>
          <Activity className="w-8 h-8 text-blue-200" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => setView('book')}
            className="bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Book New Appointment
          </Button>
          <Button
            variant="ghost"
            className="text-white border border-white/30 hover:bg-white/10 rounded-xl"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
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

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 h-12 rounded-xl border-0 shadow-lg">
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
      </div>

      {/* Appointments List */}
      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="w-5 h-5 text-green-600" />
            Appointments {searchQuery || filterStatus !== 'all' ? '(Filtered)' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No appointments found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your filters"
                  : "Book your first appointment to get started"
                }
              </p>
              {!searchQuery && filterStatus === "all" && (
                <Button
                  onClick={() => setView('book')}
                  className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Book First Appointment
                </Button>
              )}
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
  );
}