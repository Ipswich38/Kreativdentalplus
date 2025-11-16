import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  Activity,
  Clock,
  Download
} from 'lucide-react';
import { PageWrapper } from './PageWrapper';
import type { User } from "../data/users";

interface Patient {
  id: string;
  patient_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address: string;
  last_visit: string;
  next_appointment?: string;
  status: string;
  medical_history: string[];
  total_visits: number;
  outstanding_balance: number;
}

interface ProductionPatientPageProps {
  currentUser: User;
}

export function ProductionPatientPage({ currentUser }: ProductionPatientPageProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for patients
  useEffect(() => {
    const mockPatients: Patient[] = [
      {
        id: '1',
        patient_number: 'PAT-001',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        date_of_birth: '1985-03-15',
        address: '123 Main St, City, State 12345',
        last_visit: '2024-01-10',
        next_appointment: '2024-02-15',
        status: 'active',
        medical_history: ['No allergies', 'Regular cleanings'],
        total_visits: 12,
        outstanding_balance: 0
      },
      {
        id: '2',
        patient_number: 'PAT-002',
        first_name: 'Robert',
        last_name: 'Martinez',
        email: 'r.martinez@email.com',
        phone: '+1 (555) 234-5678',
        date_of_birth: '1978-07-22',
        address: '456 Oak Ave, City, State 12345',
        last_visit: '2024-01-08',
        next_appointment: '2024-01-25',
        status: 'active',
        medical_history: ['Diabetes', 'High blood pressure'],
        total_visits: 8,
        outstanding_balance: 250.00
      },
      {
        id: '3',
        patient_number: 'PAT-003',
        first_name: 'Lisa',
        last_name: 'Thompson',
        email: 'lisa.t@email.com',
        phone: '+1 (555) 345-6789',
        date_of_birth: '1992-11-03',
        address: '789 Pine Rd, City, State 12345',
        last_visit: '2024-01-05',
        status: 'active',
        medical_history: ['No known allergies'],
        total_visits: 5,
        outstanding_balance: 0
      },
      {
        id: '4',
        patient_number: 'PAT-004',
        first_name: 'David',
        last_name: 'Wilson',
        email: 'david.w@email.com',
        phone: '+1 (555) 456-7890',
        date_of_birth: '1965-09-12',
        address: '321 Elm St, City, State 12345',
        last_visit: '2023-11-20',
        next_appointment: '2024-02-01',
        status: 'inactive',
        medical_history: ['Periodontal disease', 'Root canal history'],
        total_visits: 15,
        outstanding_balance: 150.00
      }
    ];
    setPatients(mockPatients);
  }, []);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch =
      patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patient_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'active';
      case 'inactive':
        return 'inactive';
      case 'new':
        return 'new';
      default:
        return 'inactive';
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate totals
  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.status === 'active').length;
  const newPatients = patients.filter(p => p.status === 'new').length;
  const totalOutstanding = patients.reduce((sum, p) => sum + p.outstanding_balance, 0);

  const pageActions = (
    <>
      <button className="donezo-header-button secondary">
        <Download className="w-4 h-4" />
        Export
      </button>
      <button className="donezo-header-button">
        <Plus className="w-4 h-4" />
        Add Patient
      </button>
    </>
  );

  return (
    <PageWrapper
      title="Patients"
      subtitle="Manage patient records and medical information"
      actions={pageActions}
    >
      {/* Stats Grid */}
      <div className="donezo-stats-grid" style={{ marginBottom: '32px' }}>
        <div className="donezo-stat-card primary">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Total Patients</span>
            <Users className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value">{totalPatients}</div>
          <div className="donezo-stat-meta">Registered patients</div>
        </div>

        <div className="donezo-stat-card">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Active</span>
            <Activity className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value">{activePatients}</div>
          <div className="donezo-stat-meta">Active patients</div>
        </div>

        <div className="donezo-stat-card">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">New</span>
            <Heart className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value">{newPatients}</div>
          <div className="donezo-stat-meta">This month</div>
        </div>

        <div className="donezo-stat-card">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Outstanding</span>
            <Clock className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value">${totalOutstanding.toFixed(2)}</div>
          <div className="donezo-stat-meta">Total balance due</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="donezo-section" style={{ marginBottom: '24px' }}>
        <div className="appointments-filter-bar">
          <div className="donezo-search appointments-search-wrapper">
            <Search className="donezo-search-icon" />
            <input
              type="text"
              placeholder="Search patients..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="new">New</option>
          </select>
        </div>
      </div>

      {/* Patients List */}
      <div className="donezo-section">
        <div className="donezo-section-header">
          <h3 className="donezo-section-title">All Patients ({filteredPatients.length})</h3>
        </div>

        <div className="appointments-list">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="donezo-patient-card"
            >
              <div className="donezo-patient-card-header">
                <div className="donezo-patient-card-main-info">
                  <div className="donezo-patient-card-patient-info">
                    <div className={`donezo-patient-card-avatar ${getStatusClass(patient.status)}`}>
                      {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="donezo-patient-card-name">
                        {patient.first_name} {patient.last_name}
                      </h4>
                      <p className="donezo-patient-card-details">
                        {patient.patient_number} • Age {calculateAge(patient.date_of_birth)}
                      </p>
                    </div>
                  </div>

                  <div className="donezo-patient-card-grid">
                    <div className="donezo-patient-card-grid-item">
                      <Mail />
                      <span>
                        {patient.email}
                      </span>
                    </div>
                    <div className="donezo-patient-card-grid-item">
                      <Phone />
                      <span>
                        {patient.phone}
                      </span>
                    </div>
                    <div className="donezo-patient-card-grid-item">
                      <Calendar />
                      <span>
                        Last visit: {new Date(patient.last_visit).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="donezo-patient-card-grid-item">
                      <MapPin />
                      <span>
                        {patient.address}
                      </span>
                    </div>
                  </div>

                  {patient.medical_history.length > 0 && (
                    <div className="donezo-patient-card-medical-history">
                      <p>
                        <strong>Medical History:</strong> {patient.medical_history.join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="donezo-patient-card-status-actions">
                  <div className={`donezo-patient-card-status ${getStatusClass(patient.status)}`}>
                    {patient.status}
                  </div>

                  <div className="donezo-patient-card-info-block">
                    <div className="visits">
                      {patient.total_visits} visits
                    </div>
                    {patient.outstanding_balance > 0 && (
                      <div className="balance">
                        Balance: ${patient.outstanding_balance.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {patient.next_appointment && (
                    <div className="next-appointment">
                      Next: {new Date(patient.next_appointment).toLocaleDateString()}
                    </div>
                  )}

                  <div className="donezo-patient-card-actions">
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

        {filteredPatients.length === 0 && (
          <div className="no-appointments">
            <Users />
            <h3>
              No patients found
            </h3>
            <p>
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by adding your first patient'
              }
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}