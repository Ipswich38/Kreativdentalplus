import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dentist } from "../data/dentists";
import { DollarSign } from "lucide-react";

interface DentistRateTableProps {
  dentist: Dentist;
}

export function DentistRateTable({ dentist }: DentistRateTableProps) {
  const getPositionBadgeColor = () => {
    if (dentist.specialty.includes("Owner")) return "bg-gradient-to-r from-purple-500 to-pink-500";
    if (dentist.specialty.includes("Specialist")) return "bg-gradient-to-r from-blue-500 to-cyan-500";
    return "bg-gradient-to-r from-green-500 to-emerald-500";
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="bg-gradient-to-br from-gray-50 to-white border-b">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="mb-2">{dentist.name}</CardTitle>
            <div className="flex gap-2">
              <Badge className={`${getPositionBadgeColor()} text-white`}>
                {dentist.specialty}
              </Badge>
            </div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Basic Rate Section */}
        {dentist.rateStructure.basicRate && dentist.rateStructure.basicRate.length > 0 && (
          <div className="border-b">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-2 border-b">
              <h4 className="text-sm text-gray-900">Basic per day compensation structure</h4>
            </div>
            <Table>
              <TableBody>
                {dentist.rateStructure.basicRate.map((rate, idx) => (
                  <TableRow key={idx} className="hover:bg-gray-50">
                    <TableCell className="py-3">{rate.description}</TableCell>
                    <TableCell className="text-right py-3">
                      {rate.amount === 0 ? (
                        <Badge variant="outline" className="text-red-600 border-red-300">
                          NO BASIC PAY
                        </Badge>
                      ) : (
                        <span className="text-gray-900">{rate.amount.toLocaleString()}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Commission Section */}
        {dentist.rateStructure.commissions && dentist.rateStructure.commissions.length > 0 && (
          <div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-2 border-b">
              <h4 className="text-sm text-gray-900">Commission</h4>
            </div>
            <Table>
              <TableBody>
                {dentist.rateStructure.commissions.map((commission, idx) => (
                  <TableRow key={idx} className="hover:bg-gray-50">
                    <TableCell className="py-3">{commission.service}</TableCell>
                    <TableCell className="text-right py-3">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        {commission.rate}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
