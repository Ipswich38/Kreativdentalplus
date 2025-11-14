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
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database.types";
import type { User } from "../data/users";

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  patient: {
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
  };
  dentist: {
    profiles: {
      full_name: string | null;
    };
  };
  service: {
    name: string;
    duration: number;
    price: number;
  };
};

interface AppointmentPageProps {
  currentUser: User;
}

export function EnhancedAppointmentPage({ currentUser }: AppointmentPageProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Role-based permissions
  const canCreateAppointments = ['admin', 'staff', 'receptionist'].includes(currentUser.role);
  const canEditAppointments = ['admin', 'staff', 'receptionist'].includes(currentUser.role);
  const canViewAllAppointments = ['admin', 'staff', 'receptionist'].includes(currentUser.role);
  const isDentist = currentUser.role === 'dentist';

  // Fetch appointments from Supabase
  useEffect(() => {
    if (date) {
      fetchAppointments();
    }
  }, [date, currentUser]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(first_name, last_name, phone, email),
          dentist:staff!appointments_dentist_id_fkey(
            profiles(full_name)
          ),
          service:services(name, duration, price)
        `)
        .eq('appointment_date', date?.toISOString().split('T')[0])
        .order('appointment_time');

      // If user is a dentist, only show their appointments
      if (isDentist) {
        // Find the staff record for this dentist user
        const { data: staffRecord } = await supabase
          .from('staff')
          .select('id')
          .eq('profile_id', currentUser.employeeId)
          .single();

        if (staffRecord) {
          query = query.eq('dentist_id', staffRecord.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments by search and status
  const filteredAppointments = appointments.filter(apt => {
    const patientName = `${apt.patient.first_name} ${apt.patient.last_name}`.toLowerCase();
    const serviceName = apt.service?.name?.toLowerCase() || '';

    const matchesSearch = patientName.includes(searchQuery.toLowerCase()) ||
                         serviceName.includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const updateAppointmentStatus = async (appointmentId: string, status: string, reason?: string) => {
    if (!canEditAppointments) {
      toast.error('You do not have permission to modify appointments');
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: status as any,
          notes: reason ? `${reason}` : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast.success(`Appointment ${status} successfully`);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Appointments</h2>
          <p className="text-muted-foreground">
            {canViewAllAppointments
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
                <DialogDescription>
                  Create a new patient appointment. Fill in all required fields.
                </DialogDescription>
              </DialogHeader>
              <NewAppointmentForm
                onSuccess={() => {
                  setIsNewAppointmentOpen(false);
                  fetchAppointments();
                }}
                selectedDate={date}
              />
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
                            {appointment.patient.first_name} {appointment.patient.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.service?.name} • {appointment.appointment_time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Dr. {appointment.dentist?.profiles?.full_name}
                          </p>
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

// New Appointment Form Component
function NewAppointmentForm({ onSuccess, selectedDate }: { onSuccess: () => void; selectedDate?: Date }) {
  const [formData, setFormData] = useState({
    patient_id: '',
    dentist_id: '',
    service_id: '',
    appointment_time: '',
    duration: 30,
    notes: ''
  });
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const [patientsRes, dentistsRes, servicesRes] = await Promise.all([
        supabase.from('patients').select('id, first_name, last_name').eq('status', 'active'),
        supabase.from('staff').select('id, profiles(full_name)').eq('is_active', true),
        supabase.from('services').select('id, name, duration, price').eq('is_active', true)
      ]);

      setPatients(patientsRes.data || []);
      setDentists(dentistsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast.error('Failed to load form data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          ...formData,
          appointment_date: selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          status: 'scheduled'
        });

      if (error) throw error;

      toast.success('Appointment created successfully');
      onSuccess();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patient">Patient</Label>
          <Select value={formData.patient_id} onValueChange={(value) => setFormData(prev => ({ ...prev, patient_id: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient: any) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dentist">Dentist</Label>
          <Select value={formData.dentist_id} onValueChange={(value) => setFormData(prev => ({ ...prev, dentist_id: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select dentist" />
            </SelectTrigger>
            <SelectContent>
              {dentists.map((dentist: any) => (
                <SelectItem key={dentist.id} value={dentist.id}>
                  {dentist.profiles.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="service">Service</Label>
          <Select value={formData.service_id} onValueChange={(value) => {
            const service = services.find((s: any) => s.id === value);
            setFormData(prev => ({
              ...prev,
              service_id: value,
              duration: service?.duration || 30
            }));
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service: any) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} - ₱{service.price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="time">Time</Label>
          <Input
            type="time"
            value={formData.appointment_time}
            onChange={(e) => setFormData(prev => ({ ...prev, appointment_time: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes or special instructions"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => onSuccess()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Appointment'}
        </Button>
      </div>
    </form>
  );
}