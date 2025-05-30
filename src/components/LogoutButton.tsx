"use client";

import { useAuthActions } from "@/hooks/useAuthActions";

export default function LogoutButton() {
  const { logout } = useAuthActions();

  return (
    <button
      onClick={logout}
      className="bg-slate-700/25 hover:bg-blue-600/30 text-white rounded-md transition-colors px-2 py-1"
    >
      Logout
    </button>
  );
}
