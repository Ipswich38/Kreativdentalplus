import { useEffect } from "react";
import { LoginPage } from "./components/LoginPage";
import { MainLayout } from "./components/MainLayout";
import { Toaster } from "sonner@2.0.3";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function AppContent() {
  const { currentUser, isLoading, logout } = useAuth();

  // Debug logging
  console.log('App render - currentUser:', currentUser);
  console.log('App render - isLoading:', isLoading);

  // Track currentUser changes with useEffect
  useEffect(() => {
    console.log('=== APP COMPONENT - CURRENT USER EFFECT ===');
    console.log('currentUser changed in App component:', currentUser);
    console.log('Should show MainLayout?', !!currentUser);
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      {!currentUser ? (
        <LoginPage />
      ) : (
        <MainLayout currentUser={currentUser} onLogout={logout} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}