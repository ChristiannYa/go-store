"use client";

import { useTokens } from "@/contexts/TokenContext";

export default function LogoutButton() {
  const { logout } = useTokens();

  return (
    <button
      onClick={logout}
      className="bg-slate-700/25 hover:bg-blue-600/30 text-white rounded-md transition-colors px-2 py-1"
    >
      Logout
    </button>
  );
}
