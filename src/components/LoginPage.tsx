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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="mobile-layout">
        {/* Header with Logo */}
        <div className="page-header text-center border-0 bg-transparent">
          <div className="w-full">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-pink-400 rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              KreativDental+
            </h1>
            <p className="text-gray-600">
              Welcome back! Please sign in to continue
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="page-content">
          <div className="card-modern p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Employee ID Input */}
              <div className="form-group">
                <label className="form-label">Employee ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="input-modern pl-10"
                    placeholder="Enter your Employee ID"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Passcode Input */}
              <div className="form-group">
                <label className="form-label">Passcode</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPasscode ? "text" : "password"}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="input-modern pl-10 pr-10"
                    placeholder="Enter your Passcode"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showPasscode ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading || !employeeId.trim() || !passcode.trim()}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner w-4 h-4"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Secure access to your dental practice management system
            </p>
          </div>

          {/* Demo Credentials Info */}
          <div className="mt-8 card-modern p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Demo Access</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <span className="font-medium text-blue-900">Admin</span>
                <div className="text-blue-700">
                  <div>ID: ADM-001</div>
                  <div>Code: 100001</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-pink-50 rounded-xl">
                <span className="font-medium text-pink-900">Dentist</span>
                <div className="text-pink-700">
                  <div>ID: DEN-001</div>
                  <div>Code: 200001</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl">
                <span className="font-medium text-yellow-900">Staff</span>
                <div className="text-yellow-700">
                  <div>ID: STF-001</div>
                  <div>Code: 300001</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}