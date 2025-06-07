"use client";

import { useUserData } from "@/hooks/useUserData";

export default function UserInfo() {
  const { user, isLoading, error } = useUserData();

  if (isLoading) {
    return <div className="text-amber-500">Loading user data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error while fetching user data</div>;
  }

  if (!user) {
    return <div className="text-blue-500">No user data found</div>;
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
          <p className="opacity-80">
            {user.email_verified ? (
              <span>Verified</span>
            ) : (
              <span>Not verified</span>
            )}
          </p>
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
