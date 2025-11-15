import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  Eye,
  Edit,
  Trash,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

interface Appointment {
  id: string;
  appointment_number: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes?: string;
  total_amount?: number;
  patients?: {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
  };
  staff_users?: {
    full_name: string;
    specialization: string;
  };
  services?: {
    name: string;
  };
}

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(first_name, last_name, phone, email),
          staff_users(full_name, specialization),
          services(name)
        `)
        .order('appointment_date', { ascending: false })
        .order('appointment_time');

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = filteredAppointments.map(appointment => ({
      'Appointment #': appointment.appointment_number,
      'Date': new Date(appointment.appointment_date).toLocaleDateString(),
      'Time': appointment.appointment_time,
      'Patient Name': appointment.patients ?
        `${appointment.patients.first_name} ${appointment.patients.last_name}` : 'N/A',
      'Patient Phone': appointment.patients?.phone || 'N/A',
      'Patient Email': appointment.patients?.email || 'N/A',
      'Dentist': appointment.staff_users?.full_name || 'N/A',
      'Specialization': appointment.staff_users?.specialization || 'N/A',
      'Service': appointment.services?.name || 'N/A',
      'Status': appointment.status?.toUpperCase() || 'N/A',
      'Total Amount': appointment.total_amount ? `₱${appointment.total_amount}` : '₱0',
      'Notes': appointment.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Appointments');

    // Auto-resize columns
    const colWidths = exportData.reduce((acc, row) => {
      Object.keys(row).forEach((key, i) => {
        const value = row[key as keyof typeof row] || '';
        acc[i] = Math.max(acc[i] || 0, value.toString().length + 2);
      });
      return acc;
    }, {} as Record<number, number>);

    ws['!cols'] = Object.keys(colWidths).map(i => ({ wch: colWidths[parseInt(i)] }));

    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `KreativDental_Appointments_${today}.xlsx`);
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      // Reload appointments to reflect changes
      loadAppointments();
      alert(`✅ Appointment status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('❌ Failed to update appointment status');
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch =
      appointment.appointment_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (appointment.patients?.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (appointment.patients?.last_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (appointment.staff_users?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

    const matchesDate = (() => {
      if (dateFilter === 'all') return true;
      const appointmentDate = new Date(appointment.appointment_date);
      const today = new Date();

      switch (dateFilter) {
        case 'today':
          return appointmentDate.toDateString() === today.toDateString();
        case 'week':
          const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
          const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
          return appointmentDate >= weekStart && appointmentDate <= weekEnd;
        case 'month':
          return appointmentDate.getMonth() === today.getMonth() &&
                 appointmentDate.getFullYear() === today.getFullYear();
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'scheduled':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'no-show':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return CheckCircle;
      case 'scheduled':
        return Clock;
      case 'cancelled':
        return XCircle;
      case 'no-show':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 sm:px-6 lg:px-0 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Appointments Management</h2>
            <p className="text-blue-100 text-sm">
              {appointments.length} total appointments • {filteredAppointments.length} matching filters
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportToExcel}
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setDateFilter('all');
                }}
                variant="outline"
                className="w-full rounded-xl"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Grid */}
      {filteredAppointments.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'No appointments have been scheduled yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((appointment) => {
            const StatusIcon = getStatusIcon(appointment.status);
            return (
              <Card key={appointment.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {appointment.appointment_number}
                      </Badge>
                    </div>
                    <Badge
                      variant={getStatusBadgeVariant(appointment.status) as any}
                      className="flex items-center gap-1"
                    >
                      <StatusIcon className="w-3 h-3" />
                      {appointment.status?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date & Time */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {appointment.appointment_time}
                      </p>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {appointment.patients ?
                          `${appointment.patients.first_name} ${appointment.patients.last_name}` :
                          'Unknown Patient'
                        }
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {appointment.patients?.phone || 'No phone'}
                      </p>
                    </div>
                  </div>

                  {/* Dentist Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {appointment.staff_users?.full_name || 'Unknown Dentist'}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {appointment.staff_users?.specialization || 'General'}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  {appointment.total_amount && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-gray-600">Total Amount</span>
                      <span className="text-sm font-semibold text-green-600">
                        ₱{appointment.total_amount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Select
                      value={appointment.status}
                      onValueChange={(value) => updateAppointmentStatus(appointment.id, value)}
                    >
                      <SelectTrigger className="flex-1 h-8 text-xs rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="no-show">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {filteredAppointments.filter(a => a.status === 'scheduled').length}
              </p>
              <p className="text-sm text-gray-600">Scheduled</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {filteredAppointments.filter(a => a.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {filteredAppointments.filter(a => a.status === 'cancelled').length}
              </p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                ₱{filteredAppointments.reduce((sum, a) => sum + (a.total_amount || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}