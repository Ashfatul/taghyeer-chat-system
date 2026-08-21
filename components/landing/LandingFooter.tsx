"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, ExternalLink, Sparkles } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-800 bg-[#0B0F19] text-slate-400 py-12 relative overflow-hidden select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">
                Taghyeer Chat System
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              A modern real-time messaging application engineered with Next.js 16, React 19,
              Socket.io v4, and Tailwind CSS v4 for the Frontend Developer assignment.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Deployment on Vercel / Render</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Quick Links
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/chat" className="hover:text-white transition">
                  Live Chat Panel
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Passwordless Login
                </Link>
              </li>
              <li>
                <a href="#simulator" className="hover:text-white transition">
                  Interactive Sandbox
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition">
                  Bento Features
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Technical Deliverables */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Deliverables
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="https://frontend-task-chatapp.onrender.com/docs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1"
                >
                  <span>API Documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-white transition">
                  Architecture & WebSocket Spec
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition">
                  Design System Blueprint
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 font-mono">
          <div>© 2026 Taghyeer Chat System. Frontend Take-Home Project.</div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Engineered with precision and speed</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}
