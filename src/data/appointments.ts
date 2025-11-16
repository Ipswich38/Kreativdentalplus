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
let appointments: Appointment[] = [
  {
    id: "1",
    appointmentNumber: "APT-2024-0001",
    patientId: "1",
    patientName: "Maria Santos",
    dentistId: "1",
    dentistName: "DRA. CAMILA CAÑARES-PRICE",
    roomNumber: 1,
    date: "2024-11-18",
    time: "09:00",
    duration: 60,
    services: ["Oral Prophylaxis", "Consultation"],
    insuranceType: "Philhealth",
    status: "scheduled",
    notes: "Regular cleaning appointment",
    createdAt: "2024-11-15T08:00:00Z",
    updatedAt: "2024-11-15T08:00:00Z",
    createdBy: "MS. JEZEL ROCHE"
  },
  {
    id: "2",
    appointmentNumber: "APT-2024-0002",
    patientId: "2",
    patientName: "Juan Dela Cruz",
    dentistId: "3",
    dentistName: "DRA. CLENCY",
    roomNumber: 2,
    date: "2024-11-18",
    time: "10:30",
    duration: 45,
    services: ["Consultation", "Fluoride Treatment"],
    insuranceType: "HMO",
    status: "confirmed",
    notes: "Follow-up for pediatric treatment",
    createdAt: "2024-11-14T10:30:00Z",
    updatedAt: "2024-11-16T09:15:00Z",
    createdBy: "MS. MHAY BLANQUEZA"
  },
  {
    id: "3",
    appointmentNumber: "APT-2024-0003",
    patientId: "3",
    patientName: "Ana Rodriguez",
    dentistId: "2",
    dentistName: "DR. JEROME OH",
    roomNumber: 3,
    date: "2024-11-19",
    time: "14:00",
    duration: 90,
    services: ["Root Canal Treatment"],
    insuranceType: "HMO",
    status: "scheduled",
    notes: "RCT on tooth #14, diabetic patient - monitor closely",
    createdAt: "2024-11-12T16:20:00Z",
    updatedAt: "2024-11-12T16:20:00Z",
    createdBy: "MS. EDNA TATIMO"
  },
  {
    id: "4",
    appointmentNumber: "APT-2024-0004",
    patientId: "4",
    patientName: "Miguel Garcia",
    dentistId: "4",
    dentistName: "DRA. FATIMA PORCIUNCULA",
    roomNumber: 1,
    date: "2024-11-20",
    time: "11:00",
    duration: 120,
    services: ["Orthodontic Consultation", "Braces Adjustment"],
    insuranceType: "Philhealth",
    status: "scheduled",
    notes: "Braces progress check - 6 month follow-up",
    createdAt: "2024-11-10T14:45:00Z",
    updatedAt: "2024-11-10T14:45:00Z",
    createdBy: "MS. JEZEL ROCHE"
  },
  {
    id: "5",
    appointmentNumber: "APT-2024-0005",
    patientId: "5",
    patientName: "Carmen Reyes",
    dentistId: "8",
    dentistName: "DRA. SHIRLEY BAYOG",
    roomNumber: 2,
    date: "2024-11-21",
    time: "15:30",
    duration: 75,
    services: ["Cosmetic Consultation", "Teeth Whitening"],
    insuranceType: "Private",
    status: "confirmed",
    notes: "Patient interested in full smile makeover",
    createdAt: "2024-11-13T11:30:00Z",
    updatedAt: "2024-11-16T13:20:00Z",
    createdBy: "MS. MHAY BLANQUEZA"
  },
  {
    id: "6",
    appointmentNumber: "APT-2024-0006",
    patientId: "1",
    patientName: "Maria Santos",
    dentistId: "5",
    dentistName: "DRA. FEVI STELLA TORRALBA-PIO",
    roomNumber: 3,
    date: "2024-11-16",
    time: "10:00",
    duration: 60,
    services: ["Restoration", "Light Cure Filling"],
    insuranceType: "Philhealth",
    status: "completed",
    notes: "Filling completed on tooth #26 - no complications",
    createdAt: "2024-11-12T09:00:00Z",
    updatedAt: "2024-11-16T11:00:00Z",
    createdBy: "MS. EDNA TATIMO"
  },
  {
    id: "7",
    appointmentNumber: "APT-2024-0007",
    patientId: "2",
    patientName: "Juan Dela Cruz",
    dentistId: "7",
    dentistName: "DR. FELIPE SUPILANA",
    roomNumber: 1,
    date: "2024-11-22",
    time: "13:00",
    duration: 180,
    services: ["Dental Implant Consultation"],
    insuranceType: "HMO",
    status: "scheduled",
    notes: "Initial consultation for implant on #36",
    createdAt: "2024-11-15T15:30:00Z",
    updatedAt: "2024-11-15T15:30:00Z",
    createdBy: "MS. JEZEL ROCHE"
  }
];

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
