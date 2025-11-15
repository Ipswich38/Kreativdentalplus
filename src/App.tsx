import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { MainLayout } from "./components/MainLayout";
import type { User } from "./data/users";
import { Toaster } from "sonner@2.0.3";
import { useSupabaseAuth } from "./hooks/useSupabaseAuth";

export default function App() {
  const { currentUser, isLoading, logout } = useSupabaseAuth();

  // Debug logging
  console.log('App render - currentUser:', currentUser);
  console.log('App render - isLoading:', isLoading);

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