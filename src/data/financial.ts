export interface PaymentTransaction {
  id: string;
  date: string;
  patientName: string;
  service: string;
  amount: number;
  paymentMethod: "Cash" | "Card" | "Bank Transfer" | "HMO";
  status: "completed" | "pending" | "partial";
}

export interface Expense {
  id: string;
  date: string;
  category: "PPE" | "Utilities" | "Miscellaneous";
  description: string;
  amount: number;
  vendor?: string;
}

export interface MonthlyFinancialSummary {
  month: string;
  income: number;
  expenses: number;
  netIncome: number;
}

export const paymentTransactions: PaymentTransaction[] = [
  {
    id: "TXN001",
    date: "2025-11-14",
    patientName: "Maria Santos",
    service: "Oral Prophylaxis - Deep Cleaning",
    amount: 3500,
    paymentMethod: "Cash",
    status: "completed"
  },
  {
    id: "TXN002",
    date: "2025-11-14",
    patientName: "Juan dela Cruz",
    service: "Braces Installation",
    amount: 15000,
    paymentMethod: "Bank Transfer",
    status: "completed"
  },
  {
    id: "TXN003",
    date: "2025-11-13",
    patientName: "Anna Reyes",
    service: "Teeth Whitening",
    amount: 18000,
    paymentMethod: "Card",
    status: "completed"
  },
  {
    id: "TXN004",
    date: "2025-11-13",
    patientName: "Pedro Garcia",
    service: "Crown - PFM",
    amount: 10000,
    paymentMethod: "Cash",
    status: "partial"
  },
  {
    id: "TXN005",
    date: "2025-11-12",
    patientName: "Lisa Tan",
    service: "Oral Prophylaxis - Simple",
    amount: 1500,
    paymentMethod: "HMO",
    status: "completed"
  },
  {
    id: "TXN006",
    date: "2025-11-12",
    patientName: "Mark Lopez",
    service: "Restoration/Light Cure",
    amount: 2000,
    paymentMethod: "Cash",
    status: "completed"
  },
  {
    id: "TXN007",
    date: "2025-11-11",
    patientName: "Sarah Cruz",
    service: "Dentures - NEW ACE CD",
    amount: 40000,
    paymentMethod: "Bank Transfer",
    status: "completed"
  },
  {
    id: "TXN008",
    date: "2025-11-11",
    patientName: "Robert Mendoza",
    service: "Veneers - Composite (4 teeth)",
    amount: 4000,
    paymentMethod: "Card",
    status: "pending"
  }
];

export const expenses: Expense[] = [
  {
    id: "EXP001",
    date: "2025-11-14",
    category: "PPE",
    description: "Surgical Masks (100 pcs)",
    amount: 850,
    vendor: "Medical Supplies Co."
  },
  {
    id: "EXP002",
    date: "2025-11-14",
    category: "PPE",
    description: "Latex Gloves (50 boxes)",
    amount: 3500,
    vendor: "Dental Supplies Inc."
  },
  {
    id: "EXP003",
    date: "2025-11-13",
    category: "Utilities",
    description: "Electricity Bill - November",
    amount: 8500
  },
  {
    id: "EXP004",
    date: "2025-11-13",
    category: "Utilities",
    description: "Water Bill - November",
    amount: 2200
  },
  {
    id: "EXP005",
    date: "2025-11-12",
    category: "Miscellaneous",
    description: "Office Supplies",
    amount: 1500,
    vendor: "Office Depot"
  },
  {
    id: "EXP006",
    date: "2025-11-12",
    category: "PPE",
    description: "Disinfectant Solutions (5L)",
    amount: 2800,
    vendor: "Medical Supplies Co."
  },
  {
    id: "EXP007",
    date: "2025-11-11",
    category: "Utilities",
    description: "Internet - November",
    amount: 2500
  },
  {
    id: "EXP008",
    date: "2025-11-10",
    category: "Miscellaneous",
    description: "Cleaning Services",
    amount: 3000,
    vendor: "Clean Pro Services"
  },
  {
    id: "EXP009",
    date: "2025-11-10",
    category: "PPE",
    description: "Dental Bibs (500 pcs)",
    amount: 1200,
    vendor: "Dental Supplies Inc."
  },
  {
    id: "EXP010",
    date: "2025-11-09",
    category: "Miscellaneous",
    description: "Marketing Materials",
    amount: 5000,
    vendor: "Print Solutions"
  }
];

export const monthlyFinancialData: MonthlyFinancialSummary[] = [
  { month: "May", income: 185000, expenses: 42000, netIncome: 143000 },
  { month: "Jun", income: 198000, expenses: 45000, netIncome: 153000 },
  { month: "Jul", income: 210000, expenses: 48000, netIncome: 162000 },
  { month: "Aug", income: 195000, expenses: 44000, netIncome: 151000 },
  { month: "Sep", income: 220000, expenses: 50000, netIncome: 170000 },
  { month: "Oct", income: 235000, expenses: 52000, netIncome: 183000 },
  { month: "Nov", income: 245000, expenses: 54000, netIncome: 191000 }
];

// Helper functions
export function getTotalIncome(): number {
  return paymentTransactions
    .filter(t => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalExpenses(): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getNetIncome(): number {
  return getTotalIncome() - getTotalExpenses();
}

export function getExpensesByCategory() {
  const categories = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(categories).map(([name, value]) => ({ name, value }));
}
