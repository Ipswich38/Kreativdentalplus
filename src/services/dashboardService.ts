import { supabase } from '../lib/supabase';

export interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
  monthlyRevenue: number;
  pendingPayments: number;
  lowStockItems: number;
  activeStaff: number;
  completedAppointments: number;
  pendingAppointments: number;
}

export interface RecentActivity {
  id: string;
  type: 'appointment' | 'payment' | 'patient' | 'attendance';
  title: string;
  description: string;
  time: string;
  timestamp: Date;
}

export interface TodayAppointment {
  id: string;
  time: string;
  patient_name: string;
  service_name: string;
  status: string;
  dentist_name?: string;
}

export class DashboardService {
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get today's date
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

      // Fetch all data in parallel
      const [
        appointmentsResult,
        patientsResult,
        transactionsResult,
        inventoryResult,
        staffResult
      ] = await Promise.all([
        // Today's appointments
        supabase
          .from('appointments')
          .select('id, status')
          .eq('appointment_date', todayStr),

        // Total active patients
        supabase
          .from('patients')
          .select('id')
          .eq('is_active', true),

        // Monthly revenue and pending payments
        supabase
          .from('financial_transactions')
          .select('amount, status, type')
          .gte('transaction_date', firstDayOfMonth),

        // Low stock inventory items
        supabase
          .from('inventory')
          .select('id, current_stock, minimum_stock')
          .eq('is_active', true),

        // Active staff
        supabase
          .from('staff_users')
          .select('id')
          .eq('is_active', true)
      ]);

      // Process the results
      const todayAppointments = appointmentsResult.data?.length || 0;
      const totalPatients = patientsResult.data?.length || 0;
      const activeStaff = staffResult.data?.length || 0;

      // Calculate completed and pending appointments
      const completedAppointments = appointmentsResult.data?.filter(apt => apt.status === 'completed').length || 0;
      const pendingAppointments = appointmentsResult.data?.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed').length || 0;

      // Calculate monthly revenue and pending payments
      const transactions = transactionsResult.data || [];
      const monthlyRevenue = transactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const pendingPayments = transactions
        .filter(t => t.status === 'pending')
        .length;

      // Calculate low stock items
      const inventory = inventoryResult.data || [];
      const lowStockItems = inventory
        .filter(item => item.current_stock <= item.minimum_stock)
        .length;

      return {
        todayAppointments,
        totalPatients,
        monthlyRevenue,
        pendingPayments,
        lowStockItems,
        activeStaff,
        completedAppointments,
        pendingAppointments
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return zero values on error
      return {
        todayAppointments: 0,
        totalPatients: 0,
        monthlyRevenue: 0,
        pendingPayments: 0,
        lowStockItems: 0,
        activeStaff: 0,
        completedAppointments: 0,
        pendingAppointments: 0
      };
    }
  }

  static async getTodayAppointments(dentistId?: string): Promise<TodayAppointment[]> {
    try {
      const today = new Date().toISOString().split('T')[0];

      let query = supabase
        .from('appointments')
        .select(`
          id,
          appointment_time,
          status,
          patients!inner(first_name, last_name),
          services!inner(name),
          staff_users!inner(full_name)
        `)
        .eq('appointment_date', today)
        .order('appointment_time');

      // If dentistId is provided, filter by dentist
      if (dentistId) {
        query = query.eq('dentist_id', dentistId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((apt: any) => ({
        id: apt.id,
        time: new Date(`2000-01-01T${apt.appointment_time}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        patient_name: `${apt.patients.first_name} ${apt.patients.last_name}`,
        service_name: apt.services.name,
        status: apt.status,
        dentist_name: apt.staff_users.full_name
      }));
    } catch (error) {
      console.error('Error fetching today appointments:', error);
      return [];
    }
  }

  static async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      // For now, we'll create activities from recent appointments and patients
      // In a full implementation, you might have a dedicated activity log table

      const [appointmentsResult, patientsResult] = await Promise.all([
        supabase
          .from('appointments')
          .select(`
            id, created_at,
            patients!inner(first_name, last_name),
            services!inner(name)
          `)
          .order('created_at', { ascending: false })
          .limit(5),

        supabase
          .from('patients')
          .select('id, created_at, first_name, last_name')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const activities: RecentActivity[] = [];

      // Add appointment activities
      (appointmentsResult.data || []).forEach((apt: any) => {
        activities.push({
          id: `apt-${apt.id}`,
          type: 'appointment',
          title: 'New appointment scheduled',
          description: `${apt.patients.first_name} ${apt.patients.last_name} - ${apt.services.name}`,
          time: this.getTimeAgo(new Date(apt.created_at)),
          timestamp: new Date(apt.created_at)
        });
      });

      // Add patient activities
      (patientsResult.data || []).forEach((patient: any) => {
        activities.push({
          id: `pat-${patient.id}`,
          type: 'patient',
          title: 'New patient registered',
          description: `${patient.first_name} ${patient.last_name}`,
          time: this.getTimeAgo(new Date(patient.created_at)),
          timestamp: new Date(patient.created_at)
        });
      });

      // Sort by timestamp and return limited results
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);

    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  private static getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }

  static async getDentistStats(dentistId: string): Promise<{
    todayAppointments: number;
    myPatients: number;
    monthlyEarnings: number;
    completedToday: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const firstDayOfMonth = new Date().toISOString().slice(0, 7) + '-01';

      const [appointmentsResult, patientsResult, earningsResult] = await Promise.all([
        // Today's appointments for this dentist
        supabase
          .from('appointments')
          .select('id, status')
          .eq('dentist_id', dentistId)
          .eq('appointment_date', today),

        // Unique patients treated by this dentist
        supabase
          .from('appointments')
          .select('patient_id')
          .eq('dentist_id', dentistId)
          .not('patient_id', 'is', null),

        // Monthly earnings (would need payroll calculation in real app)
        supabase
          .from('financial_transactions')
          .select('amount')
          .eq('staff_id', dentistId)
          .gte('transaction_date', firstDayOfMonth)
          .eq('status', 'completed')
      ]);

      const todayAppointments = appointmentsResult.data?.length || 0;
      const completedToday = appointmentsResult.data?.filter(apt => apt.status === 'completed').length || 0;

      // Count unique patients
      const uniquePatients = new Set(patientsResult.data?.map(apt => apt.patient_id) || []);
      const myPatients = uniquePatients.size;

      const monthlyEarnings = earningsResult.data?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

      return {
        todayAppointments,
        myPatients,
        monthlyEarnings,
        completedToday
      };
    } catch (error) {
      console.error('Error fetching dentist stats:', error);
      return {
        todayAppointments: 0,
        myPatients: 0,
        monthlyEarnings: 0,
        completedToday: 0
      };
    }
  }
}