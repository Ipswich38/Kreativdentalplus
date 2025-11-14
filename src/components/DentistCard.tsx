import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { User, Mail, Phone, Stethoscope } from "lucide-react";
import { Dentist } from "../data/dentists";

interface DentistCardProps {
  dentist: Dentist;
  showActions?: boolean;
}

export function DentistCard({ dentist, showActions = false }: DentistCardProps) {
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
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">{dentist.name}</h3>
            <p className="text-sm text-gray-600">{dentist.title}</p>
          </div>
        </div>
        <Badge className={`${getStatusColor(dentist.status)} text-white capitalize`}>
          {dentist.status}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Stethoscope className="w-4 h-4" />
          <span>{dentist.specialty}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span>{dentist.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{dentist.phone}</span>
        </div>
      </div>

      {showActions && (
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            View Schedule
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Edit Profile
          </Button>
        </div>
      )}
    </Card>
  );
}
