import { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Receipt,
  Calculator,
  Banknote,
  Smartphone,
  Building2,
  Search,
  Filter,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { PageWrapper } from './PageWrapper';
import type { User as UserType } from "../data/users";

interface Payment {
  id: string;
  payment_number: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  patient_name: string;
  treatment: string;
  notes?: string;
}

interface PaymentsPageProps {
  currentUser: UserType;
}

export function PaymentsPage({ currentUser }: PaymentsPageProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  // Mock data for payments
  useEffect(() => {
    const mockPayments: Payment[] = [
      {
        id: '1',
        payment_number: 'PAY-001',
        amount: 120.00,
        payment_date: '2024-01-15',
        payment_method: 'credit_card',
        status: 'completed',
        patient_name: 'Sarah Johnson',
        treatment: 'Regular Cleaning',
        notes: 'Paid in full'
      },
      {
        id: '2',
        payment_number: 'PAY-002',
        amount: 850.00,
        payment_date: '2024-01-15',
        payment_method: 'insurance',
        status: 'pending',
        patient_name: 'Robert Martinez',
        treatment: 'Root Canal',
        notes: 'Awaiting insurance approval'
      },
      {
        id: '3',
        payment_number: 'PAY-003',
        amount: 300.00,
        payment_date: '2024-01-14',
        payment_method: 'cash',
        status: 'completed',
        patient_name: 'Lisa Thompson',
        treatment: 'Teeth Whitening',
      },
      {
        id: '4',
        payment_number: 'PAY-004',
        amount: 1200.00,
        payment_date: '2024-01-13',
        payment_method: 'credit_card',
        status: 'partial',
        patient_name: 'David Wilson',
        treatment: 'Dental Implant',
        notes: 'Partial payment - $400 remaining'
      },
      {
        id: '5',
        payment_number: 'PAY-005',
        amount: 75.00,
        payment_date: '2024-01-12',
        payment_method: 'debit_card',
        status: 'completed',
        patient_name: 'Maria Garcia',
        treatment: 'Consultation',
      }
    ];
    setPayments(mockPayments);
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.payment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.treatment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'pending':
        return '#eab308';
      case 'partial':
        return '#f97316';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'debit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      case 'insurance':
        return <Building2 className="w-4 h-4" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'debit_card':
        return 'Debit Card';
      case 'cash':
        return 'Cash';
      case 'insurance':
        return 'Insurance';
      case 'mobile':
        return 'Mobile Payment';
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };

  // Calculate totals
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = payments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = payments.filter(payment => payment.status === 'completed').length;
  const todayPayments = payments
    .filter(payment => payment.payment_date === '2024-01-15')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pageActions = (
    <>
      <button className="donezo-header-button secondary">
        <Download className="w-4 h-4" />
        Export
      </button>
      <button className="donezo-header-button">
        <Plus className="w-4 h-4" />
        New Payment
      </button>
    </>
  );

  return (
    <PageWrapper
      title="Payments"
      subtitle="Track and manage all patient payments and financial transactions"
      actions={pageActions}
    >
      {/* Stats Grid */}
      <div className="donezo-stats-grid" style={{ marginBottom: '32px' }}>
        {/* Total Revenue */}
        <div className="donezo-stat-card primary">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Total Revenue</span>
            <DollarSign className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value">${totalRevenue.toFixed(2)}</div>
          <div className="donezo-stat-meta">All time revenue</div>
        </div>

        {/* Today's Payments */}
        <div className="donezo-stat-card">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Today's Payments</span>
            <Calendar className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value">${todayPayments.toFixed(2)}</div>
          <div className="donezo-stat-meta">Revenue today</div>
        </div>

        {/* Completed Payments */}
        <div className="donezo-stat-card">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Completed</span>
            <CheckCircle className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value">{completedPayments}</div>
          <div className="donezo-stat-meta">Successful payments</div>
        </div>

        {/* Pending Amount */}
        <div className="donezo-stat-card">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Pending</span>
            <Clock className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value">${pendingAmount.toFixed(2)}</div>
          <div className="donezo-stat-meta">Awaiting processing</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="donezo-section" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
            <Search style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                background: '#f9fafb',
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#22c55e';
                e.target.style.background = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              background: '#f9fafb',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              background: '#f9fafb',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Methods</option>
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="cash">Cash</option>
            <option value="insurance">Insurance</option>
            <option value="mobile">Mobile Payment</option>
          </select>
        </div>
      </div>

      {/* Payments List */}
      <div className="donezo-section">
        <div className="donezo-section-header">
          <h3 className="donezo-section-title">All Payments ({filteredPayments.length})</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#22c55e';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                {/* Left Side - Main Info */}
                <div style={{ flex: '1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      background: getStatusColor(payment.status),
                      color: 'white',
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getStatusIcon(payment.status)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>
                        {payment.patient_name}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>
                        {payment.payment_number} • {payment.treatment}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                      <span style={{ fontSize: '14px', color: '#374151' }}>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getMethodIcon(payment.payment_method)}
                      <span style={{ fontSize: '14px', color: '#374151' }}>
                        {formatPaymentMethod(payment.payment_method)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Receipt style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                      <span style={{ fontSize: '14px', color: '#374151' }}>
                        Receipt #{payment.payment_number}
                      </span>
                    </div>
                  </div>

                  {payment.notes && (
                    <div style={{ marginTop: '12px', padding: '8px 12px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                        Notes: {payment.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Side - Amount and Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                  <div style={{
                    background: getStatusColor(payment.status),
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {payment.status}
                  </div>

                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                    ${payment.amount.toFixed(2)}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      background: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <Eye style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                    </button>
                    <button style={{
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      background: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <Receipt style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6b7280'
          }}>
            <DollarSign style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: '0.5' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
              No payments found
            </h3>
            <p style={{ fontSize: '14px' }}>
              {searchTerm || statusFilter !== 'all' || methodFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by recording your first payment'
              }
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}