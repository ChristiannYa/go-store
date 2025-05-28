"use client";

import HomeButton from "@/components/HomeButton";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import UserInfo from "./UserInfo";

export default function Page() {
  return (
    <ProtectedRoute>
      <div className="page">
        <div className="flex flex-col justify-center items-center">
          <UserInfo />
          <div className="space-y-2.5">
            <HomeButton />
            <LogoutButton />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
