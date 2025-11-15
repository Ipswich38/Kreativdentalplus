import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../data/users';

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

interface SessionData {
  user: User;
  loginTime: number;
  lastActivity: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'kreativdental-session';
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug logging for currentUser changes
  console.log('AuthProvider - currentUser state:', currentUser);

  // Save session to localStorage
  const saveSession = (user: User) => {
    const sessionData: SessionData = {
      user,
      loginTime: Date.now(),
      lastActivity: Date.now()
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  };

  // Load session from localStorage
  const loadSession = (): User | null => {
    try {
      const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!sessionStr) return null;

      const sessionData: SessionData = JSON.parse(sessionStr);
      const now = Date.now();

      // Check if session has expired (10 minutes of inactivity)
      if (now - sessionData.lastActivity > SESSION_TIMEOUT) {
        console.log('Session expired due to inactivity');
        clearSession();
        return null;
      }

      // Update last activity
      sessionData.lastActivity = now;
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));

      return sessionData.user;
    } catch (error) {
      console.error('Error loading session:', error);
      clearSession();
      return null;
    }
  };

  // Clear session from localStorage
  const clearSession = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  // Update session activity
  const updateActivity = () => {
    const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionStr) {
      try {
        const sessionData: SessionData = JSON.parse(sessionStr);
        sessionData.lastActivity = Date.now();
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      } catch (error) {
        console.error('Error updating activity:', error);
      }
    }
  };

  // Initialize - check for existing session
  useEffect(() => {
    console.log('=== AUTH CONTEXT INITIALIZATION ===');
    const savedUser = loadSession();
    if (savedUser) {
      console.log('Found existing session:', savedUser);
      setCurrentUser(savedUser);
    }
    setIsLoading(false);

    // Set up activity tracking
    const trackActivity = () => {
      if (currentUser) {
        updateActivity();
      }
    };

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });

    // Check session validity every minute
    const sessionCheckInterval = setInterval(() => {
      const user = loadSession();
      if (!user && currentUser) {
        console.log('Session expired, logging out');
        setCurrentUser(null);
        setError('Session expired due to inactivity. Please log in again.');
      }
    }, 60000); // Check every minute

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity);
      });
      clearInterval(sessionCheckInterval);
    };
  }, [currentUser]);

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
      saveSession(user);
      console.log('Current user set in context and session saved');

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
    clearSession();
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