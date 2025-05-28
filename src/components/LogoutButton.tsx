"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();

    // Full page reload
    window.location.href = "/";
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-slate-700/25 hover:bg-blue-600/30 text-white rounded-md transition-colors px-2 py-1"
    >
      Logout
    </button>
  );
}
