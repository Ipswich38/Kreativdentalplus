import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Download,
  Search,
  Eye,
  Edit,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { PageWrapper } from './PageWrapper';

interface Appointment {
  id: string;
  appointment_number: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes?: string;
  total_amount?: number;
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  dentist_name: string;
  treatment_type: string;
}

const newStyles = `
.donezo-select {
    padding: 12px 16px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    font-size: 14px;
    background: var(--bg-gray);
    outline: none;
    cursor: pointer;
    transition: all 0.15s ease;
}

.donezo-select:focus {
    border-color: var(--primary-green);
    background: var(--white);
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.donezo-appointment-card {
    background: var(--bg-gray);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-xl);
    padding: 20px;
    transition: all 0.15s ease;
    cursor: pointer;
}

.donezo-appointment-card:hover {
    background: var(--white);
    border-color: var(--primary-green);
    box-shadow: var(--shadow-md);
}

.donezo-appointment-card .status-icon {
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.donezo-appointment-card .status-icon.confirmed { background: #22c55e; }
.donezo-appointment-card .status-icon.pending { background: #eab308; }
.donezo-appointment-card .status-icon.completed { background: #3b82f6; }
.donezo-appointment-card .status-icon.cancelled { background: #ef4444; }

.donezo-status-badge {
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
}

.donezo-status-badge.confirmed { background: #22c55e; }
.donezo-status-badge.pending { background: #eab308; }
.donezo-status-badge.completed { background: #3b82f6; }
.donezo-status-badge.cancelled { background: #ef4444; }

.donezo-icon-button {
    padding: 8px;
    border: 1px solid var(--border-light);
    border-radius: 8px;
    background: var(--white);
    cursor: pointer;
    transition: all 0.15s ease;
}

.donezo-icon-button:hover {
    background: var(--bg-gray);
}

.donezo-icon-button svg {
    width: 16px;
    height: 16px;
    color: var(--text-light);
}

.appointments-filter-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.appointments-search-wrapper {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.appointment-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.appointment-card-main-info {
  flex: 1;
}

.appointment-card-patient-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.appointment-card-patient-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.appointment-card-patient-details {
  font-size: 12px;
  color: #6b7280;
}

.appointment-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.appointment-card-grid-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.appointment-card-grid-item svg {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.appointment-card-grid-item span {
  font-size: 14px;
  color: #374151;
}

.appointment-card-notes {
  margin-top: 12px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.appointment-card-notes p {
  font-size: 13px;
  color: #6b7280;
  font-style: italic;
}

.appointment-card-status-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.appointment-card-amount {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.appointment-card-actions {
  display: flex;
  gap: 8px;
}

.no-appointments {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.no-appointments svg {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  opacity: 0.5;
}

.no-appointments h3 {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
}

.no-appointments p {
  font-size: 14px;
}

/* For DentistsPage */

.dentists-page-header {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

@media (min-width: 640px) {
    .dentists-page-header {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
}

.dentists-page-title h2 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-dark);
}

.dentists-page-title p {
    font-size: 14px;
    color: var(--text-light);
    margin-top: 4px;
}

.dentists-stats-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
}

@media (min-width: 768px) {
    .dentists-stats-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

.dentist-stat-card-content {
    padding: 20px;
}

.dentist-stat-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.dentist-stat-card-label {
    font-size: 14px;
    color: var(--text-light);
    margin-bottom: 4px;
}

.dentist-stat-card-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-dark);
}

.dentist-stat-card-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
}

.dentist-stat-card-icon svg {
    width: 24px;
    height: 24px;
    color: white;
}

.dentists-list-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
}

@media (min-width: 768px) {
    .dentists-list-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

.dentists-rates-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
}

/* Tabs */
.donezo-tabs {
}

.donezo-tabs-list {
    display: flex;
    gap: 8px;
    border-bottom: 1px solid var(--border-light);
    margin-bottom: 16px;
}

.donezo-tabs-trigger {
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-light);
    background: none;
    border: none;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
}

.donezo-tabs-trigger.active {
    color: var(--primary-green);
    border-bottom-color: var(--primary-green);
}

.donezo-tabs-content {
    display: none;
}

.donezo-tabs-content.active {
    display: block;
}

/* Dentist Card */
.donezo-dentist-card {
    background: var(--white);
    border-radius: var(--radius-xl);
    padding: 20px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
    transition: all 0.15s ease;
}

.donezo-dentist-card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
}

.donezo-dentist-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
}

.donezo-dentist-card-avatar {
    width: 48px;
    height: 48px;
    background: var(--primary-green);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.donezo-dentist-card-avatar svg {
    width: 24px;
    height: 24px;
    color: white;
}

.donezo-dentist-card-info {
    margin-left: 12px;
}

.donezo-dentist-card-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-dark);
}

.donezo-dentist-card-title {
    font-size: 14px;
    color: var(--text-light);
}

.donezo-dentist-badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    color: white;
    text-transform: capitalize;
}

.donezo-dentist-badge.active { background: var(--primary-green); }
.donezo-dentist-badge.on-leave { background: var(--accent-orange); }
.donezo-dentist-badge.inactive { background: var(--text-lighter); }

.donezo-dentist-card-body {
    margin-bottom: 16px;
}

.donezo-dentist-card-detail {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--text-light);
    margin-bottom: 8px;
}

.donezo-dentist-card-detail svg {
    width: 16px;
    height: 16px;
}

.donezo-dentist-card-actions {
    display: flex;
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid var(--border-light);
}

/* Dentist Rate Table */
.donezo-rate-table {
    background: var(--white);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
    overflow: hidden;
}

.donezo-rate-table-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-light);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.donezo-rate-table-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
}

.donezo-rate-badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    color: white;
}

.donezo-rate-badge.specialist { background: var(--secondary-blue); }
.donezo-rate-badge.owner { background: var(--accent-orange); }
.donezo-rate-badge.general { background: var(--primary-green); }
.donezo-rate-badge.inactive { background: var(--text-lighter); }


.donezo-rate-table-icon {
    width: 48px;
    height: 48px;
    background: var(--primary-green);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.donezo-rate-table-icon svg {
    width: 24px;
    height: 24px;
    color: white;
}

.donezo-table {
    width: 100%;
    border-collapse: collapse;
}

.donezo-table th,
.donezo-table td {
    padding: 12px 20px;
    text-align: left;
    border-bottom: 1px solid var(--border-light);
    font-size: 14px;
}

.donezo-table th {
    background: var(--bg-gray);
    font-weight: 600;
    color: var(--text-light);
}

.donezo-table tr:last-child td {
    border-bottom: none;
}

.donezo-table-section-header {
    background: var(--bg-gray);
    padding: 8px 20px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-light);
    text-transform: uppercase;
}

/* For ProductionPatientPage */
.donezo-patient-card {
    background: var(--bg-gray);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-xl);
    padding: 20px;
    transition: all 0.15s ease;
    cursor: pointer;
}

.donezo-patient-card:hover {
    background: var(--white);
    border-color: var(--primary-green);
    box-shadow: var(--shadow-md);
}

.donezo-patient-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
}

.donezo-patient-card-main-info {
    flex: 1;
}

.donezo-patient-card-patient-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.donezo-patient-card-avatar {
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 600;
}

.donezo-patient-card-avatar.active { background: #22c55e; }
.donezo-patient-card-avatar.inactive { background: #6b7280; }
.donezo-patient-card-avatar.new { background: #3b82f6; }

.donezo-patient-card-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 2px;
}

.donezo-patient-card-details {
    font-size: 12px;
    color: var(--text-light);
}

.donezo-patient-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
}

.donezo-patient-card-grid-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.donezo-patient-card-grid-item svg {
    width: 16px;
    height: 16px;
    color: var(--text-light);
}

.donezo-patient-card-grid-item span {
    font-size: 14px;
    color: var(--text-dark);
}

.donezo-patient-card-medical-history {
    margin-top: 12px;
    padding: 8px 12px;
    background: var(--white);
    border-radius: 8px;
    border: 1px solid var(--border-light);
}

.donezo-patient-card-medical-history p {
    font-size: 13px;
    color: var(--text-light);
}

.donezo-patient-card-status-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
}

.donezo-patient-card-status {
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
}

.donezo-patient-card-status.active { background: #22c55e; }
.donezo-patient-card-status.inactive { background: #6b7280; }
.donezo-patient-card-status.new { background: #3b82f6; }

.donezo-patient-card-info-block {
    text-align: right;
}

.donezo-patient-card-info-block .visits {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-dark);
}

.donezo-patient-card-info-block .balance {
    font-size: 14px;
    color: #ef4444;
    font-weight: 500;
}

.donezo-patient-card-info-block .next-appointment {
    font-size: 12px;
    color: #22c55e;
    font-weight: 500;
}

.donezo-patient-card-actions {
    display: flex;
    gap: 8px;
}

/* Dialog */
.donezo-dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 50;
}

.donezo-dialog-content {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: var(--white);
    border-radius: var(--radius-xl);
    padding: 24px;
    box-shadow: var(--shadow-lg);
    width: 90%;
    max-width: 500px;
    z-index: 100;
}

.donezo-dialog-header {
    margin-bottom: 16px;
}

.donezo-dialog-title {
    font-size: 18px;
    font-weight: 600;
}

.donezo-form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
}

@media (min-width: 640px) {
    .donezo-form-grid {
        grid-template-columns: 1fr 1fr;
    }
}

.donezo-form-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.donezo-form-field label {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-dark);
}

.donezo-input, .donezo-textarea, .donezo-select {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    font-size: 14px;
    background: var(--bg-gray);
    outline: none;
    transition: all 0.15s ease;
}

.donezo-input:focus, .donezo-textarea:focus, .donezo-select:focus {
    border-color: var(--primary-green);
    background: var(--white);
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.donezo-textarea {
    min-height: 100px;
}

.donezo-dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 24px;
}

/* For ProductionInventoryPage */
.donezo-inventory-alert {
    border-left: 4px solid var(--accent-orange);
    background: #fffbeb;
    padding: 16px;
    border-radius: var(--radius-lg);
}

.donezo-inventory-alert-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #b45309;
    font-weight: 600;
    margin-bottom: 12px;
}

.donezo-inventory-alert-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
}

@media (min-width: 768px) {
    .donezo-inventory-alert-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

.donezo-inventory-alert-item {
    background: var(--white);
    padding: 12px;
    border-radius: var(--radius-lg);
    border: 1px solid #fed7aa;
}
`;

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for appointments
  useEffect(() => {
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        appointment_number: 'APT-001',
        appointment_date: '2024-01-15',
        appointment_time: '09:00',
        status: 'confirmed',
        patient_name: 'Sarah Johnson',
        patient_phone: '+1 (555) 123-4567',
        patient_email: 'sarah.j@email.com',
        dentist_name: 'Dr. Michael Chen',
        treatment_type: 'Regular Cleaning',
        total_amount: 120,
        notes: 'First visit, no allergies'
      },
      {
        id: '2',
        appointment_number: 'APT-002',
        appointment_date: '2024-01-15',
        appointment_time: '10:30',
        status: 'pending',
        patient_name: 'Robert Martinez',
        patient_phone: '+1 (555) 234-5678',
        patient_email: 'r.martinez@email.com',
        dentist_name: 'Dr. Emily Rodriguez',
        treatment_type: 'Root Canal',
        total_amount: 850,
        notes: 'Follow-up appointment'
      },
      {
        id: '3',
        appointment_number: 'APT-003',
        appointment_date: '2024-01-15',
        appointment_time: '14:00',
        status: 'completed',
        patient_name: 'Lisa Thompson',
        patient_phone: '+1 (555) 345-6789',
        patient_email: 'lisa.t@email.com',
        dentist_name: 'Dr. Michael Chen',
        treatment_type: 'Teeth Whitening',
        total_amount: 300,
        notes: 'Satisfied with results'
      },
      {
        id: '4',
        appointment_number: 'APT-004',
        appointment_date: '2024-01-16',
        appointment_time: '11:00',
        status: 'confirmed',
        patient_name: 'David Wilson',
        patient_phone: '+1 (555) 456-7890',
        dentist_name: 'Dr. Emily Rodriguez',
        treatment_type: 'Dental Implant',
        total_amount: 1200,
        notes: 'Pre-surgical consultation completed'
      }
    ];
    setAppointments(mockAppointments);
  }, []);

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.appointment_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const pageActions = (
    <>
      <button className="donezo-header-button secondary">
        <Download className="w-4 h-4" />
        Export
      </button>
      <button className="donezo-header-button">
        <Plus className="w-4 h-4" />
        New Appointment
      </button>
    </>
  );

  return (
    <PageWrapper
      title="Appointments"
      subtitle="Manage and track all patient appointments"
      actions={pageActions}
    >
      <style>{newStyles}</style>
      {/* Filters and Search */}
      <div className="donezo-section" style={{ marginBottom: '24px' }}>
        <div className="appointments-filter-bar">
          <div className="donezo-search appointments-search-wrapper">
            <Search className="donezo-search-icon" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="donezo-search-input"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="donezo-select"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="donezo-section">
        <div className="donezo-section-header">
          <h3 className="donezo-section-title">All Appointments ({filteredAppointments.length})</h3>
        </div>

        <div className="appointments-list">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="donezo-appointment-card"
            >
              <div className="appointment-card-header">
                {/* Left Side - Main Info */}
                <div className="appointment-card-main-info">
                  <div className="appointment-card-patient-info">
                    <div className={`status-icon ${appointment.status}`}>
                      {getStatusIcon(appointment.status)}
                    </div>
                    <div>
                      <h4 className="appointment-card-patient-name">
                        {appointment.patient_name}
                      </h4>
                      <p className="appointment-card-patient-details">
                        {appointment.appointment_number} • {appointment.treatment_type}
                      </p>
                    </div>
                  </div>

                  <div className="appointment-card-grid">
                    <div className="appointment-card-grid-item">
                      <Calendar />
                      <span>
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="appointment-card-grid-item">
                      <Clock />
                      <span>
                        {appointment.appointment_time}
                      </span>
                    </div>
                    <div className="appointment-card-grid-item">
                      <User />
                      <span>
                        {appointment.dentist_name}
                      </span>
                    </div>
                    <div className="appointment-card-grid-item">
                      <Phone />
                      <span>
                        {appointment.patient_phone}
                      </span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="appointment-card-notes">
                      <p>
                        Notes: {appointment.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Side - Status and Actions */}
                <div className="appointment-card-status-actions">
                  <div className={`donezo-status-badge ${appointment.status}`}>
                    {appointment.status}
                  </div>

                  {appointment.total_amount && (
                    <div className="appointment-card-amount">
                      ${appointment.total_amount}
                    </div>
                  )}

                  <div className="appointment-card-actions">
                    <button className="donezo-icon-button">
                      <Eye />
                    </button>
                    <button className="donezo-icon-button">
                      <Edit />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="no-appointments">
            <Calendar />
            <h3>
              No appointments found
            </h3>
            <p>
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by creating your first appointment'
              }
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}