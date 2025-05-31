interface ServerOfflinePageProps {
  onRetry: () => void;
  isCheckingServer: boolean;
}

export function ServerOfflinePage({
  onRetry,
  isCheckingServer,
}: ServerOfflinePageProps) {
  return (
    <div className="bg-black font-mono inset-0 flex items-center justify-center fixed z-50">
      <div className="bg-gray-800 rounded-lg w-[420px] p-4 mx-4">
        <div className="mb-2 flex justify-center items-center gap-x-2">
          <div className="w-3 h-3 bg-red-600 rounded-full"></div>
          <h3 className="font-[600] text-white text-lg">Server Offline</h3>
        </div>
        <p className="text-gray-300 text-center mb-4">
          The server is currently unavailable. Please check your connection or
          try again later.
        </p>
        <div className="flex justify-center">
          {isCheckingServer ? (
            <div className="w-8 h-8 border-[3px] border-slate-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <button
              onClick={onRetry}
              disabled={isCheckingServer}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer px-3 py-2"
            >
              Retry Connection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
