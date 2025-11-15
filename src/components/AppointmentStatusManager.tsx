import { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Phone,
  MapPin,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { supabase } from '../lib/supabase';

interface Appointment {
  id: string;
  appointment_number: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'arrived' | 'ready_for_treatment' | 'in_treatment' | 'completed' | 'awaiting_payment';
  assigned_staff?: string;
  patient_info: {
    name: string;
    phone: string;
    email?: string;
  };
  dentist_info: {
    name: string;
    specialization: string;
  };
  service_info: {
    name: string;
    duration: number;
    amount: number;
  };
}

interface StaffMember {
  id: string;
  employee_number: string;
  full_name: string;
  position: string;
  is_active: boolean;
}

export function AppointmentStatusManager() {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>('');

  useEffect(() => {
    loadTodayAppointments();
    loadStaffMembers();

    // Auto-update appointments that passed their scheduled time
    const interval = setInterval(checkScheduledTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const loadTodayAppointments = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Mock data for today's appointments - in production, load from database
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          appointment_number: 'APT001',
          appointment_date: today,
          appointment_time: '09:00',
          status: 'scheduled',
          patient_info: {
            name: 'Maria Santos',
            phone: '+639123456789',
            email: 'maria@example.com'
          },
          dentist_info: {
            name: 'Dr. Jerome Oh',
            specialization: 'Endodontics'
          },
          service_info: {
            name: 'Root Canal Treatment',
            duration: 90,
            amount: 8000
          }
        },
        {
          id: '2',
          appointment_number: 'APT002',
          appointment_date: today,
          appointment_time: '10:30',
          status: 'arrived',
          patient_info: {
            name: 'John Dela Cruz',
            phone: '+639987654321'
          },
          dentist_info: {
            name: 'Dra. Clency',
            specialization: 'Pediatric Dentistry'
          },
          service_info: {
            name: 'Dental Cleaning',
            duration: 45,
            amount: 2500
          }
        },
        {
          id: '3',
          appointment_number: 'APT003',
          appointment_date: today,
          appointment_time: '14:00',
          status: 'ready_for_treatment',
          assigned_staff: 'Ms. Jezel Roche',
          patient_info: {
            name: 'Ana Rodriguez',
            phone: '+639111222333'
          },
          dentist_info: {
            name: 'Dra. Fatima Porciuncula',
            specialization: 'Orthodontics'
          },
          service_info: {
            name: 'Braces Installation',
            duration: 120,
            amount: 15000
          }
        }
      ];

      setTodayAppointments(mockAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStaffMembers = async () => {
    try {
      // In production, load from staff_users table
      const mockStaff: StaffMember[] = [
        {
          id: '1',
          employee_number: 'STF001',
          full_name: 'Ms. Jezel Roche',
          position: 'Senior Dental Assistant',
          is_active: true
        },
        {
          id: '2',
          employee_number: 'STF002',
          full_name: 'Ms. Mhay Blanqueza',
          position: 'Dental Hygienist',
          is_active: true
        },
        {
          id: '3',
          employee_number: 'STF003',
          full_name: 'Ms. Andrea Villar',
          position: 'Treatment Coordinator',
          is_active: true
        }
      ];

      setStaffMembers(mockStaff);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const checkScheduledTime = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

    setTodayAppointments(prev => prev.map(appointment => {
      // Parse appointment time
      const [hours, minutes] = appointment.appointment_time.split(':').map(Number);
      const appointmentTime = hours * 60 + minutes;

      // If appointment time has passed and status is still scheduled, mark as awaiting payment
      if (currentTime > appointmentTime + appointment.service_info.duration &&
          ['scheduled', 'arrived', 'ready_for_treatment', 'in_treatment'].includes(appointment.status)) {
        return { ...appointment, status: 'awaiting_payment' as any };
      }

      return appointment;
    }));
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string, assignedStaff?: string) => {
    try {
      setLoading(true);

      // Update in state immediately
      setTodayAppointments(prev => prev.map(apt =>
        apt.id === appointmentId
          ? {
              ...apt,
              status: newStatus as any,
              assigned_staff: assignedStaff || apt.assigned_staff
            }
          : apt
      ));

      // In production, update in database
      // const { error } = await supabase
      //   .from('appointments')
      //   .update({
      //     status: newStatus,
      //     assigned_staff: assignedStaff,
      //     updated_at: new Date().toISOString()
      //   })
      //   .eq('id', appointmentId);

      // if (error) throw error;

      console.log('Appointment status updated:', {
        appointmentId,
        newStatus,
        assignedStaff
      });

      setShowStatusDialog(false);
      setSelectedAppointment(null);
      setSelectedStaff('');

    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Failed to update appointment status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'arrived':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ready_for_treatment':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_treatment':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'awaiting_payment':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'arrived':
        return <MapPin className="w-4 h-4" />;
      case 'ready_for_treatment':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_treatment':
        return <Users className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'awaiting_payment':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'scheduled':
        return [{ value: 'arrived', label: 'Mark as Arrived' }];
      case 'arrived':
        return [{ value: 'ready_for_treatment', label: 'Ready for Treatment' }];
      case 'ready_for_treatment':
        return [{ value: 'in_treatment', label: 'Start Treatment' }];
      case 'in_treatment':
        return [{ value: 'completed', label: 'Complete Treatment' }];
      case 'completed':
        return [{ value: 'awaiting_payment', label: 'Awaiting Payment' }];
      default:
        return [];
    }
  };

  const openStatusDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedStaff(appointment.assigned_staff || '');
    setShowStatusDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">📋 Today's Appointments</h2>
        <p className="text-blue-100 text-sm">
          Manage patient flow and appointment statuses
        </p>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {todayAppointments.map((appointment) => {
          const nextStatusOptions = getNextStatusOptions(appointment.status);

          return (
            <Card key={appointment.id} className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {appointment.appointment_number}
                  </Badge>
                  <Badge className={`${getStatusColor(appointment.status)} border`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(appointment.status)}
                      <span className="text-xs">
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </Badge>
                </div>
                <CardTitle className="text-lg">{appointment.patient_info.name}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Appointment Time */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{appointment.appointment_time}</p>
                    <p className="text-sm text-gray-500">
                      {appointment.service_info.duration} minutes
                    </p>
                  </div>
                </div>

                {/* Dentist Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{appointment.dentist_info.name}</p>
                    <p className="text-sm text-gray-500">{appointment.dentist_info.specialization}</p>
                  </div>
                </div>

                {/* Service Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">{appointment.service_info.name}</p>
                    <p className="text-sm text-gray-500">₱{appointment.service_info.amount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Assigned Staff */}
                {appointment.assigned_staff && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">{appointment.assigned_staff}</p>
                      <p className="text-sm text-gray-500">Assisting Staff</p>
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{appointment.patient_info.phone}</p>
                    <p className="text-sm text-gray-500">Contact Number</p>
                  </div>
                </div>

                {/* Action Buttons */}
                {nextStatusOptions.length > 0 && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => openStatusDialog(appointment)}
                      className="w-full rounded-xl"
                      variant={appointment.status === 'scheduled' ? 'default' : 'outline'}
                    >
                      {nextStatusOptions[0].label}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Appointment Status</DialogTitle>
            <DialogDescription>
              {selectedAppointment?.patient_info.name} - {selectedAppointment?.appointment_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Status */}
            <div>
              <label className="text-sm font-medium text-gray-700">Current Status</label>
              <div className="mt-1">
                <Badge className={getStatusColor(selectedAppointment?.status || '')}>
                  {selectedAppointment?.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Staff Assignment (only for ready_for_treatment status) */}
            {selectedAppointment?.status === 'arrived' && (
              <div>
                <label className="text-sm font-medium text-gray-700">Assign Assisting Staff</label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffMembers.map((staff) => (
                      <SelectItem key={staff.id} value={staff.full_name}>
                        <div>
                          <div className="font-medium">{staff.full_name}</div>
                          <div className="text-sm text-gray-500">{staff.position}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Required for commission calculation
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowStatusDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const nextStatus = getNextStatusOptions(selectedAppointment?.status || '')[0]?.value;
                  if (nextStatus) {
                    updateAppointmentStatus(
                      selectedAppointment?.id || '',
                      nextStatus,
                      selectedStaff || undefined
                    );
                  }
                }}
                disabled={loading || (selectedAppointment?.status === 'arrived' && !selectedStaff)}
                className="flex-1"
              >
                {loading ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}