import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Staff } from "../data/staff";
import { DollarSign } from "lucide-react";

interface StaffRateTableProps {
  staff: Staff;
}

export function StaffRateTable({ staff }: StaffRateTableProps) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="bg-gradient-to-br from-gray-50 to-white border-b">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="mb-2">{staff.name}</CardTitle>
            <div className="flex gap-2">
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                {staff.position}
              </Badge>
            </div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Salary Section */}
        <div className="border-b">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-2 border-b">
            <h4 className="text-sm text-gray-900">Salary Structure</h4>
          </div>
          <Table>
            <TableBody>
              <TableRow className="hover:bg-gray-50">
                <TableCell className="py-3">
                  Basic {staff.salaryStructure.type === "daily" ? "per day" : "per week"}
                </TableCell>
                <TableCell className="text-right py-3">
                  <span className="text-gray-900">
                    ₱{staff.salaryStructure.basicRate.toLocaleString()}.00
                  </span>
                </TableCell>
              </TableRow>
              {staff.salaryStructure.transportationAllowance && (
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="py-3">
                    Transportation {staff.salaryStructure.transportationAllowance.frequency}
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <span className="text-gray-900">
                      ₱{staff.salaryStructure.transportationAllowance.amount.toLocaleString()}.00
                    </span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
