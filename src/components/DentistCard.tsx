import { User, Mail, Phone, Stethoscope } from "lucide-react";
import { Dentist } from "../data/dentists";

interface DentistCardProps {
  dentist: Dentist;
  showActions?: boolean;
}

export function DentistCard({ dentist, showActions = false }: DentistCardProps) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case "active": return "active";
      case "on-leave": return "on-leave";
      case "inactive": return "inactive";
      default: return "inactive";
    }
  };

  return (
    <div className="donezo-dentist-card">
      <div className="donezo-dentist-card-header">
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div className="donezo-dentist-card-avatar">
            <User />
          </div>
          <div className="donezo-dentist-card-info">
            <h3 className="donezo-dentist-card-name">{dentist.name}</h3>
            <p className="donezo-dentist-card-title">{dentist.title}</p>
          </div>
        </div>
        <span className={`donezo-dentist-badge ${getStatusClass(dentist.status)}`}>
          {dentist.status}
        </span>
      </div>

      <div className="donezo-dentist-card-body">
        <div className="donezo-dentist-card-detail">
          <Stethoscope />
          <span>{dentist.specialty}</span>
        </div>
        <div className="donezo-dentist-card-detail">
          <Mail />
          <span>{dentist.email}</span>
        </div>
        <div className="donezo-dentist-card-detail">
          <Phone />
          <span>{dentist.phone}</span>
        </div>
      </div>

      {showActions && (
        <div className="donezo-dentist-card-actions">
          <button className="donezo-header-button secondary" style={{ flex: 1 }}>
            View Schedule
          </button>
          <button className="donezo-header-button secondary" style={{ flex: 1 }}>
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}
