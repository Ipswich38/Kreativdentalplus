import { useState, useEffect } from "react";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  User,
  Phone,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { User } from "../data/users";

interface Appointment {
  id: string;
  appointment_number: string;
  patient_id: string;
  dentist_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  end_time?: string;
  room_number?: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  patient_name?: string;
  patient_phone?: string;
  patient_email?: string;
  dentist_name?: string;
  service_name?: string;
  service_price?: number;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
}

interface Service {
  id: string;
  service_name: string;
  base_rate: number;
  duration?: number;
}

interface StaffUser {
  id: string;
  full_name: string;
  is_dentist: boolean;
}

interface AppointmentPageProps {
  currentUser: User;
}

export function ProductionAppointmentPage({ currentUser }: AppointmentPageProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data for forms
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<StaffUser[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // New appointment form
  const [newAppointment, setNewAppointment] = useState({
    patient_id: '',
    dentist_id: '',
    service_id: '',
    appointment_date: date?.toISOString().split('T')[0] || '',
    appointment_time: '',
    room_number: 1,
    notes: ''
  });

  // Role-based permissions
  const canCreateAppointments = ['admin', 'staff', 'receptionist'].includes(currentUser.role);
  const canEditAppointments = ['admin', 'staff', 'receptionist'].includes(currentUser.role);
  const isDentist = currentUser.role === 'dentist';

  // Fetch appointments with joined data
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const selectedDate = date?.toISOString().split('T')[0];

      let query = supabase
        .from('appointments')
        .select(`
          *,
          patients!inner(first_name, last_name, phone, email),
          staff_users!inner(full_name)
        `)
        .order('appointment_time');

      if (selectedDate) {
        query = query.eq('appointment_date', selectedDate);
      }

      // If user is dentist, only show their appointments
      if (isDentist) {
        // Find dentist's staff_users ID
        const { data: dentistData } = await supabase
          .from('staff_users')
          .select('id')
          .eq('employee_number', currentUser.employeeId)
          .single();

        if (dentistData) {
          query = query.eq('dentist_id', dentistData.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get services data separately
      const { data: servicesData } = await supabase
        .from('services')
        .select('id, service_name, base_rate');

      const appointmentsWithDetails = (data || []).map(apt => ({
        ...apt,
        patient_name: `${apt.patients?.first_name} ${apt.patients?.last_name}`,
        patient_phone: apt.patients?.phone,
        patient_email: apt.patients?.email,
        dentist_name: apt.staff_users?.full_name,
        service_name: servicesData?.find(s => s.id === apt.service_id)?.service_name || 'Unknown Service',
        service_price: servicesData?.find(s => s.id === apt.service_id)?.base_rate || 0
      }));

      setAppointments(appointmentsWithDetails);
      setFilteredAppointments(appointmentsWithDetails);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch form data (patients, dentists, services)
  const fetchFormData = async () => {
    try {
      const [patientsRes, dentistsRes, servicesRes] = await Promise.all([
        supabase.from('patients').select('id, first_name, last_name, phone').eq('status', 'active'),
        supabase.from('staff_users').select('id, full_name, is_dentist').eq('is_active', true).eq('is_dentist', true),
        supabase.from('services').select('id, service_name, base_rate')
      ]);

      setPatients(patientsRes.data || []);
      setDentists(dentistsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast.error('Failed to load form data');
    }
  };

  // Generate appointment number
  const generateAppointmentNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = appointments.length + 1;
    return `APT-${year}${month}-${String(count).padStart(4, '0')}`;
  };

  // Create new appointment
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateAppointments) {
      toast.error('You do not have permission to create appointments');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          ...newAppointment,
          appointment_number: generateAppointmentNumber(),
          status: 'scheduled'
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Appointment created successfully!');
      setIsNewAppointmentOpen(false);
      setNewAppointment({
        patient_id: '',
        dentist_id: '',
        service_id: '',
        appointment_date: date?.toISOString().split('T')[0] || '',
        appointment_time: '',
        room_number: 1,
        notes: ''
      });
      fetchAppointments();
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    if (!canEditAppointments) {
      toast.error('You do not have permission to modify appointments');
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast.success(`Appointment ${status} successfully`);
      fetchAppointments();
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  // Filter appointments
  const filterAppointments = () => {
    let filtered = appointments;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(apt =>
        apt.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.appointment_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    setFilteredAppointments(filtered);
  };

  // Status styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'no_show': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Load data on component mount and date change
  useEffect(() => {
    fetchFormData();
  }, []);

  useEffect(() => {
    if (date) {
      fetchAppointments();
      setNewAppointment(prev => ({ ...prev, appointment_date: date.toISOString().split('T')[0] }));
    }
  }, [date, currentUser]);

  useEffect(() => {
    filterAppointments();
  }, [searchQuery, filterStatus, appointments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Appointments</h2>
          <p className="text-muted-foreground">
            {canCreateAppointments
              ? "Manage patient appointments and schedules"
              : "View your appointment schedule"}
          </p>
        </div>

        {canCreateAppointments && (
          <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreateAppointment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient">Patient *</Label>
                    <Select
                      value={newAppointment.patient_id}
                      onValueChange={(value) => setNewAppointment(prev => ({ ...prev, patient_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.first_name} {patient.last_name} - {patient.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dentist">Dentist *</Label>
                    <Select
                      value={newAppointment.dentist_id}
                      onValueChange={(value) => setNewAppointment(prev => ({ ...prev, dentist_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select dentist" />
                      </SelectTrigger>
                      <SelectContent>
                        {dentists.map((dentist) => (
                          <SelectItem key={dentist.id} value={dentist.id}>
                            {dentist.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="service">Service *</Label>
                    <Select
                      value={newAppointment.service_id}
                      onValueChange={(value) => setNewAppointment(prev => ({ ...prev, service_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.service_name} - ₱{service.base_rate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      type="time"
                      value={newAppointment.appointment_time}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, appointment_time: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      type="date"
                      value={newAppointment.appointment_date}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, appointment_date: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="room">Room Number</Label>
                    <Select
                      value={newAppointment.room_number.toString()}
                      onValueChange={(value) => setNewAppointment(prev => ({ ...prev, room_number: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((room) => (
                          <SelectItem key={room} value={room.toString()}>
                            Room {room}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes or special instructions"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsNewAppointmentOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Appointment'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {date ? date.toLocaleDateString() : 'Select a date'}
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
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
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading appointments...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No appointments found for this date
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((appointment) => (
                  <Card key={appointment.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(appointment.status)}
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-medium">
                            {appointment.patient_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.service_name} • {appointment.appointment_time}
                            {appointment.room_number && ` • Room ${appointment.room_number}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Dr. {appointment.dentist_name}
                          </p>
                          {appointment.patient_phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {appointment.patient_phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {canEditAppointments && !isDentist && (
                        <div className="flex items-center space-x-2">
                          {appointment.status === 'scheduled' && (
                            <Button
                              size="sm"
                              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}

                      {isDentist && (
                        <div className="text-sm text-muted-foreground">
                          View Only
                        </div>
                      )}
                    </div>

                    {appointment.notes && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <strong>Notes:</strong> {appointment.notes}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}