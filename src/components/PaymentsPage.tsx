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
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import type { User } from "../data/users";

interface Payment {
  id: string;
  payment_number: string;
  appointment_id: string;
  patient_id: string;
  amount: number;
  payment_method: 'cash' | 'gcash' | 'maya' | 'bank_transfer' | 'hmo';
  reference_number?: string;
  hmo_provider?: string;
  hmo_approved_amount?: number;
  status: 'pending' | 'completed' | 'failed';
  processed_by: string;
  created_at: string;
  appointments?: {
    appointment_date: string;
    appointment_time: string;
    status: string;
    patients?: {
      first_name: string;
      last_name: string;
      phone: string;
    };
    staff_users?: {
      full_name: string;
      specialization: string;
    };
  };
}

interface AwaitingPayment {
  id: string;
  appointment_number: string;
  appointment_date: string;
  appointment_time: string;
  patient_name: string;
  dentist_name: string;
  service_amount: number;
  status: string;
  assist_staff?: string;
}

interface PaymentFormData {
  appointmentId: string;
  baseAmount: number;
  addOns: Array<{ service: string; amount: number; description: string }>;
  paymentMethod: 'cash' | 'gcash' | 'maya' | 'bank_transfer' | 'hmo';
  paidAmount?: number;
  referenceNumber?: string;
  hmoProvider?: string;
  hmoApprovedAmount?: number;
  notes: string;
}

interface PaymentsPageProps {
  currentUser: User;
}

export function PaymentsPage({ currentUser }: PaymentsPageProps) {
  const [activeTab, setActiveTab] = useState<'awaiting' | 'completed' | 'add-transaction'>('awaiting');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [awaitingPayments, setAwaitingPayments] = useState<AwaitingPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AwaitingPayment | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    appointmentId: '',
    baseAmount: 0,
    addOns: [],
    paymentMethod: 'cash',
    notes: ''
  });

  useEffect(() => {
    loadPayments();
    loadAwaitingPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // Mock data for now - in production, load from payments table
      const mockPayments: Payment[] = [
        {
          id: '1',
          payment_number: 'PAY001',
          appointment_id: 'apt_123',
          patient_id: 'pat_456',
          amount: 3500,
          payment_method: 'cash',
          status: 'completed',
          processed_by: currentUser.employeeId,
          created_at: new Date().toISOString(),
          appointments: {
            appointment_date: '2024-11-15',
            appointment_time: '10:00',
            status: 'completed',
            patients: {
              first_name: 'Maria',
              last_name: 'Santos',
              phone: '+639123456789'
            },
            staff_users: {
              full_name: 'Dr. Jerome Oh',
              specialization: 'Endodontics'
            }
          }
        }
      ];
      setPayments(mockPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAwaitingPayments = async () => {
    try {
      // Mock data for appointments awaiting payment
      const mockAwaiting: AwaitingPayment[] = [
        {
          id: '1',
          appointment_number: 'APT001',
          appointment_date: '2024-11-15',
          appointment_time: '09:00',
          patient_name: 'John Doe',
          dentist_name: 'Dr. Jerome Oh',
          service_amount: 2500,
          status: 'awaiting_payment',
          assist_staff: 'Ms. Jezel Roche'
        },
        {
          id: '2',
          appointment_number: 'APT002',
          appointment_date: '2024-11-15',
          appointment_time: '10:30',
          patient_name: 'Jane Smith',
          dentist_name: 'Dra. Clency',
          service_amount: 1500,
          status: 'awaiting_payment'
        }
      ];
      setAwaitingPayments(mockAwaiting);
    } catch (error) {
      console.error('Error loading awaiting payments:', error);
    }
  };

  const addAddOn = () => {
    setPaymentForm(prev => ({
      ...prev,
      addOns: [...prev.addOns, { service: '', amount: 0, description: '' }]
    }));
  };

  const updateAddOn = (index: number, field: string, value: any) => {
    setPaymentForm(prev => ({
      ...prev,
      addOns: prev.addOns.map((addon, i) =>
        i === index ? { ...addon, [field]: value } : addon
      )
    }));
  };

  const removeAddOn = (index: number) => {
    setPaymentForm(prev => ({
      ...prev,
      addOns: prev.addOns.filter((_, i) => i !== index)
    }));
  };

  const getTotalAmount = () => {
    const baseAmount = paymentForm.baseAmount || 0;
    const addOnsTotal = paymentForm.addOns.reduce((sum, addon) => sum + (addon.amount || 0), 0);
    return baseAmount + addOnsTotal;
  };

  const processPayment = async () => {
    try {
      setLoading(true);

      const paymentData = {
        payment_number: `PAY${Date.now().toString().slice(-6)}`,
        appointment_id: selectedAppointment?.id,
        patient_id: 'patient_id', // Would come from appointment data
        amount: getTotalAmount(),
        payment_method: paymentForm.paymentMethod,
        reference_number: paymentForm.referenceNumber,
        hmo_provider: paymentForm.hmoProvider,
        hmo_approved_amount: paymentForm.hmoApprovedAmount,
        status: 'completed',
        processed_by: currentUser.employeeId,
        notes: paymentForm.notes,
        add_ons: paymentForm.addOns
      };

      console.log('Processing payment:', paymentData);

      // In production, save to database
      // const { error } = await supabase.from('payments').insert([paymentData]);
      // if (error) throw error;

      // Update appointment status to paid
      // await supabase.from('appointments').update({ status: 'paid' }).eq('id', selectedAppointment?.id);

      // Calculate commissions (implement commission calculation logic)
      calculateCommissions(paymentData);

      alert('✅ Payment processed successfully!');
      setShowPaymentDialog(false);
      setSelectedAppointment(null);
      setPaymentForm({
        appointmentId: '',
        baseAmount: 0,
        addOns: [],
        paymentMethod: 'cash',
        notes: ''
      });

      // Refresh data
      loadPayments();
      loadAwaitingPayments();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('❌ Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const calculateCommissions = (paymentData: any) => {
    // Commission calculation logic
    const totalAmount = paymentData.amount;

    // Dentist commission (40% example)
    const dentistCommission = totalAmount * 0.40;

    // Staff commission (5% example)
    const staffCommission = totalAmount * 0.05;

    // Clinic earnings
    const clinicEarnings = totalAmount - dentistCommission - staffCommission;

    console.log('Commission Breakdown:', {
      totalAmount,
      dentistCommission,
      staffCommission,
      clinicEarnings
    });

    // In production, save commission data to database
    // This would update dentist and staff commission tables
  };

  const exportPayments = () => {
    const exportData = payments.map(payment => ({
      'Payment #': payment.payment_number,
      'Date': new Date(payment.created_at).toLocaleDateString(),
      'Patient': payment.appointments?.patients ?
        `${payment.appointments.patients.first_name} ${payment.appointments.patients.last_name}` : 'N/A',
      'Dentist': payment.appointments?.staff_users?.full_name || 'N/A',
      'Amount': `₱${payment.amount.toLocaleString()}`,
      'Payment Method': payment.payment_method.toUpperCase(),
      'Reference #': payment.reference_number || 'N/A',
      'Status': payment.status.toUpperCase(),
      'Processed By': payment.processed_by
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');

    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `KreativDental_Payments_${today}.xlsx`);
  };

  const openPaymentDialog = (appointment: AwaitingPayment) => {
    setSelectedAppointment(appointment);
    setPaymentForm({
      appointmentId: appointment.id,
      baseAmount: appointment.service_amount,
      addOns: [],
      paymentMethod: 'cash',
      notes: ''
    });
    setShowPaymentDialog(true);
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-0 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">💰 Payment Management</h2>
            <p className="text-green-100 text-sm">
              Process payments • Track transactions • Manage billing
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportPayments}
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6">
          {[
            { id: 'awaiting', label: 'Awaiting Payment', icon: Clock, count: awaitingPayments.length },
            { id: 'completed', label: 'Completed Payments', icon: CheckCircle, count: payments.length },
            { id: 'add-transaction', label: 'Add Transaction', icon: Plus }
          ].map(({ id, label, icon: Icon, count }) => (
            <Button
              key={id}
              onClick={() => setActiveTab(id as any)}
              variant={activeTab === id ? 'secondary' : 'ghost'}
              className={`rounded-xl text-white ${
                activeTab === id
                  ? 'bg-white/20 text-white'
                  : 'hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
              {count !== undefined && (
                <Badge className="ml-2 bg-white/20 text-white">
                  {count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Awaiting Payment Tab */}
      {activeTab === 'awaiting' && (
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Appointments Awaiting Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {awaitingPayments.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                  <p className="text-gray-500">No appointments awaiting payment at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {awaitingPayments.map((appointment) => (
                    <Card key={appointment.id} className="border border-orange-200 bg-orange-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className="text-orange-700 border-orange-300">
                            {appointment.appointment_number}
                          </Badge>
                          <Badge className="bg-orange-600 text-white">
                            Awaiting Payment
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="font-medium">{appointment.patient_name}</p>
                              <p className="text-sm text-gray-500">Patient</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="font-medium">
                                {new Date(appointment.appointment_date).toLocaleDateString()} - {appointment.appointment_time}
                              </p>
                              <p className="text-sm text-gray-500">Appointment Date</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <div>
                              <p className="font-medium text-green-600">₱{appointment.service_amount.toLocaleString()}</p>
                              <p className="text-sm text-gray-500">Base Amount</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="font-medium">{appointment.dentist_name}</p>
                              <p className="text-sm text-gray-500">Dentist</p>
                            </div>
                          </div>

                          {appointment.assist_staff && (
                            <div className="flex items-center gap-3">
                              <User className="w-4 h-4 text-purple-600" />
                              <div>
                                <p className="font-medium">{appointment.assist_staff}</p>
                                <p className="text-sm text-gray-500">Assisting Staff</p>
                              </div>
                            </div>
                          )}

                          <Button
                            onClick={() => openPaymentDialog(appointment)}
                            className="w-full mt-4 bg-green-600 hover:bg-green-700 rounded-xl"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Process Payment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Completed Payments Tab */}
      {activeTab === 'completed' && (
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Completed Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {payments
                    .filter(payment =>
                      payment.payment_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (payment.appointments?.patients?.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (payment.appointments?.patients?.last_name || '').toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((payment) => (
                      <Card key={payment.id} className="border border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline" className="text-green-700 border-green-300">
                              {payment.payment_number}
                            </Badge>
                            <Badge className="bg-green-600 text-white">
                              {payment.status.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <User className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="font-medium">
                                  {payment.appointments?.patients ?
                                    `${payment.appointments.patients.first_name} ${payment.appointments.patients.last_name}` :
                                    'Unknown Patient'
                                  }
                                </p>
                                <p className="text-sm text-gray-500">Patient</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="font-medium text-green-600">₱{payment.amount.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">Total Paid</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <CreditCard className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="font-medium">{payment.payment_method.toUpperCase()}</p>
                                <p className="text-sm text-gray-500">Payment Method</p>
                              </div>
                            </div>

                            {payment.reference_number && (
                              <div className="flex items-center gap-3">
                                <Receipt className="w-4 h-4 text-purple-600" />
                                <div>
                                  <p className="font-medium">{payment.reference_number}</p>
                                  <p className="text-sm text-gray-500">Reference Number</p>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="font-medium">
                                  {new Date(payment.created_at).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-500">Payment Date</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Transaction Tab */}
      {activeTab === 'add-transaction' && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Add Manual Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Manual Transaction Entry</h3>
              <p className="text-gray-500 mb-4">Add transactions not linked to appointments</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Transaction
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Processing Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              Process Payment - {selectedAppointment?.appointment_number}
            </DialogTitle>
            <DialogDescription>
              Patient: {selectedAppointment?.patient_name} | Dentist: {selectedAppointment?.dentist_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Base Service */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Base Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Scheduled Treatment</span>
                  <span className="font-semibold text-green-600">
                    ₱{paymentForm.baseAmount.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Add-ons */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Additional Services</CardTitle>
                  <Button onClick={addAddOn} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentForm.addOns.map((addon, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>Service</Label>
                      <Input
                        placeholder="e.g., Teeth Whitening"
                        value={addon.service}
                        onChange={(e) => updateAddOn(index, 'service', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={addon.amount}
                        onChange={(e) => updateAddOn(index, 'amount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        placeholder="Optional description"
                        value={addon.description}
                        onChange={(e) => updateAddOn(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={() => removeAddOn(index)}
                        size="sm"
                        variant="destructive"
                        className="w-full"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                {paymentForm.addOns.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No additional services added
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Total Amount */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-xl font-bold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">₱{getTotalAmount().toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={paymentForm.paymentMethod}
                  onValueChange={(value) => setPaymentForm(prev => ({ ...prev, paymentMethod: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4" />
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value="gcash">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        GCash
                      </div>
                    </SelectItem>
                    <SelectItem value="maya">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Maya
                      </div>
                    </SelectItem>
                    <SelectItem value="bank_transfer">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                    <SelectItem value="hmo">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        HMO
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Payment Method Specific Fields */}
                {paymentForm.paymentMethod === 'cash' && (
                  <div>
                    <Label>Amount Received</Label>
                    <Input
                      type="number"
                      placeholder={getTotalAmount().toString()}
                      value={paymentForm.paidAmount}
                      onChange={(e) => setPaymentForm(prev => ({
                        ...prev,
                        paidAmount: parseFloat(e.target.value) || 0
                      }))}
                    />
                    {paymentForm.paidAmount && paymentForm.paidAmount > getTotalAmount() && (
                      <p className="text-sm text-green-600 mt-1">
                        Change: ₱{(paymentForm.paidAmount - getTotalAmount()).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {(['gcash', 'maya', 'bank_transfer'].includes(paymentForm.paymentMethod)) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        placeholder={getTotalAmount().toString()}
                        value={paymentForm.paidAmount}
                        onChange={(e) => setPaymentForm(prev => ({
                          ...prev,
                          paidAmount: parseFloat(e.target.value) || 0
                        }))}
                      />
                    </div>
                    <div>
                      <Label>Reference Number</Label>
                      <Input
                        placeholder="Transaction reference"
                        value={paymentForm.referenceNumber}
                        onChange={(e) => setPaymentForm(prev => ({
                          ...prev,
                          referenceNumber: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                )}

                {paymentForm.paymentMethod === 'hmo' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>HMO Provider</Label>
                      <Select
                        value={paymentForm.hmoProvider}
                        onValueChange={(value) => setPaymentForm(prev => ({
                          ...prev,
                          hmoProvider: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select HMO" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="philhealth">PhilHealth</SelectItem>
                          <SelectItem value="maxicare">Maxicare</SelectItem>
                          <SelectItem value="intellicare">Intellicare</SelectItem>
                          <SelectItem value="medicard">Medicard</SelectItem>
                          <SelectItem value="avega">Avega</SelectItem>
                          <SelectItem value="carehealth">CareHealth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>HMO Approved Amount</Label>
                      <Input
                        type="number"
                        placeholder="Approved amount"
                        value={paymentForm.hmoApprovedAmount}
                        onChange={(e) => setPaymentForm(prev => ({
                          ...prev,
                          hmoApprovedAmount: parseFloat(e.target.value) || 0
                        }))}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="Additional notes about the payment..."
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => setShowPaymentDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={processPayment}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {loading ? 'Processing...' : 'Complete Payment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}