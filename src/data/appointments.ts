export interface Appointment {
  id: string;
  appointmentNumber: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  dentistName: string;
  roomNumber: number;
  date: string;
  time: string;
  duration: number; // in minutes
  services: string[];
  insuranceType?: string;
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  cancelledReason?: string;
}

// Mock data store
let appointments: Appointment[] = [];

// CREATE
export function createAppointment(appointmentData: Omit<Appointment, "id" | "appointmentNumber" | "createdAt" | "updatedAt">): Appointment {
  const newAppointment: Appointment = {
    ...appointmentData,
    id: `${Date.now()}`,
    appointmentNumber: `APT-2024-${String(appointments.length + 1).padStart(4, "0")}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  appointments.push(newAppointment);
  return newAppointment;
}

// READ
export function getAllAppointments(): Appointment[] {
  return [...appointments];
}

export function getAppointmentById(id: string): Appointment | undefined {
  return appointments.find(a => a.id === id);
}

export function getAppointmentsByDate(date: string): Appointment[] {
  return appointments.filter(a => a.date === date && a.status !== "cancelled");
}

export function getAppointmentsByPatient(patientId: string): Appointment[] {
  return appointments.filter(a => a.patientId === patientId);
}

export function getAppointmentsByDentist(dentistId: string, date?: string): Appointment[] {
  if (date) {
    return appointments.filter(a => a.dentistId === dentistId && a.date === date && a.status !== "cancelled");
  }
  return appointments.filter(a => a.dentistId === dentistId);
}

export function getUpcomingAppointments(): Appointment[] {
  const today = new Date().toISOString().split('T')[0];
  return appointments.filter(a => a.date >= today && (a.status === "scheduled" || a.status === "confirmed"));
}

// UPDATE
export function updateAppointment(id: string, updates: Partial<Omit<Appointment, "id" | "appointmentNumber" | "createdAt">>): Appointment | null {
  const index = appointments.findIndex(a => a.id === id);
  
  if (index === -1) return null;
  
  appointments[index] = {
    ...appointments[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return appointments[index];
}

export function updateAppointmentStatus(id: string, status: Appointment["status"], reason?: string): Appointment | null {
  const index = appointments.findIndex(a => a.id === id);
  
  if (index === -1) return null;
  
  appointments[index] = {
    ...appointments[index],
    status,
    cancelledReason: reason,
    updatedAt: new Date().toISOString()
  };
  
  return appointments[index];
}

// DELETE
export function deleteAppointment(id: string): boolean {
  const index = appointments.findIndex(a => a.id === id);
  
  if (index === -1) return false;
  
  appointments.splice(index, 1);
  return true;
}

// CONFLICT DETECTION
export function checkConflicts(dentistId: string, date: string, time: string, excludeId?: string): Appointment[] {
  return appointments.filter(a => 
    a.id !== excludeId &&
    a.dentistId === dentistId && 
    a.date === date && 
    a.time === time &&
    a.status !== "cancelled" &&
    a.status !== "no-show"
  );
}

export function hasDoubleBooking(date: string, time: string, roomNumber: number, excludeId?: string): boolean {
  const bookings = appointments.filter(a => 
    a.id !== excludeId &&
    a.date === date && 
    a.time === time &&
    a.roomNumber === roomNumber &&
    a.status !== "cancelled" &&
    a.status !== "no-show"
  );
  return bookings.length >= 2; // Allow max 2 bookings per room/time
}

// STATISTICS
export function getAppointmentStats() {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    total: appointments.length,
    today: appointments.filter(a => a.date === today && a.status !== "cancelled").length,
    scheduled: appointments.filter(a => a.status === "scheduled").length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    completed: appointments.filter(a => a.status === "completed").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
    upcoming: appointments.filter(a => a.date >= today && (a.status === "scheduled" || a.status === "confirmed")).length
  };
}
