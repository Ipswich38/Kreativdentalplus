import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { MainLayout } from "./components/MainLayout";
import type { User } from "./data/users";
import { Toaster } from "sonner@2.0.3";
import { useSupabaseAuth } from "./hooks/useSupabaseAuth";

export default function App() {
  const { currentUser, logout } = useSupabaseAuth();

  // Debug logging
  console.log('App render - currentUser:', currentUser);

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