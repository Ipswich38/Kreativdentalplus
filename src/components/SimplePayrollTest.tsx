import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { User } from "../data/users";

interface SimplePayrollTestProps {
  currentUser: User;
}

export function SimplePayrollTest({ currentUser }: SimplePayrollTestProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('SimplePayrollTest mounted with user:', currentUser);
    setMounted(true);
  }, [currentUser]);

  if (!mounted) {
    return <div>Loading payroll test...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Payroll System Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>✅ Component is rendering successfully!</p>
            <p><strong>User:</strong> {currentUser.name}</p>
            <p><strong>Role:</strong> {currentUser.role}</p>
            <p><strong>Employee ID:</strong> {currentUser.employeeId}</p>
            <p className="text-green-600">If you can see this, the component structure is working.</p>
            <p className="text-blue-600">The original PayrollPage might have a specific error we need to identify.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}