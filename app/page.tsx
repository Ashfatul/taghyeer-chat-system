"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, Sparkles, ArrowRight, ShieldCheck, Zap, Users, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-violet-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none" />

      {/* Navbar */}
      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              Taghyeer Chat
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Real-Time Messaging Engine</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/chat"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition active:scale-95 flex items-center gap-1.5"
            >
              <span>Open Chat ({user?.name.split(" ")[0]})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition active:scale-95 flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center my-auto z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Frontend Developer Take-Home Assignment
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-3xl mx-auto leading-[1.1] mb-6">
          Real-Time Conversations. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
            Engineered for Speed.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
          A production-grade, WebSocket-powered chat platform featuring instant passwordless auth,
          multi-user group governance, and intelligent auto-scroll physics.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Try Live Chat Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://frontend-task-chatapp.onrender.com/docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-sm transition"
          >
            View Swagger API Docs ↗
          </a>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <Zap className="w-5 h-5 text-indigo-400 mb-2" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Sub-Millisecond Sync</h2>
            <p className="text-xs text-slate-400 mt-1">Socket.io v4 real-time events with HTTP REST fallback.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <Users className="w-5 h-5 text-violet-400 mb-2" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Group Governance</h2>
            <p className="text-xs text-slate-400 mt-1">Granular admin controls, participant invites, and member management.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <Shield className="w-5 h-5 text-emerald-400 mb-2" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Zero-Friction Auth</h2>
            <p className="text-xs text-slate-400 mt-1">Passwordless phone + name onboarding with auto-registration.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full px-6 py-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 z-10 font-mono">
        <div>Taghyeer Chat System • Built with Next.js 16 (App Router) & React 19</div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-slate-300 transition">Sign In</Link>
          <Link href="/chat" className="hover:text-slate-300 transition">Chat Panel</Link>
        </div>
      </footer>
    </div>
  );
}
