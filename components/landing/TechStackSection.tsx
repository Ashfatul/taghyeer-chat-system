"use client";

import React from "react";
import { Cpu, CheckCircle2, Award, Zap, Code, Shield } from "lucide-react";

const TECH_ITEMS = [
  { name: "Next.js 16", role: "App Router & Turbopack", color: "from-white to-slate-400" },
  { name: "React 19", role: "UI Primitives & Hooks", color: "from-sky-400 to-blue-500" },
  { name: "Tailwind CSS v4", role: "Dynamic Design System", color: "from-cyan-400 to-teal-500" },
  { name: "TanStack Query v5", role: "Async Server State & Cache", color: "from-red-400 to-rose-500" },
  { name: "Socket.io Client v4", role: "Real-Time WebSocket Gateway", color: "from-indigo-400 to-violet-500" },
  { name: "TypeScript 5", role: "Strict End-to-End Typing", color: "from-blue-400 to-indigo-500" },
  { name: "Zod & Hook Form", role: "Schema-Driven Validation", color: "from-amber-400 to-orange-500" },
  { name: "Framer Motion", role: "Physics Micro-Interactions", color: "from-fuchsia-400 to-pink-500" },
];

export default function TechStackSection() {
  return (
    <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 relative">
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Cpu className="w-3.5 h-3.5" />
              Modern Architecture
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Production-Grade Tech Stack
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Built with the latest 2026 frontend tooling for maximum reliability and speed.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Production Ready
              </div>
              <div className="text-[10px] text-slate-500 font-mono">0 TypeScript Warnings</div>
            </div>
          </div>
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TECH_ITEMS.map((tech) => (
            <div
              key={tech.name}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 transition group"
            >
              <div className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition">
                {tech.name}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{tech.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
