import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { User, Mail, Phone, Briefcase } from "lucide-react";
import { Staff } from "../data/staff";

interface StaffCardProps {
  staff: Staff;
}

export function StaffCard({ staff }: StaffCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-gradient-to-r from-green-500 to-emerald-500";
      case "on-leave": return "bg-gradient-to-r from-orange-500 to-amber-500";
      case "inactive": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card className="p-5 hover:shadow-lg transition-all border-0 bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">{staff.name}</h3>
            <p className="text-sm text-gray-600">{staff.position}</p>
          </div>
        </div>
        <Badge className={`${getStatusColor(staff.status)} text-white capitalize`}>
          {staff.status}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Briefcase className="w-4 h-4" />
          <span>{staff.position}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span>{staff.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{staff.phone}</span>
        </div>
      </div>

      {/* Salary Info */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Basic {staff.salaryStructure.type === "daily" ? "per day" : "per week"}
          </span>
          <span className="text-gray-900">
            ₱{staff.salaryStructure.basicRate.toLocaleString()}
          </span>
        </div>
        {staff.salaryStructure.transportationAllowance && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">
              Transportation ({staff.salaryStructure.transportationAllowance.frequency})
            </span>
            <span className="text-gray-900">
              ₱{staff.salaryStructure.transportationAllowance.amount.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
