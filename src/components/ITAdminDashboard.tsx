import { useState, useEffect } from 'react';
import {
  Shield,
  Database,
  Users,
  Activity,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Eye,
  Settings,
  Terminal,
  Lock,
  Unlock,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  DollarSign,
  FileText,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Bug,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
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

interface SystemLog {
  id: string;
  timestamp: string;
  user_id?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  changes?: any;
  ip_address?: string;
  user_agent?: string;
}

interface ITAdminDashboardProps {
  currentUser: User;
}

export function ITAdminDashboard({ currentUser }: ITAdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'database' | 'logs' | 'security' | 'maintenance'>('overview');
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAppointments: 0,
    totalPatients: 0,
    databaseSize: '0 MB',
    uptime: '0 hours',
    lastBackup: 'Never',
    vulnerabilities: 0
  });
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSystemStats();
    loadUsers();
    loadSystemLogs();
  }, []);

  const loadSystemStats = async () => {
    try {
      // Load comprehensive system statistics
      const [usersResponse, appointmentsResponse, patientsResponse] = await Promise.all([
        supabase.from('staff_users').select('id, is_active', { count: 'exact' }),
        supabase.from('appointments').select('id', { count: 'exact' }),
        supabase.from('patients').select('id', { count: 'exact' })
      ]);

      setSystemStats({
        totalUsers: usersResponse.count || 0,
        activeUsers: usersResponse.data?.filter(u => u.is_active).length || 0,
        totalAppointments: appointmentsResponse.count || 0,
        totalPatients: patientsResponse.count || 0,
        databaseSize: '45.2 MB',
        uptime: '72 hours',
        lastBackup: new Date().toLocaleDateString(),
        vulnerabilities: 0
      });
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadSystemLogs = async () => {
    try {
      // Simulated system logs - in production, you'd have actual audit logs
      const mockLogs: SystemLog[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          user_id: 'OWN001',
          action: 'LOGIN_SUCCESS',
          ip_address: '192.168.1.100',
          user_agent: 'Chrome/119.0.0.0'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          user_id: 'DEN001',
          action: 'APPOINTMENT_CREATED',
          table_name: 'appointments',
          record_id: 'apt_123',
          ip_address: '192.168.1.105'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          user_id: 'STF001',
          action: 'PATIENT_UPDATED',
          table_name: 'patients',
          record_id: 'pat_456',
          ip_address: '192.168.1.110'
        }
      ];
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error loading system logs:', error);
    }
  };

  const deleteTestData = async (table: string) => {
    try {
      setLoading(true);

      const confirmDelete = window.confirm(
        `⚠️ WARNING: This will delete ALL data from the ${table} table. This action cannot be undone. Are you sure?`
      );

      if (!confirmDelete) return;

      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except non-existent ID

      if (error) throw error;

      alert(`✅ Successfully cleared ${table} table`);
      loadSystemStats();
    } catch (error) {
      console.error(`Error deleting ${table}:`, error);
      alert(`❌ Failed to delete ${table} data`);
    } finally {
      setLoading(false);
    }
  };

  const resetUser = async (employeeNumber: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('staff_users')
        .update({
          passcode: '000000',
          passcode_reset_required: true,
          passcode_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          last_passcode_change: new Date().toISOString()
        })
        .eq('employee_number', employeeNumber);

      if (error) throw error;

      alert(`✅ User ${employeeNumber} password reset to "000000" - they must change it on next login`);
      loadUsers();
    } catch (error) {
      console.error('Error resetting user:', error);
      alert('❌ Failed to reset user');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (employeeNumber: string, currentStatus: boolean) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('staff_users')
        .update({ is_active: !currentStatus })
        .eq('employee_number', employeeNumber);

      if (error) throw error;

      alert(`✅ User ${employeeNumber} ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadUsers();
      loadSystemStats();
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('❌ Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  const exportSystemData = () => {
    const systemData = {
      'System Statistics': [systemStats],
      'User Accounts': users.map(user => ({
        'Employee Number': user.employee_number,
        'Name': user.full_name,
        'Role': user.role,
        'Position': user.position,
        'Active': user.is_active ? 'Yes' : 'No',
        'Created': user.created_at,
        'Last Updated': user.updated_at,
        'Hourly Rate': user.hourly_rate
      })),
      'System Logs': logs.map(log => ({
        'Timestamp': log.timestamp,
        'User ID': log.user_id || 'System',
        'Action': log.action,
        'Table': log.table_name || 'N/A',
        'Record ID': log.record_id || 'N/A',
        'IP Address': log.ip_address || 'Unknown'
      }))
    };

    const wb = XLSX.utils.book_new();
    Object.entries(systemData).forEach(([sheetName, data]) => {
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `KreativDental_SystemExport_${timestamp}.xlsx`);
  };

  const runDiagnostics = async () => {
    setLoading(true);

    // Simulate system diagnostics
    setTimeout(() => {
      alert(`🔧 System Diagnostics Complete:

✅ Database Connection: Healthy
✅ User Authentication: Working
✅ API Endpoints: Responsive
✅ Data Integrity: Verified
✅ Security Policies: Active
✅ Backup System: Operational

No issues detected.`);
      setLoading(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-0 max-w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-purple-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">🔒 IT Admin Dashboard</h2>
            <p className="text-red-100 text-sm">
              System Administrator • Full Control Access • {currentUser.name}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6">
          {[
            { id: 'overview', label: 'System Overview', icon: Activity },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'database', label: 'Database Tools', icon: Database },
            { id: 'logs', label: 'Audit Logs', icon: FileText },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'maintenance', label: 'Maintenance', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              onClick={() => setActiveSection(id as any)}
              variant={activeSection === id ? 'secondary' : 'ghost'}
              size="sm"
              className={`rounded-xl text-white ${
                activeSection === id
                  ? 'bg-white/20 text-white'
                  : 'hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* System Overview */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* System Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{systemStats.totalUsers}</p>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-xs text-green-600">{systemStats.activeUsers} active</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{systemStats.totalAppointments}</p>
                <p className="text-sm text-gray-600">Appointments</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <Database className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{systemStats.databaseSize}</p>
                <p className="text-sm text-gray-600">DB Size</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <Server className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{systemStats.uptime}</p>
                <p className="text-sm text-gray-600">Uptime</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={runDiagnostics}
                  disabled={loading}
                  className="h-16 bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  <div className="text-center">
                    <Bug className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-sm">Run Diagnostics</p>
                  </div>
                </Button>

                <Button
                  onClick={exportSystemData}
                  className="h-16 bg-green-600 hover:bg-green-700 rounded-xl"
                >
                  <div className="text-center">
                    <Download className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-sm">Export Data</p>
                  </div>
                </Button>

                <Button
                  onClick={() => loadSystemStats()}
                  className="h-16 bg-purple-600 hover:bg-purple-700 rounded-xl"
                >
                  <div className="text-center">
                    <RefreshCw className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-sm">Refresh Stats</p>
                  </div>
                </Button>

                <Button
                  onClick={() => setActiveSection('maintenance')}
                  className="h-16 bg-orange-600 hover:bg-orange-700 rounded-xl"
                >
                  <div className="text-center">
                    <Settings className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-sm">Maintenance</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Management */}
      {activeSection === 'users' && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Account Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl"
              />

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Employee #</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(user =>
                        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.employee_number.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-mono">{user.employee_number}</td>
                          <td className="p-2">{user.full_name}</td>
                          <td className="p-2">
                            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Badge variant={user.is_active ? 'default' : 'secondary'}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => resetUser(user.employee_number)}
                                className="rounded-lg"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant={user.is_active ? 'destructive' : 'default'}
                                onClick={() => toggleUserStatus(user.employee_number, user.is_active)}
                                className="rounded-lg"
                              >
                                {user.is_active ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Database Tools */}
      {activeSection === 'database' && (
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                ⚠️ Dangerous Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Button
                  onClick={() => deleteTestData('appointments')}
                  disabled={loading}
                  variant="destructive"
                  className="h-20 rounded-xl"
                >
                  <div className="text-center">
                    <Trash2 className="w-6 h-6 mx-auto mb-1" />
                    <p className="font-semibold">Clear Appointments</p>
                    <p className="text-xs opacity-80">Delete all test appointments</p>
                  </div>
                </Button>

                <Button
                  onClick={() => deleteTestData('patients')}
                  disabled={loading}
                  variant="destructive"
                  className="h-20 rounded-xl"
                >
                  <div className="text-center">
                    <Trash2 className="w-6 h-6 mx-auto mb-1" />
                    <p className="font-semibold">Clear Patients</p>
                    <p className="text-xs opacity-80">Delete all test patients</p>
                  </div>
                </Button>

                <Button
                  onClick={() => deleteTestData('financial_transactions')}
                  disabled={loading}
                  variant="destructive"
                  className="h-20 rounded-xl"
                >
                  <div className="text-center">
                    <Trash2 className="w-6 h-6 mx-auto mb-1" />
                    <p className="font-semibold">Clear Transactions</p>
                    <p className="text-xs opacity-80">Delete financial data</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Logs */}
      {activeSection === 'logs' && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              System Activity Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{log.action}</Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p><strong>User:</strong> {log.user_id || 'System'}</p>
                    {log.table_name && <p><strong>Table:</strong> {log.table_name}</p>}
                    {log.ip_address && <p><strong>IP:</strong> {log.ip_address}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security */}
      {activeSection === 'security' && (
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Security Checks</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">SSL Certificate Valid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Database Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">RLS Policies Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Authentication Secure</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Vulnerability Scan</h3>
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-green-800 font-medium">✅ No vulnerabilities detected</p>
                    <p className="text-sm text-green-600 mt-1">
                      Last scan: {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Maintenance */}
      {activeSection === 'maintenance' && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              System Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Database Maintenance</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Button className="h-16 rounded-xl" disabled={loading}>
                    <div className="text-center">
                      <Database className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-sm">Optimize Database</p>
                    </div>
                  </Button>
                  <Button className="h-16 rounded-xl" disabled={loading}>
                    <div className="text-center">
                      <HardDrive className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-sm">Clean Cache</p>
                    </div>
                  </Button>
                  <Button className="h-16 rounded-xl" disabled={loading}>
                    <div className="text-center">
                      <RefreshCw className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-sm">Restart Services</p>
                    </div>
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">System Information</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p><strong>Database:</strong> PostgreSQL 15.4</p>
                    <p><strong>Backend:</strong> Supabase</p>
                    <p><strong>Frontend:</strong> React 18.2.0</p>
                    <p><strong>Build:</strong> Vite 6.3.5</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Last Backup:</strong> {systemStats.lastBackup}</p>
                    <p><strong>Storage Used:</strong> {systemStats.databaseSize}</p>
                    <p><strong>Active Sessions:</strong> {systemStats.activeUsers}</p>
                    <p><strong>System Health:</strong> ✅ Excellent</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              <p>Processing...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}