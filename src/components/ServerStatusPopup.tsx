"use client";

import { useServerStatus } from "@/contexts/ServerStatusContext";

export default function ServerStatusPopup() {
  const { isServerOnline, isCheckingServer, checkServerStatus } =
    useServerStatus();

  if (isServerOnline) {
    return null;
  }

  return (
    <div className="bg-black bg-opacity-50 font-mono inset-0 flex items-center justify-center fixed z-50">
      <div className="bg-gray-800 rounded-lg p-5 max-w-md mx-4">
        <div className="mb-4 flex items-center gap-x-2">
          <div className="w-3.5 h-3.5 bg-red-500 rounded-full"></div>
          <h3 className="font-[600] text-white text-lg">Server Offline</h3>
        </div>
        <p className="text-gray-300 mb-6">
          The server is currently unavailable. Please check your connection or
          try again later.
        </p>
        <button
          onClick={checkServerStatus}
          disabled={isCheckingServer}
          className={`px-3 py-2 rounded-md text-white ${
            isCheckingServer
              ? "bg-gray-400/20 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isCheckingServer ? "Checking..." : "Retry Connection"}
        </button>
      </div>
    </div>
  );
}
