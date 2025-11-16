export interface Patient {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  medicalHistory: string;
  allergies: string;
  medications: string;
  insuranceType: string;
  insuranceProvider: string;
  insuranceCardNumber: string;
  status: "active" | "inactive";
  lastVisit?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data store (in production, this would be a database)
let patients: Patient[] = [
  {
    id: "1",
    patientNumber: "PT-2024-001",
    firstName: "Maria",
    lastName: "Santos",
    birthDate: "1985-03-15",
    age: 39,
    gender: "Female",
    phone: "+63 917 123 4567",
    email: "maria.santos@email.com",
    address: "123 Rizal Street",
    city: "Quezon City",
    province: "Metro Manila",
    medicalHistory: "Hypertension, controlled with medication",
    allergies: "None known",
    medications: "Losartan 50mg daily",
    insuranceType: "Philhealth",
    insuranceProvider: "PhilHealth",
    insuranceCardNumber: "PH-2024-001234",
    status: "active",
    lastVisit: "2024-11-10",
    createdAt: "2024-10-01T09:00:00Z",
    updatedAt: "2024-11-10T14:30:00Z"
  },
  {
    id: "2",
    patientNumber: "PT-2024-002",
    firstName: "Juan",
    lastName: "Dela Cruz",
    birthDate: "1992-07-22",
    age: 32,
    gender: "Male",
    phone: "+63 917 234 5678",
    email: "juan.delacruz@email.com",
    address: "456 Taft Avenue",
    city: "Manila",
    province: "Metro Manila",
    medicalHistory: "No significant medical history",
    allergies: "Penicillin",
    medications: "None",
    insuranceType: "HMO",
    insuranceProvider: "Maxicare",
    insuranceCardNumber: "MAX-2024-567890",
    status: "active",
    lastVisit: "2024-11-08",
    createdAt: "2024-09-15T10:30:00Z",
    updatedAt: "2024-11-08T16:45:00Z"
  },
  {
    id: "3",
    patientNumber: "PT-2024-003",
    firstName: "Ana",
    lastName: "Rodriguez",
    birthDate: "1978-12-03",
    age: 45,
    gender: "Female",
    phone: "+63 917 345 6789",
    email: "ana.rodriguez@email.com",
    address: "789 EDSA",
    city: "Pasig City",
    province: "Metro Manila",
    medicalHistory: "Diabetes Type 2, well controlled",
    allergies: "Latex",
    medications: "Metformin 500mg twice daily",
    insuranceType: "HMO",
    insuranceProvider: "Intellicare",
    insuranceCardNumber: "INT-2024-112233",
    status: "active",
    lastVisit: "2024-11-12",
    createdAt: "2024-08-20T11:15:00Z",
    updatedAt: "2024-11-12T09:20:00Z"
  },
  {
    id: "4",
    patientNumber: "PT-2024-004",
    firstName: "Miguel",
    lastName: "Garcia",
    birthDate: "2010-05-18",
    age: 14,
    gender: "Male",
    phone: "+63 917 456 7890",
    email: "miguel.garcia@email.com",
    address: "321 Ortigas Avenue",
    city: "Mandaluyong City",
    province: "Metro Manila",
    medicalHistory: "No significant medical history",
    allergies: "None known",
    medications: "None",
    insuranceType: "Philhealth",
    insuranceProvider: "PhilHealth",
    insuranceCardNumber: "PH-2024-445566",
    status: "active",
    lastVisit: "2024-11-05",
    createdAt: "2024-07-10T13:45:00Z",
    updatedAt: "2024-11-05T15:10:00Z"
  },
  {
    id: "5",
    patientNumber: "PT-2024-005",
    firstName: "Carmen",
    lastName: "Reyes",
    birthDate: "1965-09-28",
    age: 59,
    gender: "Female",
    phone: "+63 917 567 8901",
    email: "carmen.reyes@email.com",
    address: "654 Commonwealth Avenue",
    city: "Quezon City",
    province: "Metro Manila",
    medicalHistory: "Osteoporosis, High cholesterol",
    allergies: "Codeine",
    medications: "Alendronate weekly, Atorvastatin 20mg daily",
    insuranceType: "Private",
    insuranceProvider: "AXA Philippines",
    insuranceCardNumber: "AXA-2024-778899",
    status: "active",
    lastVisit: "2024-11-14",
    createdAt: "2024-06-05T08:30:00Z",
    updatedAt: "2024-11-14T11:25:00Z"
  }
];

// CREATE
export function createPatient(patientData: Omit<Patient, "id" | "patientNumber" | "createdAt" | "updatedAt">): Patient {
  const newPatient: Patient = {
    ...patientData,
    id: `${Date.now()}`,
    patientNumber: `PT-2024-${String(patients.length + 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  patients.push(newPatient);
  return newPatient;
}

// READ
export function getAllPatients(): Patient[] {
  return [...patients];
}

export function getPatientById(id: string): Patient | undefined {
  return patients.find(p => p.id === id);
}

export function searchPatients(query: string): Patient[] {
  const lowerQuery = query.toLowerCase();
  return patients.filter(p => 
    p.firstName.toLowerCase().includes(lowerQuery) ||
    p.lastName.toLowerCase().includes(lowerQuery) ||
    p.patientNumber.toLowerCase().includes(lowerQuery) ||
    p.phone.includes(query) ||
    p.email.toLowerCase().includes(lowerQuery)
  );
}

export function findDuplicatePatient(phone: string, firstName: string, lastName: string, birthDate: string): Patient | undefined {
  return patients.find(p => 
    p.phone === phone || 
    (p.firstName.toLowerCase() === firstName.toLowerCase() && 
     p.lastName.toLowerCase() === lastName.toLowerCase() &&
     p.birthDate === birthDate)
  );
}

// UPDATE
export function updatePatient(id: string, updates: Partial<Omit<Patient, "id" | "patientNumber" | "createdAt">>): Patient | null {
  const index = patients.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  patients[index] = {
    ...patients[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return patients[index];
}

// DELETE (Soft delete - set status to inactive)
export function deletePatient(id: string): boolean {
  const index = patients.findIndex(p => p.id === id);
  
  if (index === -1) return false;
  
  patients[index].status = "inactive";
  patients[index].updatedAt = new Date().toISOString();
  
  return true;
}

// Hard delete (for permanent removal)
export function permanentlyDeletePatient(id: string): boolean {
  const index = patients.findIndex(p => p.id === id);
  
  if (index === -1) return false;
  
  patients.splice(index, 1);
  return true;
}

// STATISTICS
export function getPatientStats() {
  return {
    totalPatients: patients.length,
    activePatients: patients.filter(p => p.status === "active").length,
    inactivePatients: patients.filter(p => p.status === "inactive").length,
    newThisMonth: patients.filter(p => {
      const created = new Date(p.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length
  };
}