import { useState } from "react";
import { Eye, EyeOff, User, Lock, Heart } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { authenticateUser, error } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeId.trim() || !passcode.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      await authenticateUser(employeeId.trim(), passcode.trim());
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        {/* Header with Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 24px',
            background: '#22c55e',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <Heart style={{ width: '24px', height: '24px', color: 'white' }} />
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '12px'
          }}>
            DentalPro
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280'
          }}>
            Welcome back! Please sign in to continue
          </p>
        </div>

        {/* Login Form */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          marginBottom: '24px'
        }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Employee ID Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#1f2937'
              }}>
                Employee ID
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <User style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                </div>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
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
                  placeholder="Enter your Employee ID"
                  disabled={isLoading}
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
            </div>

            {/* Passcode Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#1f2937'
              }}>
                Passcode
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <Lock style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                </div>
                <input
                  type={showPasscode ? "text" : "password"}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 44px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    background: '#f9fafb',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  placeholder="Enter your Passcode"
                  disabled={isLoading}
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
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  disabled={isLoading}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'none';
                  }}
                >
                  {showPasscode ? (
                    <EyeOff style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                  ) : (
                    <Eye style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <p style={{ color: '#dc2626', fontSize: '14px', fontWeight: '500' }}>{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !employeeId.trim() || !passcode.trim()}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: isLoading || !employeeId.trim() || !passcode.trim() ? '#9ca3af' : '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isLoading || !employeeId.trim() || !passcode.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && employeeId.trim() && passcode.trim()) {
                  e.target.style.background = '#166534';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && employeeId.trim() && passcode.trim()) {
                  e.target.style.background = '#22c55e';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <p style={{ fontSize: '12px', color: '#6b7280' }}>
            🔒 Secure access to your dental practice management system
          </p>
        </div>

        {/* Demo Credentials Info */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            Demo Access Credentials
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px'
          }}>
            {/* Admin */}
            <div style={{
              background: '#22c55e',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px'
              }}>
                <User style={{ width: '16px', height: '16px' }} />
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Admin</div>
              <div style={{ fontSize: '11px', opacity: '0.9', marginBottom: '2px' }}>ID: ADM-001</div>
              <div style={{ fontSize: '11px', opacity: '0.7' }}>Code: 100001</div>
            </div>

            {/* Dentist */}
            <div style={{
              background: '#3b82f6',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px'
              }}>
                <Heart style={{ width: '16px', height: '16px' }} />
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Dentist</div>
              <div style={{ fontSize: '11px', opacity: '0.9', marginBottom: '2px' }}>ID: DEN-001</div>
              <div style={{ fontSize: '11px', opacity: '0.7' }}>Code: 200001</div>
            </div>

            {/* Staff */}
            <div style={{
              background: '#f97316',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px'
              }}>
                <User style={{ width: '16px', height: '16px' }} />
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Staff</div>
              <div style={{ fontSize: '11px', opacity: '0.9', marginBottom: '2px' }}>ID: STF-001</div>
              <div style={{ fontSize: '11px', opacity: '0.7' }}>Code: 300001</div>
            </div>
          </div>
        </div>

        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
}