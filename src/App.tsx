import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { MainLayout } from "./components/MainLayout";
import type { User } from "./data/users";
import { Toaster } from "sonner@2.0.3";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      {!isLoggedIn || !currentUser ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <MainLayout currentUser={currentUser} onLogout={handleLogout} />
      )}
    </>
  );
}