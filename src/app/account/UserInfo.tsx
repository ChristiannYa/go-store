"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function UserInfo() {
  const { user } = useAuth();

  if (!user) {
    return <div className="text-red-500">Failed to load user data</div>;
  }

  return (
    <div className="bg-gray-600/25 rounded-[3px] p-3 w-[400px]">
      <h3 className="text-lg font-[600] leading-none">Profile Information</h3>
      <hr className="bg-gray-700/40 border-0 rounded-xs h-[1px] my-2" />
      <div className="space-y-3">
        <div className="border-l leading-tight space-y-1 pl-2">
          <label className="font-[500]">Full Name</label>
          <p className="capitalize opacity-85">
            {user.name} {user.last_name}
          </p>
        </div>
        <div className="border-l leading-tight space-y-1 pl-2">
          <label className="font-[500]">Email</label>
          <p className="opacity-85">{user.email}</p>
        </div>
        <div className="border-l leading-tight space-y-1 pl-2">
          <label className="font-[500]">Member Since</label>
          <p className="opacity-85">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
