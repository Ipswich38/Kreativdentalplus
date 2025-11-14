import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  CreditCard,
  Wallet,
  Download,
  Filter,
  Calendar as CalendarIcon
} from "lucide-react";
import { 
  paymentTransactions, 
  expenses, 
  monthlyFinancialData,
  getTotalIncome,
  getTotalExpenses,
  getNetIncome,
  getExpensesByCategory
} from "../data/financial";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function FinancialPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const netIncome = getNetIncome();
  const expensesByCategory = getExpensesByCategory();

  const COLORS = {
    PPE: "#8b5cf6",
    Utilities: "#ec4899", 
    Miscellaneous: "#06b6d4"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900">Financial Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track income, expenses, and financial performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Income</p>
                <p className="text-gray-900">₱{totalIncome.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+12.5%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                <p className="text-gray-900">₱{totalExpenses.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500">+8.3%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Net Income</p>
                <p className="text-gray-900">₱{netIncome.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+15.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>Income vs Expenses</CardTitle>
            <p className="text-sm text-gray-600">Monthly comparison</p>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyFinancialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="income" fill="url(#incomeGradient)" name="Income" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="url(#expensesGradient)" name="Expenses" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>Expenses by Category</CardTitle>
            <p className="text-sm text-gray-600">Breakdown by type</p>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {expensesByCategory.map((category) => (
                <div key={category.name} className="text-center">
                  <div 
                    className="w-3 h-3 rounded-full mx-auto mb-1" 
                    style={{ backgroundColor: COLORS[category.name as keyof typeof COLORS] }}
                  />
                  <p className="text-xs text-gray-600">{category.name}</p>
                  <p className="text-sm text-gray-900">₱{category.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Net Income Trend */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle>Net Income Trend</CardTitle>
            <p className="text-sm text-gray-600">Sales vs Expenses over time</p>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyFinancialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="netIncome" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  name="Net Income"
                  dot={{ fill: '#8b5cf6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Transactions and Expenses */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Payment Transactions</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Transactions</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    After treatment/service payments
                  </p>
                </div>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  {paymentTransactions.length} transactions
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-gray-50">
                        <TableCell className="py-3">{transaction.id}</TableCell>
                        <TableCell className="py-3">
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="py-3">{transaction.patientName}</TableCell>
                        <TableCell className="py-3">{transaction.service}</TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-500" />
                            {transaction.paymentMethod}
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <span className="text-gray-900">
                            ₱{transaction.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <Badge 
                            className={
                              transaction.status === "completed"
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                : transaction.status === "pending"
                                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                                : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Expenses</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    PPE, Utilities, and Miscellaneous
                  </p>
                </div>
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                  {expenses.length} expenses
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Expense ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id} className="hover:bg-gray-50">
                        <TableCell className="py-3">{expense.id}</TableCell>
                        <TableCell className="py-3">
                          {new Date(expense.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge 
                            className={
                              expense.category === "PPE"
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                : expense.category === "Utilities"
                                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                                : "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                            }
                          >
                            {expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3">{expense.description}</TableCell>
                        <TableCell className="py-3 text-gray-600">
                          {expense.vendor || "—"}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <span className="text-gray-900">
                            ₱{expense.amount.toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
