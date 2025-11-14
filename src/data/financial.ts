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

export const paymentTransactions: PaymentTransaction[] = [];

export const expenses: Expense[] = [];

export const monthlyFinancialData: MonthlyFinancialSummary[] = [
  { month: "May", income: 0, expenses: 0, netIncome: 0 },
  { month: "Jun", income: 0, expenses: 0, netIncome: 0 },
  { month: "Jul", income: 0, expenses: 0, netIncome: 0 },
  { month: "Aug", income: 0, expenses: 0, netIncome: 0 },
  { month: "Sep", income: 0, expenses: 0, netIncome: 0 },
  { month: "Oct", income: 0, expenses: 0, netIncome: 0 },
  { month: "Nov", income: 0, expenses: 0, netIncome: 0 }
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
