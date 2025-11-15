import { supabase } from '../lib/supabase';

interface CommissionRates {
  dentist_rate: number;
  assistant_rate: number;
  hygienist_rate: number;
  coordinator_rate: number;
}

interface PaymentData {
  id: string;
  appointment_id: string;
  patient_id: string;
  amount: number;
  payment_method: string;
  dentist_id: string;
  assigned_staff?: string;
  add_ons?: Array<{ service: string; amount: number; description: string }>;
}

interface CommissionBreakdown {
  dentist_commission: number;
  staff_commission: number;
  clinic_earnings: number;
  total_amount: number;
}

export class CommissionService {
  // Default commission rates (can be overridden by individual staff settings)
  private static readonly DEFAULT_RATES: CommissionRates = {
    dentist_rate: 0.40, // 40%
    assistant_rate: 0.05, // 5%
    hygienist_rate: 0.08, // 8%
    coordinator_rate: 0.03, // 3%
  };

  /**
   * Calculate and save commissions for a payment
   */
  static async calculateCommissions(paymentData: PaymentData): Promise<CommissionBreakdown> {
    try {
      const totalAmount = paymentData.amount;

      // Get dentist information and custom rates
      const dentistInfo = await this.getDentistInfo(paymentData.dentist_id);
      const dentistRate = dentistInfo?.commission_rate || this.DEFAULT_RATES.dentist_rate;

      // Calculate dentist commission
      const dentistCommission = totalAmount * dentistRate;

      // Get staff information and calculate staff commission
      let staffCommission = 0;
      let staffInfo = null;

      if (paymentData.assigned_staff) {
        staffInfo = await this.getStaffInfo(paymentData.assigned_staff);
        if (staffInfo) {
          const staffRate = this.getStaffCommissionRate(staffInfo.position);
          staffCommission = totalAmount * staffRate;
        }
      }

      // Calculate clinic earnings
      const clinicEarnings = totalAmount - dentistCommission - staffCommission;

      // Save commissions to database
      await this.saveCommissions(paymentData, {
        dentist_commission: dentistCommission,
        staff_commission: staffCommission,
        clinic_earnings: clinicEarnings,
        total_amount: totalAmount
      });

      console.log('Commission calculation completed:', {
        total_amount: totalAmount,
        dentist_commission: dentistCommission,
        staff_commission: staffCommission,
        clinic_earnings: clinicEarnings
      });

      return {
        dentist_commission: dentistCommission,
        staff_commission: staffCommission,
        clinic_earnings: clinicEarnings,
        total_amount: totalAmount
      };

    } catch (error) {
      console.error('Error calculating commissions:', error);
      throw error;
    }
  }

  /**
   * Get dentist information and custom commission rates
   */
  private static async getDentistInfo(dentistId: string) {
    try {
      const { data, error } = await supabase
        .from('staff_users')
        .select('id, full_name, commission_rates, specialization')
        .eq('id', dentistId)
        .single();

      if (error) throw error;

      // Extract commission rate from JSON field
      let commissionRate = this.DEFAULT_RATES.dentist_rate;
      if (data?.commission_rates) {
        const rates = typeof data.commission_rates === 'string'
          ? JSON.parse(data.commission_rates)
          : data.commission_rates;

        commissionRate = rates.treatment_rate || rates.owner_share || this.DEFAULT_RATES.dentist_rate;
      }

      return {
        ...data,
        commission_rate: commissionRate
      };
    } catch (error) {
      console.error('Error getting dentist info:', error);
      return null;
    }
  }

  /**
   * Get staff information for commission calculation
   */
  private static async getStaffInfo(staffName: string) {
    try {
      const { data, error } = await supabase
        .from('staff_users')
        .select('id, full_name, position, commission_rates')
        .eq('full_name', staffName)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting staff info:', error);
      return null;
    }
  }

  /**
   * Get commission rate based on staff position
   */
  private static getStaffCommissionRate(position: string): number {
    const normalizedPosition = position.toLowerCase();

    if (normalizedPosition.includes('assistant')) {
      return this.DEFAULT_RATES.assistant_rate;
    } else if (normalizedPosition.includes('hygienist')) {
      return this.DEFAULT_RATES.hygienist_rate;
    } else if (normalizedPosition.includes('coordinator')) {
      return this.DEFAULT_RATES.coordinator_rate;
    }

    // Default to assistant rate for other staff
    return this.DEFAULT_RATES.assistant_rate;
  }

  /**
   * Save commission records to database
   */
  private static async saveCommissions(
    paymentData: PaymentData,
    breakdown: CommissionBreakdown
  ) {
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const commissionRecords = [];

      // Save dentist commission
      if (breakdown.dentist_commission > 0) {
        commissionRecords.push({
          payment_id: paymentData.id,
          staff_id: paymentData.dentist_id,
          commission_type: 'dentist',
          base_amount: paymentData.amount,
          commission_rate: breakdown.dentist_commission / paymentData.amount,
          commission_amount: breakdown.dentist_commission,
          status: 'pending',
          period_month: month,
          period_year: year
        });
      }

      // Save staff commission
      if (breakdown.staff_commission > 0 && paymentData.assigned_staff) {
        const staffInfo = await this.getStaffInfo(paymentData.assigned_staff);
        if (staffInfo) {
          commissionRecords.push({
            payment_id: paymentData.id,
            staff_id: staffInfo.id,
            commission_type: this.getCommissionType(staffInfo.position),
            base_amount: paymentData.amount,
            commission_rate: breakdown.staff_commission / paymentData.amount,
            commission_amount: breakdown.staff_commission,
            status: 'pending',
            period_month: month,
            period_year: year
          });
        }
      }

      // Insert commission records
      if (commissionRecords.length > 0) {
        const { error: commissionError } = await supabase
          .from('commissions')
          .insert(commissionRecords);

        if (commissionError) throw commissionError;
      }

      // Save clinic earnings
      const { error: earningsError } = await supabase
        .from('clinic_earnings')
        .insert([{
          payment_id: paymentData.id,
          gross_amount: breakdown.total_amount,
          total_commissions: breakdown.dentist_commission + breakdown.staff_commission,
          net_earnings: breakdown.clinic_earnings,
          earning_date: currentDate.toISOString().split('T')[0]
        }]);

      if (earningsError) throw earningsError;

    } catch (error) {
      console.error('Error saving commissions:', error);
      throw error;
    }
  }

  /**
   * Determine commission type based on position
   */
  private static getCommissionType(position: string): string {
    const normalizedPosition = position.toLowerCase();

    if (normalizedPosition.includes('assistant')) {
      return 'assistant';
    } else if (normalizedPosition.includes('hygienist')) {
      return 'hygienist';
    } else if (normalizedPosition.includes('coordinator')) {
      return 'coordinator';
    }

    return 'assistant'; // Default
  }

  /**
   * Get commission summary for a staff member
   */
  static async getStaffCommissionSummary(
    staffId: string,
    month?: number,
    year?: number
  ) {
    try {
      let query = supabase
        .from('commissions')
        .select(`
          *,
          payments(payment_number, created_at, amount),
          staff_users(full_name, position)
        `)
        .eq('staff_id', staffId);

      if (month && year) {
        query = query.eq('period_month', month).eq('period_year', year);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate totals
      const totalCommission = data?.reduce((sum, item) => sum + (item.commission_amount || 0), 0) || 0;
      const totalTransactions = data?.length || 0;
      const averageRate = data && data.length > 0
        ? data.reduce((sum, item) => sum + (item.commission_rate || 0), 0) / data.length
        : 0;

      return {
        commissions: data,
        summary: {
          total_commission: totalCommission,
          total_transactions: totalTransactions,
          average_rate: averageRate
        }
      };
    } catch (error) {
      console.error('Error getting commission summary:', error);
      throw error;
    }
  }

  /**
   * Get clinic earnings summary
   */
  static async getClinicEarningsSummary(startDate?: string, endDate?: string) {
    try {
      let query = supabase
        .from('clinic_earnings')
        .select('*')
        .order('earning_date', { ascending: false });

      if (startDate) query = query.gte('earning_date', startDate);
      if (endDate) query = query.lte('earning_date', endDate);

      const { data, error } = await query;
      if (error) throw error;

      // Calculate totals
      const totalGross = data?.reduce((sum, item) => sum + (item.gross_amount || 0), 0) || 0;
      const totalCommissions = data?.reduce((sum, item) => sum + (item.total_commissions || 0), 0) || 0;
      const totalNet = data?.reduce((sum, item) => sum + (item.net_earnings || 0), 0) || 0;

      return {
        earnings: data,
        summary: {
          total_gross: totalGross,
          total_commissions: totalCommissions,
          total_net: totalNet,
          commission_percentage: totalGross > 0 ? (totalCommissions / totalGross) * 100 : 0
        }
      };
    } catch (error) {
      console.error('Error getting clinic earnings:', error);
      throw error;
    }
  }

  /**
   * Update commission payment status
   */
  static async updateCommissionStatus(commissionId: string, status: 'pending' | 'paid' | 'cancelled') {
    try {
      const { error } = await supabase
        .from('commissions')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', commissionId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating commission status:', error);
      throw error;
    }
  }
}