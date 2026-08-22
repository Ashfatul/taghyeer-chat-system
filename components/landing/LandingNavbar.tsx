"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Radio, ArrowRight, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LandingNavbar() {
  const { user, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-[#0B0F19]/95 backdrop-blur-xl border-b border-slate-800 shadow-2xl shadow-black/50"
          : "bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-800/50"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
              Taghyeer Chat
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Real-Time Suite</div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition">
            Features
          </a>
          <a href="#simulator" className="hover:text-white transition">
            Live Sandbox
          </a>
          <a href="#architecture" className="hover:text-white transition">
            Architecture
          </a>
          <a href="#api" className="hover:text-white transition">
            API Spec
          </a>
        </nav>

        {/* Right Status & Launch App CTA */}
        <div className="hidden md:flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            <span>All Systems Live</span>
          </div>

          {isAuthenticated ? (
            <Link
              href="/chat"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition active:scale-95 flex items-center gap-1.5"
            >
              <span>Open Chat ({user?.name.split(" ")[0]})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition active:scale-95 flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition active:scale-95"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0F19]/95 backdrop-blur-2xl border-b border-slate-800 px-6 py-4 space-y-3 animate-fade-in shadow-2xl">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-medium text-slate-300 hover:text-white py-1.5 transition"
          >
            Features
          </a>
          <a
            href="#simulator"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-medium text-slate-300 hover:text-white py-1.5 transition"
          >
            Live Sandbox
          </a>
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-medium text-slate-300 hover:text-white py-1.5 transition"
          >
            Architecture
          </a>
          <a
            href="#api"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-medium text-slate-300 hover:text-white py-1.5 transition"
          >
            API Spec
          </a>
          <div className="pt-2">
            <Link
              href={isAuthenticated ? "/chat" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-lg shadow-indigo-500/25"
            >
              <span>{isAuthenticated ? `Open Chat (${user?.name.split(" ")[0] || "Live"})` : "Launch App"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
