// Payroll Data Management
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeType: "dentist" | "staff";
  date: string;
  timeIn: string;
  timeOut?: string;
  regularHours: number;
  overtimeHours: number;
  lateMinutes: number;
  basicPay: number;
  overtimePay: number;
  lateDeduction: number;
  netDailyPay: number;
}

export interface CommissionRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeType: "dentist" | "staff";
  date: string;
  patientName: string;
  service: string;
  treatmentAmount: number;
  commissionRate: string;
  commissionAmount: number;
  transactionId: string;
}

export interface PayrollSummary {
  employeeId: string;
  employeeName: string;
  employeeType: "dentist" | "staff";
  period: string;
  totalBasicPay: number;
  totalOvertimePay: number;
  totalLateDeductions: number;
  totalCommissions: number;
  transportationAllowance: number;
  grossPay: number;
  netPay: number;
  attendanceRecords: AttendanceRecord[];
  commissionRecords: CommissionRecord[];
}

// In-memory storage (in a real app, this would be in a database)
let attendanceRecords: AttendanceRecord[] = [];
let commissionRecords: CommissionRecord[] = [];

// Helper function to calculate hours worked
export function calculateHoursWorked(timeIn: string, timeOut: string): {
  regularHours: number;
  overtimeHours: number;
} {
  const [inHour, inMin] = timeIn.split(":").map(Number);
  const [outHour, outMin] = timeOut.split(":").map(Number);
  
  const inMinutes = inHour * 60 + inMin;
  const outMinutes = outHour * 60 + outMin;
  
  const totalMinutes = outMinutes - inMinutes;
  const totalHours = totalMinutes / 60;
  
  // Regular workday is 8 hours
  const regularHours = Math.min(totalHours, 8);
  const overtimeHours = Math.max(totalHours - 8, 0);
  
  return { regularHours, overtimeHours };
}

// Helper function to calculate late deduction
export function calculateLateDeduction(lateMinutes: number, dailyRate: number): number {
  // Deduct hourly rate for every hour late
  const hourlyRate = dailyRate / 8;
  const lateHours = lateMinutes / 60;
  return hourlyRate * lateHours;
}

// Helper function to calculate overtime pay
export function calculateOvertimePay(overtimeHours: number, dailyRate: number): number {
  // Overtime is paid at 1.25x the hourly rate
  const hourlyRate = dailyRate / 8;
  return overtimeHours * hourlyRate * 1.25;
}

// Add attendance record
export function addAttendanceRecord(record: Omit<AttendanceRecord, "id">): AttendanceRecord {
  const newRecord: AttendanceRecord = {
    ...record,
    id: `ATT${Date.now()}`
  };
  
  attendanceRecords.push(newRecord);
  return newRecord;
}

// Add commission record
export function addCommissionRecord(record: Omit<CommissionRecord, "id">): CommissionRecord {
  const newRecord: CommissionRecord = {
    ...record,
    id: `COM${Date.now()}`
  };
  
  commissionRecords.push(newRecord);
  return newRecord;
}

// Get attendance records by employee
export function getAttendanceRecordsByEmployee(employeeId: string, startDate?: string, endDate?: string): AttendanceRecord[] {
  let records = attendanceRecords.filter(r => r.employeeId === employeeId);
  
  if (startDate && endDate) {
    records = records.filter(r => r.date >= startDate && r.date <= endDate);
  }
  
  return records;
}

// Get commission records by employee
export function getCommissionRecordsByEmployee(employeeId: string, startDate?: string, endDate?: string): CommissionRecord[] {
  let records = commissionRecords.filter(r => r.employeeId === employeeId);
  
  if (startDate && endDate) {
    records = records.filter(r => r.date >= startDate && r.date <= endDate);
  }
  
  return records;
}

// Calculate payroll summary for an employee
export function calculatePayrollSummary(
  employeeId: string,
  employeeName: string,
  employeeType: "dentist" | "staff",
  startDate: string,
  endDate: string,
  transportationAllowance: number = 0
): PayrollSummary {
  const attendance = getAttendanceRecordsByEmployee(employeeId, startDate, endDate);
  const commissions = getCommissionRecordsByEmployee(employeeId, startDate, endDate);
  
  const totalBasicPay = attendance.reduce((sum, r) => sum + r.basicPay, 0);
  const totalOvertimePay = attendance.reduce((sum, r) => sum + r.overtimePay, 0);
  const totalLateDeductions = attendance.reduce((sum, r) => sum + r.lateDeduction, 0);
  const totalCommissions = commissions.reduce((sum, r) => sum + r.commissionAmount, 0);
  
  const grossPay = totalBasicPay + totalOvertimePay + totalCommissions + transportationAllowance;
  const netPay = grossPay - totalLateDeductions;
  
  return {
    employeeId,
    employeeName,
    employeeType,
    period: `${startDate} to ${endDate}`,
    totalBasicPay,
    totalOvertimePay,
    totalLateDeductions,
    totalCommissions,
    transportationAllowance,
    grossPay,
    netPay,
    attendanceRecords: attendance,
    commissionRecords: commissions
  };
}

// Get all attendance records
export function getAllAttendanceRecords(): AttendanceRecord[] {
  return [...attendanceRecords];
}

// Get all commission records
export function getAllCommissionRecords(): CommissionRecord[] {
  return [...commissionRecords];
}

// Helper to calculate dentist commission based on service and amount
export function calculateDentistCommission(dentistId: string, service: string, amount: number): number {
  // This is a simplified calculation - in reality, you'd match the service to the rate structure
  // For now, we'll use some basic logic
  
  // Simple percentage-based calculation
  if (dentistId === "1") return 0; // Owner
  if (dentistId === "3") return amount * 0.40; // 40%
  if (dentistId === "6") return amount * 0.50; // 50%
  if (dentistId === "7") return amount * 0.45; // 45%
  
  // For mixed rate dentists, use average
  if (dentistId === "2") {
    if (service.toLowerCase().includes("surgical")) return amount * 0.35;
    if (service.toLowerCase().includes("root canal") || service.toLowerCase().includes("crown")) return amount * 0.30;
    if (service.toLowerCase().includes("extraction")) return amount * 0.15;
    return amount * 0.10;
  }
  
  if (dentistId === "4") {
    if (service.toLowerCase().includes("new") || service.toLowerCase().includes("installation")) return amount * 0.20;
    if (service.toLowerCase().includes("xray")) return 50;
    return amount * 0.10;
  }
  
  if (dentistId === "5") {
    if (service.toLowerCase().includes("root canal") || service.toLowerCase().includes("surgery") || service.toLowerCase().includes("crown")) return amount * 0.20;
    if (service.toLowerCase().includes("xray")) return 50;
    return amount * 0.15;
  }
  
  if (dentistId === "8") {
    if (service.toLowerCase().includes("crown") || service.toLowerCase().includes("endo") || service.toLowerCase().includes("surgery")) return amount * 0.20;
    if (service.toLowerCase().includes("xray")) return 50;
    return amount * 0.10;
  }
  
  return 0;
}

// Helper to calculate staff commission
export function calculateStaffCommission(service: string, amount: number): number {
  const serviceLower = service.toLowerCase();
  
  if (serviceLower.includes("xray")) return 50;
  if (serviceLower.includes("fluoride")) {
    if (amount >= 1500) return 150;
    if (amount >= 1000) return 100;
  }
  if (serviceLower.includes("tooth mousse")) return 200;
  if (serviceLower.includes("airflow")) return 150;
  if (serviceLower.includes("teeth whitening") || serviceLower.includes("whitening")) return 1000;
  if (serviceLower.includes("braces installation") || serviceLower.includes("braces install")) return 500;
  if (serviceLower.includes("braces binding") || serviceLower.includes("braces")) {
    if (amount >= 28000) return 1500;
    if (amount >= 10000) return 1000;
  }
  if (serviceLower.includes("binding fee") || serviceLower.includes("oral rehab")) {
    if (amount >= 5000) return 500;
    if (amount >= 3000) return 300;
  }
  
  return 0;
}

// Export for persistence (in a real app, this would sync to a database)
export function getPayrollData() {
  return {
    attendanceRecords,
    commissionRecords
  };
}

// Import data (for initialization or data recovery)
export function setPayrollData(data: { attendanceRecords: AttendanceRecord[], commissionRecords: CommissionRecord[] }) {
  attendanceRecords = data.attendanceRecords;
  commissionRecords = data.commissionRecords;
}
