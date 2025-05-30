"use client";

import { useAuth } from "@/contexts/AuthContext";

interface AuthInitializerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <>
        <div className="page">
          <div className="w-6 h-6 border-[3px] border-t-transparent border-slate-400 rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
