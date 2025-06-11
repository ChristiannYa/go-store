"use client";

import { useTokens } from "@/contexts/TokenContext";
import HomeButton from "@/components/HomeButton";
import LogoutButton from "@/components/LogoutButton";
import UserInfo from "./UserInfo";

export default function Page() {
  const { isLoggingOut } = useTokens();

  if (isLoggingOut) {
    return (
      <div className="page">
        <p className="text-center mb-2">Logging Out...</p>
        <div className="w-8 h-8 border-[3px] border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mt-6"></div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="flex flex-col justify-center items-center">
        <UserInfo />
        <div className="space-y-2.5">
          <HomeButton />
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
