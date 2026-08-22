"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-xl shadow-indigo-500/10">
        <MessageSquare className="w-8 h-8" />
      </div>
      <div className="text-4xl font-extrabold text-white tracking-tight mb-2">404</div>
      <h2 className="text-xl font-bold text-slate-200 mb-2">Conversation Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
        The page or conversation route you requested does not exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <Link
          href="/chat"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Open Chat Hub</span>
        </Link>
      </div>
    </div>
  );
}
