import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  authenticateUser: (employeeId: string, passcode: string) => Promise<{ user: User | null; error: string | null }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug logging for currentUser changes
  console.log('AuthProvider - currentUser state:', currentUser);

  // Initialize - set loading to false since we don't have persistent sessions
  useEffect(() => {
    console.log('=== AUTH CONTEXT INITIALIZATION ===');
    setIsLoading(false);
  }, []);

  // Log whenever currentUser changes
  useEffect(() => {
    console.log('=== AUTH CONTEXT - CURRENT USER EFFECT ===');
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
    console.log('=== AUTH CONTEXT - AUTHENTICATE USER START ===');
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

      console.log('=== SETTING CURRENT USER IN CONTEXT ===');
      setCurrentUser(user);
      console.log('Current user set in context, state should update everywhere');

      // Update last login
      await supabase
        .from('staff_users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', data.id);

      console.log('=== AUTHENTICATION SUCCESS IN CONTEXT ===');
      return { user, error: null };
    } catch (err: any) {
      console.log('=== AUTHENTICATION ERROR ===', err);
      const errorMessage = err.message || 'Authentication failed';
      setError(errorMessage);
      return { user: null, error: errorMessage };
    } finally {
      console.log('=== SETTING LOADING FALSE IN CONTEXT ===');
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    console.log('=== LOGOUT IN CONTEXT ===');
    setCurrentUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    currentUser,
    isLoading,
    error,
    authenticateUser,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}