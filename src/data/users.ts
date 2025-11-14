export type UserRole = "admin" | "dentist" | "staff" | "receptionist";

export interface User {
  employeeId: string;
  name: string;
  role: UserRole;
  passcode: string; // In production, this would be hashed
  position: string;
  email: string;
  mustChangePasscode: boolean;
  passcodeSetDate: string;
  lastLogin?: string;
  profileImage?: string;
}

// Demo users for authentication
// In production, passcodes would be hashed using bcrypt or similar
export const users: User[] = [
  // Admin
  {
    employeeId: "ADM-001",
    name: "System Administrator",
    role: "admin",
    passcode: "100001",
    position: "Admin",
    email: "admin@kreativdental.com",
    mustChangePasscode: false,
    passcodeSetDate: "2025-10-15",
  },
  
  // Dentists
  {
    employeeId: "DEN-001",
    name: "DRA. CAMILA CAÑARES-PRICE",
    role: "dentist",
    passcode: "200001",
    position: "Owner & Founder",
    email: "camila@kreativdental.com",
    mustChangePasscode: false,
    passcodeSetDate: "2025-10-15",
  },
  {
    employeeId: "DEN-002",
    name: "DR. JEROME OH",
    role: "dentist",
    passcode: "200002",
    position: "Oral Surgeon",
    email: "jerome@kreativdental.com",
    mustChangePasscode: true,
    passcodeSetDate: "2025-10-15",
  },
  {
    employeeId: "DEN-003",
    name: "DR. MARIA SANTOS",
    role: "dentist",
    passcode: "200003",
    position: "Orthodontist",
    email: "maria@kreativdental.com",
    mustChangePasscode: true,
    passcodeSetDate: "2025-10-15",
  },
  
  // Staff
  {
    employeeId: "STF-001",
    name: "MS. JEZEL ROCHE",
    role: "staff",
    passcode: "300001",
    position: "Front-Desk Staff",
    email: "jezel@kreativdental.com",
    mustChangePasscode: true,
    passcodeSetDate: "2025-10-15",
  },
  {
    employeeId: "STF-002",
    name: "MS. MHAY BLANQUEZA",
    role: "staff",
    passcode: "300002",
    position: "Dental Assistant",
    email: "mhay@kreativdental.com",
    mustChangePasscode: true,
    passcodeSetDate: "2025-10-15",
  },
  {
    employeeId: "STF-003",
    name: "MS. ANDREA VILLAR",
    role: "staff",
    passcode: "300003",
    position: "Treatment Coordinator",
    email: "andrea@kreativdental.com",
    mustChangePasscode: true,
    passcodeSetDate: "2025-10-15",
  },
  {
    employeeId: "STF-004",
    name: "MS. ANGEL KAYE SARMIENTO",
    role: "staff",
    passcode: "300004",
    position: "Dental Assistant",
    email: "angel@kreativdental.com",
    mustChangePasscode: true,
    passcodeSetDate: "2025-10-15",
  },
  {
    employeeId: "STF-005",
    name: "MR. JAMES RIVERA",
    role: "staff",
    passcode: "300005",
    position: "Dental Hygienist",
    email: "james@kreativdental.com",
    mustChangePasscode: true,
    passcodeSetDate: "2025-10-15",
  },
  
  // Receptionist
  {
    employeeId: "REC-001",
    name: "MS. LISA MARTINEZ",
    role: "receptionist",
    passcode: "400001",
    position: "Receptionist",
    email: "lisa@kreativdental.com",
    mustChangePasscode: true,
    passcodeSetDate: "2025-10-15",
  },
];

// Authentication helper functions
export function authenticateUser(employeeId: string, passcode: string): User | null {
  const user = users.find(
    (u) => u.employeeId === employeeId && u.passcode === passcode
  );
  
  if (user) {
    // Check if passcode needs to be changed (30 days policy)
    const passcodeAge = Math.floor(
      (new Date().getTime() - new Date(user.passcodeSetDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (passcodeAge > 30 && user.mustChangePasscode) {
      // In production, redirect to change passcode page
      console.warn("Passcode expired - must be changed");
    }
    
    return user;
  }
  
  return null;
}

export function updateLastLogin(employeeId: string): void {
  const user = users.find((u) => u.employeeId === employeeId);
  if (user) {
    user.lastLogin = new Date().toISOString();
  }
}

export function changePasscode(employeeId: string, oldPasscode: string, newPasscode: string): boolean {
  const user = users.find((u) => u.employeeId === employeeId && u.passcode === oldPasscode);
  
  if (!user) {
    return false;
  }
  
  // Validate new passcode
  if (!/^\d{6}$/.test(newPasscode)) {
    console.error("Passcode must be exactly 6 digits");
    return false;
  }
  
  // Check for sequential or repeated digits
  if (/012345|123456|234567|345678|456789|567890/.test(newPasscode) || /(\d)\1{5}/.test(newPasscode)) {
    console.error("Passcode cannot be sequential or all same digits");
    return false;
  }
  
  user.passcode = newPasscode;
  user.passcodeSetDate = new Date().toISOString().split('T')[0];
  user.mustChangePasscode = false;
  
  return true;
}

export function getUserByEmployeeId(employeeId: string): User | undefined {
  return users.find((u) => u.employeeId === employeeId);
}
