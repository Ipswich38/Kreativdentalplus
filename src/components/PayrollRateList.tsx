import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dentist } from "../data/dentists";
import { DollarSign, TrendingUp } from "lucide-react";

interface PayrollRateListProps {
  dentist: Dentist;
}

export function PayrollRateList({ dentist }: PayrollRateListProps) {
  const getPositionBadgeColor = () => {
    if (dentist.specialty.includes("Owner")) return "bg-gradient-to-r from-purple-500 to-pink-500";
    if (dentist.specialty.includes("Specialist")) return "bg-gradient-to-r from-blue-500 to-cyan-500";
    return "bg-gradient-to-r from-green-500 to-emerald-500";
  };

  // Calculate basic rate total if available
  const basicRateTotal = dentist.rateStructure.basicRate
    ? dentist.rateStructure.basicRate.reduce((sum, rate) => {
        if (rate.amount > 0) return Math.max(sum, rate.amount);
        return sum;
      }, 0)
    : 0;

  return (
    <Card className="p-5 hover:shadow-lg transition-all border-0 bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-start gap-4">
        {/* Left Side - Avatar and Name */}
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <DollarSign className="w-7 h-7 text-white" />
        </div>

        {/* Middle - Dentist Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-gray-900 mb-1">{dentist.name}</h4>
              <Badge className={`${getPositionBadgeColor()} text-white text-xs`}>
                {dentist.specialty}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            {/* Basic Rate Section */}
            {dentist.rateStructure.basicRate && dentist.rateStructure.basicRate.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-gray-600 mb-2">Basic per Day</p>
                <div className="space-y-1.5">
                  {dentist.rateStructure.basicRate.map((rate, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 text-xs">{rate.description}</span>
                      <span className="text-gray-900">
                        {rate.amount === 0 ? (
                          <Badge variant="outline" className="text-red-600 border-red-300 text-xs">
                            NO BASIC
                          </Badge>
                        ) : (
                          <span className="font-medium">₱{rate.amount.toLocaleString()}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Commission Section */}
            {dentist.rateStructure.commissions && dentist.rateStructure.commissions.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600">Commission Rates</p>
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {dentist.rateStructure.commissions.map((commission, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 text-xs">{commission.service}</span>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                        {commission.rate}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Summary */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-500 mb-1">Pay Type</p>
          <Badge variant="outline" className="text-xs">
            {dentist.rateStructure.type === "commission" && "Commission Only"}
            {dentist.rateStructure.type === "basic" && "Basic Only"}
            {dentist.rateStructure.type === "mixed" && "Basic + Commission"}
          </Badge>
          {basicRateTotal > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Base Rate</p>
              <p className="text-gray-900">₱{basicRateTotal.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
