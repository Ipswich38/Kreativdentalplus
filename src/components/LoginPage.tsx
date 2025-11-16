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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            KreativDental+
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back! Please sign in to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="card-bento mb-6">
          <form onSubmit={handleLogin} className="space-y-6">
              {/* Employee ID Input */}
              <div className="space-y-2">
                <label className="label-bento">Employee ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="input-bento pl-12"
                    placeholder="Enter your Employee ID"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Passcode Input */}
              <div className="space-y-2">
                <label className="label-bento">Passcode</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPasscode ? "text" : "password"}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="input-bento pl-12 pr-12"
                    placeholder="Enter your Passcode"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors duration-200"
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
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading || !employeeId.trim() || !passcode.trim()}
                className="w-full btn-bento btn-bento-primary btn-bento-large disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner-bento"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
        </div>

        {/* Security Notice */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">
            🔒 Secure access to your dental practice management system
          </p>
        </div>

        {/* Demo Credentials Info */}
        <div className="card-bento">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Demo Access</h3>
          <div className="bento-grid bento-grid-3 gap-4">
            <div className="bento-card bento-card-blue">
              <div className="bento-card-header">
                <div className="bento-card-icon">
                  <User className="w-4 h-4" />
                </div>
              </div>
              <div className="bento-card-value text-lg">Admin</div>
              <div className="bento-card-label">ID: ADM-001</div>
              <div className="bento-card-meta">Code: 100001</div>
            </div>

            <div className="bento-card bento-card-pink">
              <div className="bento-card-header">
                <div className="bento-card-icon">
                  <Heart className="w-4 h-4" />
                </div>
              </div>
              <div className="bento-card-value text-lg">Dentist</div>
              <div className="bento-card-label">ID: DEN-001</div>
              <div className="bento-card-meta">Code: 200001</div>
            </div>

            <div className="bento-card bento-card-orange">
              <div className="bento-card-header">
                <div className="bento-card-icon">
                  <User className="w-4 h-4" />
                </div>
              </div>
              <div className="bento-card-value text-lg">Staff</div>
              <div className="bento-card-label">ID: STF-001</div>
              <div className="bento-card-meta">Code: 300001</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}