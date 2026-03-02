"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-center px-4">
      <div>
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 inline-flex mb-6">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
        <p className="text-zinc-400 mb-8 max-w-md">
          {error.message ?? "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
