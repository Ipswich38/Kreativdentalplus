export interface CommissionRate {
  service: string;
  amount: string;
  condition?: string;
}

export interface StaffSalaryStructure {
  type: "daily" | "weekly";
  basicRate: number;
  transportationAllowance?: {
    amount: number;
    frequency: string;
  };
}

export interface Staff {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  status: "active" | "on-leave" | "inactive";
  salaryStructure: StaffSalaryStructure;
}

export const staff: Staff[] = [
  {
    id: "1",
    name: "MS. JEZEL ROCHE",
    position: "Front-Desk Staff",
    email: "jezel@kreativdental.com",
    phone: "+1 234-567-8910",
    status: "active",
    salaryStructure: {
      type: "daily",
      basicRate: 500
    }
  },
  {
    id: "2",
    name: "MS. MHAY BLANQUEZA",
    position: "Dental Assistant, Treatment Coordinator",
    email: "mhay@kreativdental.com",
    phone: "+1 234-567-8911",
    status: "active",
    salaryStructure: {
      type: "daily",
      basicRate: 600
    }
  },
  {
    id: "3",
    name: "MS. EDNA TATIMO",
    position: "Lead Dental Assistant",
    email: "edna@kreativdental.com",
    phone: "+1 234-567-8912",
    status: "active",
    salaryStructure: {
      type: "daily",
      basicRate: 500
    }
  },
  {
    id: "4",
    name: "MICH BLASCO",
    position: "Admin, Editor",
    email: "mich@kreativdental.com",
    phone: "+1 234-567-8913",
    status: "active",
    salaryStructure: {
      type: "weekly",
      basicRate: 1500,
      transportationAllowance: {
        amount: 165,
        frequency: "Every Saturday"
      }
    }
  }
];

export const commissionRates: CommissionRate[] = [
  { service: "Xray (Panoramic or PA)", amount: "Php50.00", condition: "per shot" },
  { service: "Fluoride", amount: "Php100.00", condition: "(if 1,000)" },
  { service: "Fluoride", amount: "Php150.00", condition: "(if 1,500)" },
  { service: "Tooth Mousse", amount: "Php200.00", condition: "per patient" },
  { service: "Airflow", amount: "Php150.00", condition: "per patient" },
  { service: "Teeth Whitening", amount: "Php1,000", condition: "per patient" },
  { service: "Braces Installation", amount: "Php500.00", condition: "per patient" },
  { service: "Braces Binding Fee", amount: "Php1,000.00", condition: "(if 10,000 to 15,000)" },
  { service: "Braces Binding Fee", amount: "Php1,500.00", condition: "(if 28,000 to 35,000)" },
  { service: "Braces Binding Fee", amount: "Php1,500.00", condition: "(if total downpayment/total cost)" },
  { service: "Braces Binding Fee", amount: "Php2,000.00", condition: "(if payment before)" },
  { service: "Binding Fee: Dentist/Oral Rehab", amount: "Php500.00", condition: "(if 5,000)" },
  { service: "Binding Fee: Dentist/Oral Rehab", amount: "Php300.00", condition: "(if 3,000)" }
];
