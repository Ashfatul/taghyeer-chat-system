"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { Zap, Users, ArrowDownCircle, ShieldCheck, Cpu, Flame, Layers, Lock } from "lucide-react";

const CARD_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 22,
      stiffness: 120,
    },
  },
};

export default function FeatureSection() {
  return (
    <section id="features" className="py-6 sm:py-10 max-w-6xl mx-auto px-4 sm:px-6 relative">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ type: "spring", damping: 24, stiffness: 130 }}
        className="text-center max-w-2xl mx-auto mb-8 sm:mb-10"
      >
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2.5">
          <Flame className="w-3.5 h-3.5 text-indigo-400" />
          Engineering Excellence
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Engineered for Performance. <br />
          <span className="bg-gradient-to-r from-indigo-400 to-violet-300 bg-clip-text text-transparent">
            Designed for Human Focus.
          </span>
        </h2>
        <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
          Every layer of the Taghyeer Chat System is crafted with high-speed protocols, resilient caching, and ergonomic viewport physics.
        </p>
      </motion.div>

      {/* Bento Grid Layout with Staggered Scroll Reveal */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
      >
        {/* Bento Card 1: Real-Time WebSockets (Spans 2 cols) */}
        <motion.div
          variants={CARD_VARIANTS}
          whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.2 } }}
          className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl shadow-xl relative overflow-hidden group hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition duration-200"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-600/20 transition-colors" />
          
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 mb-5 shadow-lg shadow-indigo-500/10">
            <Zap className="w-6 h-6" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
            Low-Latency Transport
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1 mb-2.5">
            Sub-Millisecond Real-Time WebSocket Pipeline
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
            Bidirectional message streaming over Socket.io v4 with instant optimistic local rendering. Outgoing messages appear with zero perceivable delay, seamlessly promoting from <code className="text-indigo-300 font-mono bg-indigo-500/10 px-1 rounded">sending</code> to <code className="text-emerald-300 font-mono bg-emerald-500/10 px-1 rounded">delivered</code> upon server confirmation.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              ⚡ Socket.io v4
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              🔄 TanStack Query v5 Sync
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              🛡️ REST Fallback Delivery
            </span>
          </div>
        </motion.div>

        {/* Bento Card 2: Passwordless Auth (1 col) */}
        <motion.div
          variants={CARD_VARIANTS}
          whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.2 } }}
          className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl shadow-xl relative overflow-hidden group hover:border-violet-500/50 hover:shadow-violet-500/10 transition duration-200 flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-600/20 transition-colors" />

          <div>
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400 mb-5 shadow-lg shadow-violet-500/10">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400 font-mono">
              Zero Friction
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1 mb-2.5">
              Passwordless Auto-Registration
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Log in with just a phone number and display name. If the number is new, a secure profile and JWT are provisioned automatically without separate signup forms.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-violet-300">
            ✓ 100% Passwordless Entry
          </div>
        </motion.div>

        {/* Bento Card 3: Group Collaboration & Governance (1 col) */}
        <motion.div
          variants={CARD_VARIANTS}
          whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.2 } }}
          className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl shadow-xl relative overflow-hidden group hover:border-emerald-500/50 hover:shadow-emerald-500/10 transition duration-200 flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-600/20 transition-colors" />

          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-5 shadow-lg shadow-emerald-500/10">
              <Users className="w-6 h-6" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
              Team Governance
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1 mb-2.5">
              Multi-User Collaboration & Admin Roles
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Create groups, invite members, promote administrators, and manage rosters with real-time <code className="text-emerald-300 font-mono bg-emerald-500/10 px-1 rounded">conversation:updated</code> broadcast synchronization.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-emerald-300">
            ✓ Role-Based Admin Controls
          </div>
        </motion.div>

        {/* Bento Card 4: Smart Auto-Scroll Physics (2 cols) */}
        <motion.div
          variants={CARD_VARIANTS}
          whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.2 } }}
          className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl shadow-xl relative overflow-hidden group hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition duration-200"
        >
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-600/20 transition-colors" />

          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 mb-5 shadow-lg shadow-indigo-500/10">
            <ArrowDownCircle className="w-6 h-6" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
            Ergonomic Physics
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1 mb-2.5">
            Intelligent Viewport & Auto-Scroll Retention
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
            Never lose your reading place when new messages arrive. If scrolled up reviewing history, auto-scrolling is gracefully paused, triggering an animated floating <code className="text-indigo-300 font-mono bg-indigo-500/10 px-1 rounded">[ ↓ New Messages ]</code> pill. Prepending older historical messages maintains exact pixel scroll offsets with zero visual jumping.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              🔒 Non-Disruptive Scroll Lock
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              📜 Infinite Cursor Loading
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              ✨ Floating Bounce Badge
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
