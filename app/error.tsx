"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-14 h-14 rounded-3xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 mb-4 shadow-xl shadow-rose-500/10">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
        {error?.message || "An unexpected error occurred while loading this view."}
      </p>
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-indigo-500/20 active:scale-95"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
