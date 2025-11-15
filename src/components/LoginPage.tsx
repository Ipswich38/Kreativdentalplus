import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Smile, Lock, UserCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Alert, AlertDescription } from "./ui/alert";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { authenticateUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Employee ID:', employeeId);
      console.log('Passcode:', passcode);

      const { user, error } = await authenticateUser(employeeId, passcode);

      console.log('=== AUTHENTICATION RESULT ===');
      console.log('User returned:', user);
      console.log('Error returned:', error);

      if (user) {
        // Check if passcode needs to be changed
        if (user.mustChangePasscode) {
          toast.warning("Your passcode has expired. Please change it after logging in.");
        }

        console.log('=== LOGIN SUCCESS ===');
        console.log('About to show success toast');
        toast.success(`Welcome back, ${user.name}!`);

        console.log('=== LOGIN COMPLETED ===');
        console.log('Authentication successful, App should now show MainLayout');

        // User is automatically set in useSupabaseAuth hook
      } else {
        setError(error || "Invalid Employee ID or Passcode");
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      console.log('=== LOGIN ERROR ===', err);
      setError(err.message || "Login failed");
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
            <Smile className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">kreativDental Plus</h1>
          <p className="text-gray-600">Modern Practice Management & Payroll</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center">Employee Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="e.g. ADM-001"
                    value={employeeId}
                    onChange={(e) => {
                      setEmployeeId(e.target.value.toUpperCase());
                      setError("");
                    }}
                    className="pl-10 text-base md:text-sm touch-feedback"
                    style={{ fontSize: '16px' }}
                    required
                    autoComplete="off"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passcode">6-Digit Passcode</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="passcode"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="••••••"
                    value={passcode}
                    onChange={(e) => {
                      // Only allow digits and max 6 characters
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setPasscode(value);
                      setError("");
                    }}
                    className="pl-10 text-base md:text-sm touch-feedback"
                    style={{ fontSize: '16px' }}
                    maxLength={6}
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Temporary passcodes must be changed after 30 days
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 touch-feedback min-h-[48px] text-base font-medium"
                disabled={isLoading || employeeId.length === 0 || passcode.length !== 6}
                style={{ fontSize: '16px' }}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Forgot your credentials?{" "}
          <button 
            className="text-blue-600 hover:text-blue-700 transition-colors"
            onClick={() => toast.info("Please contact your system administrator")}
          >
            Contact Admin
          </button>
        </p>
      </div>
    </div>
  );
}