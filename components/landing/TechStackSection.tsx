"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
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

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 140,
    },
  },
};

export default function TechStackSection() {
  return (
    <section className="py-6 sm:py-10 max-w-6xl mx-auto px-4 sm:px-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ type: "spring", damping: 24, stiffness: 120 }}
        className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
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

        {/* Tech Grid with Staggered Framer Motion Animation */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          transition={{ staggerChildren: 0.08 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {TECH_ITEMS.map((tech) => (
            <motion.div
              key={tech.name}
              variants={ITEM_VARIANTS}
              whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.15 } }}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 transition group cursor-default shadow-sm"
            >
              <div className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition">
                {tech.name}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{tech.role}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
