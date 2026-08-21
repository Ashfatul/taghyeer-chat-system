"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User as UserIcon, Shield, Radio, Sparkles } from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils/colors";

export default function ChatPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-mono">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow">
            TC
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Taghyeer Chat Shell
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                <Radio className="w-2.5 h-2.5 animate-pulse" /> Live Socket
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Phase 1 Auth Guard & Session Verified</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-white">{user.name}</div>
            <div className="text-[10px] text-slate-400 font-mono">{formatPhoneNumber(user.phone)}</div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium transition active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center">
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Shield className="w-3.5 h-3.5" />
            Phase 1 Completed & Verified
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Your JWT session has been successfully restored from localStorage and verified via{" "}
            <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono text-xs">
              GET /api/auth/me
            </code>
            . The Socket.io connection is active.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-indigo-400" /> Authenticated User
              </div>
              <div className="text-sm font-bold text-white mt-1">{user.name}</div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{user.phone}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">ID: {user._id}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Active Session Token
              </div>
              <div className="text-xs font-mono text-emerald-400 mt-1 break-all bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                {token ? `${token.slice(0, 36)}...` : "No token"}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
            <strong>Ready for Phase 2:</strong> Left Sidebar, Conversation Management, User Search & Group Modals.
          </div>
        </div>
      </main>
    </div>
  );
}
