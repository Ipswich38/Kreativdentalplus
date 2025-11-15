import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@/data/users';

interface StaffUser {
  id: string;
  employee_number: string;
  full_name: string;
  email: string;
  passcode: string;
  role: 'admin' | 'dentist' | 'staff' | 'receptionist' | 'front_desk';
  position: string;
  specialization?: string;
  is_dentist: boolean;
  is_owner: boolean;
  is_admin: boolean;
  permissions: any;
  salary?: number;
  commission_rates?: any;
  is_active: boolean;
  passcode_expires_at?: string;
  can_change_passcode: boolean;
  passcode_reset_required: boolean;
  last_passcode_change?: string;
}

export function useSupabaseAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug logging for currentUser changes
  console.log('useSupabaseAuth - currentUser state changed:', currentUser);

  // Initialize hook - set loading to false since we don't have persistent sessions
  useEffect(() => {
    console.log('=== HOOK INITIALIZATION ===');
    setIsLoading(false);
  }, []);

  // Log whenever currentUser changes
  useEffect(() => {
    console.log('=== CURRENT USER EFFECT ===');
    console.log('currentUser changed to:', currentUser);
  }, [currentUser]);

  // Convert StaffUser to User format for compatibility
  const convertToUser = (staffUser: StaffUser): User => ({
    employeeId: staffUser.employee_number,
    name: staffUser.full_name,
    role: staffUser.role,
    passcode: '', // Don't expose passcode
    position: staffUser.position,
    email: staffUser.email,
    mustChangePasscode: staffUser.passcode_reset_required,
    passcodeSetDate: staffUser.last_passcode_change || new Date().toISOString(),
    profileImage: undefined
  });

  // Authenticate user with employee ID and passcode
  const authenticateUser = async (employeeId: string, passcode: string): Promise<{ user: User | null; error: string | null }> => {
    console.log('=== AUTHENTICATE USER START ===');
    console.log('Setting loading to true');
    setIsLoading(true);
    setError(null);

    try {
      console.log('=== QUERYING SUPABASE ===');
      console.log('Employee ID:', employeeId);
      console.log('Passcode:', passcode);

      const { data, error } = await supabase
        .from('staff_users')
        .select('*')
        .eq('employee_number', employeeId)
        .eq('passcode', passcode)
        .eq('is_active', true)
        .single();

      console.log('=== SUPABASE RESPONSE ===');
      console.log('Data:', data);
      console.log('Error:', error);

      if (error) {
        if (error.code === 'PGRST116') {
          return { user: null, error: 'Invalid Employee ID or Passcode' };
        }
        return { user: null, error: error.message };
      }

      // Check if passcode is expired
      if (data.passcode_expires_at) {
        const expiryDate = new Date(data.passcode_expires_at);
        if (expiryDate < new Date()) {
          return { user: null, error: 'Passcode has expired. Please contact admin.' };
        }
      }

      console.log('=== CONVERTING USER ===');
      const user = convertToUser(data);
      console.log('Converted user:', user);

      console.log('=== SETTING CURRENT USER ===');
      setCurrentUser(user);
      console.log('Current user set, state should update');

      // Update last login
      await supabase
        .from('staff_users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', data.id);

      console.log('=== AUTHENTICATION SUCCESS ===');
      return { user, error: null };
    } catch (err: any) {
      console.log('=== AUTHENTICATION ERROR ===', err);
      const errorMessage = err.message || 'Authentication failed';
      setError(errorMessage);
      return { user: null, error: errorMessage };
    } finally {
      console.log('=== SETTING LOADING FALSE ===');
      setIsLoading(false);
    }
  };

  // Change passcode
  const changePasscode = async (oldPasscode: string, newPasscode: string): Promise<{ success: boolean; error: string | null }> => {
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      // Validate new passcode
      if (!/^\d{6}$/.test(newPasscode)) {
        return { success: false, error: 'Passcode must be exactly 6 digits' };
      }

      // Check for sequential or repeated digits
      if (/012345|123456|234567|345678|456789|567890/.test(newPasscode) || /(\d)\1{5}/.test(newPasscode)) {
        return { success: false, error: 'Passcode cannot be sequential or all same digits' };
      }

      // Update passcode
      const { error } = await supabase
        .from('staff_users')
        .update({
          passcode: newPasscode,
          last_passcode_change: new Date().toISOString(),
          passcode_reset_required: false,
          passcode_expires_at: null, // Remove expiry after change
          updated_at: new Date().toISOString()
        })
        .eq('employee_number', currentUser.employeeId)
        .eq('passcode', oldPasscode);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update current user state
      setCurrentUser(prev => prev ? { ...prev, mustChangePasscode: false } : null);

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to change passcode' };
    }
  };

  // Get staff user details
  const getStaffUserDetails = async (employeeId: string): Promise<StaffUser | null> => {
    try {
      const { data, error } = await supabase
        .from('staff_users')
        .select('*')
        .eq('employee_number', employeeId)
        .single();

      if (error || !data) return null;
      return data;
    } catch {
      return null;
    }
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    setError(null);
  };

  return {
    currentUser,
    isLoading,
    error,
    authenticateUser,
    changePasscode,
    getStaffUserDetails,
    logout
  };
}