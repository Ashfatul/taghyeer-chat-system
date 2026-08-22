"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Zap, Users, Play, Code2 } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import InteractiveMiniChat from "@/components/landing/InteractiveMiniChat";
import FeatureSection from "@/components/landing/FeatureSection";
import ArchitectureSection from "@/components/landing/ArchitectureSection";
import TechStackSection from "@/components/landing/TechStackSection";
import LandingFooter from "@/components/landing/LandingFooter";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[550px] bg-gradient-to-b from-indigo-600/20 via-violet-600/10 to-transparent rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none" />

      {/* Sticky Header Navigation */}
      <LandingNavbar />

      {/* Main Content Sections */}
      <main className="flex-1 z-10 space-y-24">
        {/* Section 1: Hero Section */}
        <section className="pt-12 sm:pt-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Frontend Take-Home Assignment • Part 2 Creative Showcase</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6">
            Real-Time Conversations. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
              Engineered for Speed.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            A production-grade, WebSocket-powered chat platform featuring instant passwordless auth,
            multi-user group governance, and intelligent auto-scroll physics.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href={isAuthenticated ? "/chat" : "/login"}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 transition active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>Try Live Chat App</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <a
              href="#simulator"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 text-indigo-400" />
              <span>Test Interactive Sandbox</span>
            </a>
          </div>

          {/* Key Metric Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mb-16 text-left">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-xs text-slate-500 font-mono">Sync Latency</div>
              <div className="text-sm font-bold text-emerald-400">&lt; 25ms WebSocket</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-xs text-slate-500 font-mono">Authentication</div>
              <div className="text-sm font-bold text-indigo-400">100% Passwordless</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-xs text-slate-500 font-mono">Scroll Physics</div>
              <div className="text-sm font-bold text-violet-400">Zero Disruption</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-xs text-slate-500 font-mono">Design System</div>
              <div className="text-sm font-bold text-amber-400">WCAG AAA Dark</div>
            </div>
          </div>

          {/* Interactive Live Chat Sandbox Hero Widget */}
          <div id="simulator" className="pt-4 scroll-mt-24 text-left">
            <InteractiveMiniChat />
          </div>
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
