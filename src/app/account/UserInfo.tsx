"use client";

import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useTokens } from "@/contexts/TokenContext";

export default function UserInfo() {
  const { user, userIsLoading, userError } = useUser();
  const { isLoggingOut } = useTokens();

  if (isLoggingOut) {
    return <div className="text-purple-600">Logging out...</div>;
  }

  if (userIsLoading) {
    return <div className="text-blue-500">Loading user data...</div>;
  }

  if (userError) {
    return <div className="text-red-500">{userError}</div>;
  }

  if (!user) {
    return <div className="text-amber-500">No user data found</div>;
  }

  return (
    <div className="bg-gray-600/25 rounded-[3px] p-3 w-[400px]">
      <h3 className="text-lg font-[600] leading-none">Profile Information</h3>
      <hr className="bg-gray-700/40 border-0 rounded-xs h-[1px] my-2" />
      <div className="space-y-3">
        <div className="border-l leading-tight space-y-1 pl-2">
          <label className="font-[500]">Full Name</label>
          <p className="capitalize opacity-80">
            {user.name} {user.last_name}
          </p>
        </div>
        <div className="border-l leading-tight space-y-1 pl-2">
          <label className="font-[500]">Email</label>
          <p className="opacity-80">{user.email}</p>
        </div>
        <div className="border-l leading-tight space-y-1 pl-2">
          <label className="font-[500]">Email verified</label>
          <div>
            {user.email_verified ? (
              <p>✔️</p>
            ) : (
              <div>
                <Link href="/account/verify-email">
                  <p className="text-blue-500/80 hover:underline inline-block">
                    Not verified
                  </p>
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="border-l leading-tight space-y-1 pl-2">
          <label className="font-[500]">Member Since</label>
          <p className="opacity-80">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
