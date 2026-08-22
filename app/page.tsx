"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Zap, Users, Play, Code2, ChevronDown } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import InteractiveMiniChat from "@/components/landing/InteractiveMiniChat";
import FeatureSection from "@/components/landing/FeatureSection";
import ArchitectureSection from "@/components/landing/ArchitectureSection";
import TechStackSection from "@/components/landing/TechStackSection";
import LandingFooter from "@/components/landing/LandingFooter";
import { useAuth } from "@/context/AuthContext";

const HERO_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 24,
      stiffness: 120,
    },
  },
};

const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glows with Subtle Motion */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.2, 0.28, 0.2],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[550px] bg-gradient-to-b from-indigo-600/30 via-violet-600/20 to-transparent rounded-full blur-[140px] pointer-events-none"
      />
      <div className="absolute top-[35%] right-[-10%] w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[550px] h-[550px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-25 pointer-events-none" />

      {/* Sticky Header Navigation */}
      <LandingNavbar />

      {/* Main Content Sections with Balanced Vertical Rhythm */}
      <main className="flex-1 z-10 space-y-12 sm:space-y-16 pb-12">
        {/* Section 1: Hero Section */}
        <section className="pt-8 sm:pt-14 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center"
          >
            {/* Floating Badge */}
            <motion.div variants={HERO_VARIANTS}>
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-5 shadow-lg shadow-indigo-500/10 backdrop-blur-md"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                <span>Frontend Take-Home Assignment • Part 2 Creative Showcase</span>
              </motion.div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={HERO_VARIANTS}
              className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08] mb-5"
            >
              Real-Time Conversations. <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent drop-shadow-sm">
                Engineered for Speed.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={HERO_VARIANTS}
              className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-7"
            >
              A production-grade, WebSocket-powered chat platform featuring instant passwordless auth,
              multi-user group governance, and intelligent auto-scroll physics.
            </motion.p>

            {/* Action CTAs */}
            <motion.div
              variants={HERO_VARIANTS}
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8 sm:mb-10 w-full sm:w-auto"
            >
              <Link
                href={isAuthenticated ? "/chat" : "/login"}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition active:scale-95 flex items-center justify-center gap-2 group"
              >
                <span>Try Live Chat App</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#simulator"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 text-indigo-400" />
                <span>Test Interactive Sandbox</span>
              </a>
            </motion.div>

            {/* Key Metric Chips */}
            <motion.div
              variants={HERO_VARIANTS}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl w-full mx-auto mb-8 sm:mb-10 text-left"
            >
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md hover:border-indigo-500/40 hover:-translate-y-1 transition duration-200 shadow-md">
                <div className="text-xs text-slate-500 font-mono">Sync Latency</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">&lt; 25ms WebSocket</div>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md hover:border-indigo-500/40 hover:-translate-y-1 transition duration-200 shadow-md">
                <div className="text-xs text-slate-500 font-mono">Authentication</div>
                <div className="text-sm font-bold text-indigo-400 mt-0.5">100% Passwordless</div>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md hover:border-indigo-500/40 hover:-translate-y-1 transition duration-200 shadow-md">
                <div className="text-xs text-slate-500 font-mono">Scroll Physics</div>
                <div className="text-sm font-bold text-violet-400 mt-0.5">Zero Disruption</div>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md hover:border-indigo-500/40 hover:-translate-y-1 transition duration-200 shadow-md">
                <div className="text-xs text-slate-500 font-mono">Design System</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">WCAG AAA Dark</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Interactive Live Chat Sandbox Hero Widget */}
          <motion.div
            id="simulator"
            initial={{ opacity: 0, y: 48, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              type: "spring",
              damping: 24,
              stiffness: 110,
            }}
            className="pt-2 scroll-mt-20 text-left"
          >
            <InteractiveMiniChat />
          </motion.div>
        </section>

        {/* Section 2: Bento Grid Feature Breakdown */}
        <FeatureSection />

        {/* Section 3: Live API & Architecture Inspector */}
        <ArchitectureSection />

        {/* Section 4: Modern Tech Stack Showcase */}
        <TechStackSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
