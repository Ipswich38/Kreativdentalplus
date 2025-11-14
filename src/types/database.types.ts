export interface Database {
  public: {
    Tables: {
      // User Management
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'dentist' | 'receptionist' | 'staff'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role: 'admin' | 'dentist' | 'receptionist' | 'staff'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'dentist' | 'receptionist' | 'staff'
          created_at?: string
          updated_at?: string
        }
      }

      // Patient Management
      patients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          date_of_birth: string | null
          address: string | null
          emergency_contact: string | null
          medical_history: string | null
          allergies: string | null
          insurance_info: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          address?: string | null
          emergency_contact?: string | null
          medical_history?: string | null
          allergies?: string | null
          insurance_info?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          address?: string | null
          emergency_contact?: string | null
          medical_history?: string | null
          allergies?: string | null
          insurance_info?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // Appointment Management
      appointments: {
        Row: {
          id: string
          patient_id: string
          dentist_id: string
          service_id: string
          appointment_date: string
          appointment_time: string
          duration: number
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          dentist_id: string
          service_id: string
          appointment_date: string
          appointment_time: string
          duration: number
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          dentist_id?: string
          service_id?: string
          appointment_date?: string
          appointment_time?: string
          duration?: number
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // Services
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          duration: number
          category: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          duration: number
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          duration?: number
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // Staff/Dentist Management
      staff: {
        Row: {
          id: string
          profile_id: string
          specialization: string | null
          license_number: string | null
          hire_date: string
          hourly_rate: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          specialization?: string | null
          license_number?: string | null
          hire_date: string
          hourly_rate?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          specialization?: string | null
          license_number?: string | null
          hire_date?: string
          hourly_rate?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // Payroll
      payroll: {
        Row: {
          id: string
          staff_id: string
          pay_period_start: string
          pay_period_end: string
          hours_worked: number
          regular_hours: number
          overtime_hours: number
          gross_pay: number
          deductions: number
          net_pay: number
          status: 'pending' | 'approved' | 'paid'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          pay_period_start: string
          pay_period_end: string
          hours_worked: number
          regular_hours: number
          overtime_hours: number
          gross_pay: number
          deductions: number
          net_pay: number
          status?: 'pending' | 'approved' | 'paid'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          pay_period_start?: string
          pay_period_end?: string
          hours_worked?: number
          regular_hours?: number
          overtime_hours?: number
          gross_pay?: number
          deductions?: number
          net_pay?: number
          status?: 'pending' | 'approved' | 'paid'
          created_at?: string
          updated_at?: string
        }
      }

      // Attendance
      attendance: {
        Row: {
          id: string
          staff_id: string
          date: string
          clock_in: string | null
          clock_out: string | null
          break_duration: number | null
          total_hours: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          date: string
          clock_in?: string | null
          clock_out?: string | null
          break_duration?: number | null
          total_hours?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          date?: string
          clock_in?: string | null
          clock_out?: string | null
          break_duration?: number | null
          total_hours?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // Inventory
      inventory: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          quantity: number
          unit_price: number
          supplier: string | null
          reorder_level: number
          expiry_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          quantity: number
          unit_price: number
          supplier?: string | null
          reorder_level: number
          expiry_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          quantity?: number
          unit_price?: number
          supplier?: string | null
          reorder_level?: number
          expiry_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // Financial Transactions
      transactions: {
        Row: {
          id: string
          appointment_id: string | null
          patient_id: string
          type: 'payment' | 'refund' | 'insurance_claim'
          amount: number
          payment_method: 'cash' | 'card' | 'insurance' | 'bank_transfer'
          status: 'pending' | 'completed' | 'failed'
          description: string | null
          transaction_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          appointment_id?: string | null
          patient_id: string
          type: 'payment' | 'refund' | 'insurance_claim'
          amount: number
          payment_method: 'cash' | 'card' | 'insurance' | 'bank_transfer'
          status?: 'pending' | 'completed' | 'failed'
          description?: string | null
          transaction_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string | null
          patient_id?: string
          type?: 'payment' | 'refund' | 'insurance_claim'
          amount?: number
          payment_method?: 'cash' | 'card' | 'insurance' | 'bank_transfer'
          status?: 'pending' | 'completed' | 'failed'
          description?: string | null
          transaction_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}