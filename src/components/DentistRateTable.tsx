import { Dentist } from "../data/dentists";
import { DollarSign } from "lucide-react";

interface DentistRateTableProps {
  dentist: Dentist;
}

export function DentistRateTable({ dentist }: DentistRateTableProps) {
  const getPositionBadgeClass = () => {
    if (dentist.specialty.includes("Owner")) return "owner";
    if (dentist.specialty.includes("Specialist")) return "specialist";
    return "general";
  };

  return (
    <div className="donezo-rate-table">
      <div className="donezo-rate-table-header">
        <div>
          <h3 className="donezo-rate-table-title">{dentist.name}</h3>
          <span className={`donezo-rate-badge ${getPositionBadgeClass()}`}>
            {dentist.specialty}
          </span>
        </div>
        <div className="donezo-rate-table-icon">
          <DollarSign />
        </div>
      </div>
      
      <div>
        {dentist.rateStructure.basicRate && dentist.rateStructure.basicRate.length > 0 && (
          <div>
            <div className="donezo-table-section-header">
              <h4>Basic per day compensation structure</h4>
            </div>
            <table className="donezo-table">
              <tbody>
                {dentist.rateStructure.basicRate.map((rate, idx) => (
                  <tr key={idx}>
                    <td>{rate.description}</td>
                    <td style={{ textAlign: 'right' }}>
                      {rate.amount === 0 ? (
                        <span className="donezo-rate-badge inactive">
                          NO BASIC PAY
                        </span>
                      ) : (
                        <span>{rate.amount.toLocaleString()}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {dentist.rateStructure.commissions && dentist.rateStructure.commissions.length > 0 && (
          <div>
            <div className="donezo-table-section-header">
              <h4>Commission</h4>
            </div>
            <table className="donezo-table">
              <tbody>
                {dentist.rateStructure.commissions.map((commission, idx) => (
                  <tr key={idx}>
                    <td>{commission.service}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="donezo-rate-badge general">
                        {commission.rate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
