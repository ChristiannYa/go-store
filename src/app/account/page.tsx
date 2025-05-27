"use client";

import HomeButton from "@/app/components/HomeButton";
import { useAuth } from "@/hooks/useAuth";

export default function Page() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page">Loading...</div>;
  }

  return (
    <div className="page">
      <div>
        <h2 className="text-2xl">Welcome</h2>
        <p>Name: {user?.name}</p>
        <p>Last Name: {user?.last_name}</p>
        <p>Email: {user?.email}</p>
        <p>Account created: {user?.created_at}</p>
        <HomeButton />
      </div>
    </div>
  );
}
