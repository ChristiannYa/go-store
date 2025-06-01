"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ServerStatusContextType } from "@/app/definitions";
import { ServerOfflinePage } from "@/components/ServerOfflinePage";
import { ServerCheckingPage } from "@/components/ServerCheckingPage";

const ServerStatusContext = createContext<ServerStatusContextType | undefined>(
  undefined
);

export const useServerStatus = () => {
  const context = useContext(ServerStatusContext);
  if (!context) {
    throw new Error(
      "useServerStatus must be used within a ServerStatusProvider"
    );
  }
  return context;
};

export const ServerStatusProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [isCheckingServer, setIsCheckingServer] = useState(false);
  const [isServerCheckDone, setIsServerCheckDone] = useState(false);

  const checkServerStatus = async () => {
    setIsCheckingServer(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/health`,
        {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        }
      );
      setIsServerOnline(response.ok);
    } catch (error) {
      if (error instanceof Error) {
        setIsServerOnline(false);
      }
    } finally {
      setIsCheckingServer(false);
      setIsServerCheckDone(true);
    }
  };

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    if (!isServerCheckDone) {
      return <ServerCheckingPage />;
    }

    if (!isServerOnline) {
      return (
        <ServerOfflinePage
          onRetry={checkServerStatus}
          isCheckingServer={isCheckingServer}
        />
      );
    }

    return children;
  };

  return (
    <ServerStatusContext.Provider
      value={{
        isServerOnline,
        isCheckingServer,
        isServerCheckDone,
        checkServerStatus,
      }}
    >
      {renderContent()}
    </ServerStatusContext.Provider>
  );
};
