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
  Stethoscope,
  ArrowLeft,
  Check,
  X,
  Download,
  FileSpreadsheet
} from "lucide-react";
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

interface Dentist {
  id: string;
  employee_number: string;
  full_name: string;
  specialization: string;
  position: string;
  hourly_rate: number;
  is_active: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: any;
}

interface AppointmentFormData {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  customTime?: string;
}

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM"
];

const services = [
  { id: 'checkup', name: 'Regular Checkup', duration: 30, price: 100 },
  { id: 'cleaning', name: 'Regular Cleaning', duration: 45, price: 150 },
  { id: 'filling', name: 'Tooth Filling', duration: 60, price: 250 },
  { id: 'extraction', name: 'Tooth Extraction', duration: 30, price: 300 },
  { id: 'root-canal', name: 'Root Canal', duration: 90, price: 800 },
  { id: 'crown', name: 'Crown Placement', duration: 120, price: 1200 },
  { id: 'whitening', name: 'Teeth Whitening', duration: 90, price: 500 },
  { id: 'orthodontic', name: 'Orthodontic Consultation', duration: 60, price: 200 },
  { id: 'implant', name: 'Dental Implant', duration: 180, price: 2500 },
  { id: 'xray', name: 'X-Ray', duration: 15, price: 75 }
];

export function NewAppointmentPage() {
  const [step, setStep] = useState<'dentists' | 'calendar' | 'form'>('dentists');
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    service: '',
    date: '',
    time: '',
    notes: '',
    customTime: ''
  });

  useEffect(() => {
    loadDentists();
    loadAllAppointments();
  }, []);

  useEffect(() => {
    if (selectedDentist && selectedDate) {
      loadDentistAppointments();
    }
  }, [selectedDentist, selectedDate]);

  const loadDentists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('staff_users')
        .select('*')
        .eq('is_dentist', true)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setDentists(data || []);
    } catch (error) {
      console.error('Error loading dentists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(first_name, last_name, phone),
          staff_users(full_name, specialization),
          services(name)
        `)
        .order('appointment_date', { ascending: false })
        .order('appointment_time');

      if (error) throw error;
      setAllAppointments(data || []);
    } catch (error) {
      console.error('Error loading all appointments:', error);
    }
  };

  const loadDentistAppointments = async () => {
    if (!selectedDentist) return;

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('dentist_id', selectedDentist.id)
        .eq('appointment_date', dateStr);

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    }
  };

  const getTimeSlotAvailability = (): TimeSlot[] => {
    return timeSlots.map(time => {
      const appointment = appointments.find(apt => {
        const aptTime = new Date(`2000-01-01T${apt.appointment_time}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        return aptTime === time;
      });

      return {
        time,
        available: !appointment,
        appointment
      };
    });
  };

  const handleDentistSelect = (dentist: Dentist) => {
    setSelectedDentist(dentist);
    setStep('calendar');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setUseCustomTime(false);
    setFormData(prev => ({
      ...prev,
      date: selectedDate.toISOString().split('T')[0],
      time: convertTo24Hour(time),
      customTime: ''
    }));
    setStep('form');
  };

  const handleCustomTimeSelect = () => {
    if (customTime && isValidTime(customTime)) {
      setSelectedTime(`Custom: ${customTime}`);
      setUseCustomTime(true);
      setFormData(prev => ({
        ...prev,
        date: selectedDate.toISOString().split('T')[0],
        time: customTime,
        customTime: customTime
      }));
      setStep('form');
    }
  };

  const isValidTime = (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const generateAppointmentNumber = (): string => {
    const timestamp = Date.now().toString().slice(-6);
    return `APT${timestamp}`;
  };

  const createPatient = async () => {
    if (!formData.patientName || !formData.patientPhone) return null;

    const patientNumber = `PAT${Date.now().toString().slice(-6)}`;
    const [firstName, ...lastNameParts] = formData.patientName.trim().split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    const { data, error } = await supabase
      .from('patients')
      .insert([{
        patient_number: patientNumber,
        first_name: firstName,
        last_name: lastName,
        phone: formData.patientPhone,
        email: formData.patientEmail || null
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const patient = await createPatient();
      if (!patient) throw new Error('Failed to create patient');

      const service = services.find(s => s.id === formData.service);

      const appointmentData = {
        appointment_number: generateAppointmentNumber(),
        patient_id: patient.id,
        dentist_id: selectedDentist?.id,
        service_id: null, // We'll create services table later
        appointment_date: formData.date,
        appointment_time: formData.time,
        status: 'scheduled',
        notes: formData.notes || null,
        total_amount: service?.price || 0
      };

      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert([appointmentData]);

      if (appointmentError) throw appointmentError;

      alert('✅ Appointment booked successfully!');

      // Refresh appointments data
      loadDentistAppointments();
      loadAllAppointments();

      // Reset form and go back to start
      setStep('dentists');
      setSelectedDentist(null);
      setSelectedTime('');
      setUseCustomTime(false);
      setCustomTime('');
      setFormData({
        patientName: '',
        patientPhone: '',
        patientEmail: '',
        service: '',
        date: '',
        time: '',
        notes: '',
        customTime: ''
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('❌ Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = allAppointments.map(appointment => ({
      'Appointment #': appointment.appointment_number,
      'Date': appointment.appointment_date,
      'Time': appointment.appointment_time,
      'Patient Name': appointment.patients ? `${appointment.patients.first_name} ${appointment.patients.last_name}` : 'N/A',
      'Patient Phone': appointment.patients?.phone || 'N/A',
      'Dentist': appointment.staff_users?.full_name || 'N/A',
      'Specialization': appointment.staff_users?.specialization || 'N/A',
      'Status': appointment.status,
      'Total Amount': appointment.total_amount ? `₱${appointment.total_amount}` : 'N/A',
      'Notes': appointment.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Appointments');

    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `KreativDental_Appointments_${today}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 sm:px-6 lg:px-0 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          {step !== 'dentists' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (step === 'form') setStep('calendar');
                else if (step === 'calendar') setStep('dentists');
              }}
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Book Appointment</h2>
            <p className="text-blue-100 text-sm">
              {step === 'dentists' && 'Select a dentist to see available times'}
              {step === 'calendar' && `${selectedDentist?.full_name} - ${selectedDentist?.specialization}`}
              {step === 'form' && `${selectedDate.toLocaleDateString()} at ${selectedTime}`}
            </p>
          </div>
          <Stethoscope className="w-8 h-8 text-blue-200" />
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mt-6">
          <div className={`w-3 h-3 rounded-full ${step === 'dentists' ? 'bg-white' : 'bg-blue-300'}`} />
          <div className="flex-1 h-1 bg-blue-300 rounded">
            <div
              className="h-full bg-white rounded transition-all duration-300"
              style={{
                width: step === 'dentists' ? '0%' : step === 'calendar' ? '50%' : '100%'
              }}
            />
          </div>
          <div className={`w-3 h-3 rounded-full ${step === 'calendar' ? 'bg-white' : step === 'form' ? 'bg-white' : 'bg-blue-300'}`} />
          <div className="flex-1 h-1 bg-blue-300 rounded">
            <div
              className="h-full bg-white rounded transition-all duration-300"
              style={{ width: step === 'form' ? '100%' : '0%' }}
            />
          </div>
          <div className={`w-3 h-3 rounded-full ${step === 'form' ? 'bg-white' : 'bg-blue-300'}`} />
        </div>
      </div>

      {/* Step 1: Dentist Selection */}
      {step === 'dentists' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dentists.map((dentist) => (
            <Card
              key={dentist.id}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
              onClick={() => handleDentistSelect(dentist)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-1">{dentist.full_name}</CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-1">{dentist.employee_number}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      {dentist.specialization || 'General Dentistry'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{dentist.position}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-500">Rate</span>
                    <span className="text-sm font-semibold text-green-600">₱{dentist.hourly_rate}/hr</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Step 2: Calendar & Time Selection */}
      {step === 'calendar' && selectedDentist && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-xl border-0 w-full"
                disabled={(date) => date < new Date()}
              />
            </CardContent>
          </Card>

          {/* Time Slots */}
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    Available Times
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Regular Time Slots */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Regular Time Slots</h4>
                <div className="grid grid-cols-2 gap-3">
                  {getTimeSlotAvailability().map((slot) => (
                    <Button
                      key={slot.time}
                      variant={slot.available ? "outline" : "ghost"}
                      disabled={!slot.available}
                      onClick={() => slot.available && handleTimeSelect(slot.time)}
                      className={`h-12 rounded-xl transition-all ${
                        slot.available
                          ? 'hover:bg-blue-50 hover:border-blue-300 hover:scale-105 active:scale-95'
                          : 'opacity-50 cursor-not-allowed bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {slot.available ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        <span className={slot.available ? 'text-gray-900' : 'text-gray-400'}>
                          {slot.time}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Time Input */}
              <div className="border-t pt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Custom Time</h4>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="time"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="rounded-xl h-12"
                      placeholder="HH:MM"
                    />
                  </div>
                  <Button
                    onClick={handleCustomTimeSelect}
                    disabled={!customTime || !isValidTime(customTime)}
                    className="h-12 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Book Time
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter any time in 24-hour format (e.g., 14:30 for 2:30 PM)
                </p>
              </div>

              {getTimeSlotAvailability().every(slot => !slot.available) && !customTime && (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No available regular time slots</p>
                  <p className="text-sm text-gray-400">Use custom time or select another date</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Patient Information Form */}
      {step === 'form' && (
        <Card className="border-0 shadow-xl rounded-2xl max-w-2xl mx-auto">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              Patient Information
            </CardTitle>
            <p className="text-sm text-gray-600">
              Appointment with {selectedDentist?.full_name} on {selectedDate.toLocaleDateString()} at {useCustomTime ? formData.customTime : selectedTime}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-name">Patient Name *</Label>
                  <Input
                    id="patient-name"
                    value={formData.patientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                    placeholder="Enter patient full name"
                    className="rounded-xl h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient-phone">Phone Number *</Label>
                  <Input
                    id="patient-phone"
                    type="tel"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientPhone: e.target.value }))}
                    placeholder="+63 XXX XXX XXXX"
                    className="rounded-xl h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient-email">Email Address</Label>
                <Input
                  id="patient-email"
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientEmail: e.target.value }))}
                  placeholder="patient@example.com"
                  className="rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Service *</Label>
                <Select
                  value={formData.service}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, service: value }))}
                  required
                >
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Select service needed" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{service.name}</span>
                          <span className="text-sm text-gray-500 ml-4">
                            {service.duration}min - ₱{service.price}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special requirements or medical conditions..."
                  className="rounded-xl resize-none"
                  rows={4}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('calendar')}
                  className="flex-1 h-12 rounded-xl"
                >
                  Back to Calendar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}