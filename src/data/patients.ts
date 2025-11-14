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
    firstName: "Juan",
    lastName: "Dela Cruz",
    birthDate: "1990-01-15",
    age: 34,
    gender: "Male",
    phone: "+63 917-123-4567",
    email: "juan.delacruz@email.com",
    address: "123 Rizal Street",
    city: "Manila",
    province: "Metro Manila",
    medicalHistory: "Hypertension (Controlled)",
    allergies: "Penicillin",
    medications: "None",
    insuranceType: "Maxicare",
    insuranceProvider: "Maxicare",
    insuranceCardNumber: "MAX-2024-12345",
    status: "active",
    lastVisit: "2024-10-10",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-10-10T00:00:00Z"
  },
  {
    id: "2",
    patientNumber: "PT-2024-002",
    firstName: "Maria",
    lastName: "Santos",
    birthDate: "1985-05-20",
    age: 39,
    gender: "Female",
    phone: "+63 923-456-7890",
    email: "maria.santos@email.com",
    address: "456 Bonifacio Avenue",
    city: "Quezon City",
    province: "Metro Manila",
    medicalHistory: "None",
    allergies: "None",
    medications: "None",
    insuranceType: "Private",
    insuranceProvider: "",
    insuranceCardNumber: "",
    status: "active",
    lastVisit: "2024-11-01",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-11-01T00:00:00Z"
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