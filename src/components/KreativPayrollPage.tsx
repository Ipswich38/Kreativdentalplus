import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { DollarSign, TrendingUp, Users, Calendar, Download, FileText } from "lucide-react";
import { dentists } from "../data/dentists";
import { staff, commissionRates } from "../data/staff";
import { DentistCard } from "./DentistCard";
import { DentistRateTable } from "./DentistRateTable";
import { PayrollRateList } from "./PayrollRateList";
import { StaffCard } from "./StaffCard";
import { StaffRateTable } from "./StaffRateTable";

export function KreativPayrollPage() {
  const totalEmployees = dentists.length + staff.length;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900">kreativPayroll</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage payroll for {totalEmployees} team members ({dentists.length} dentists, {staff.length} staff)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Payroll</p>
                <p className="text-gray-900">₱45,250</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Employees</p>
                <p className="text-gray-900">{totalEmployees}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-gray-900">₱42,800</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Growth</p>
                <p className="text-gray-900">+12.5%</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rates-list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rates-list">Rates Summary</TabsTrigger>
          <TabsTrigger value="employees">Dentists</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="commission">Staff Commission</TabsTrigger>
          <TabsTrigger value="rates">Detailed Rates</TabsTrigger>
          <TabsTrigger value="payroll">Payroll History</TabsTrigger>
        </TabsList>

        <TabsContent value="rates-list" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Compensation & Rate Structure</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete overview of all dentist rates and commissions
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {dentists.map((dentist) => (
                  <PayrollRateList key={dentist.id} dentist={dentist} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Dentists ({dentists.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dentists.map((dentist) => (
                  <DentistCard key={dentist.id} dentist={dentist} showActions={false} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Staff Members ({staff.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staff.map((member) => (
                  <StaffCard key={member.id} staff={member} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Staff Commission Rates</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Commission structure for services/treatments
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service/Treatment</TableHead>
                    <TableHead>Commission Amount</TableHead>
                    <TableHead className="text-right">Condition</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionRates.map((rate, idx) => (
                    <TableRow key={idx} className="hover:bg-gray-50">
                      <TableCell className="py-3">{rate.service}</TableCell>
                      <TableCell className="py-3">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                          {rate.amount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-3 text-sm text-gray-600">
                        {rate.condition}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates" className="space-y-4">
          <div className="space-y-6">
            {/* Dentists Section */}
            <div>
              <h3 className="text-gray-900 mb-4">Dentist Rates</h3>
              <div className="grid grid-cols-1 gap-6">
                {dentists.map((dentist) => (
                  <DentistRateTable key={dentist.id} dentist={dentist} />
                ))}
              </div>
            </div>
            
            {/* Staff Section */}
            <div>
              <h3 className="text-gray-900 mb-4">Staff Salary Structure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {staff.map((member) => (
                  <StaffRateTable key={member.id} staff={member} />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Payroll Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "Nov 1, 2025", amount: "₱42,800", status: "Processed" },
                  { date: "Oct 1, 2025", amount: "₱41,200", status: "Processed" },
                  { date: "Sep 1, 2025", amount: "₱40,500", status: "Processed" },
                ].map((transaction, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border">
                    <div>
                      <p className="text-gray-900">{transaction.date}</p>
                      <p className="text-sm text-gray-600">Monthly Payroll</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900">{transaction.amount}</p>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}