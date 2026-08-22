"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare, Sparkles, ArrowRight, Loader2, AlertCircle, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .transform((val) => {
      let cleaned = val.trim();
      if (!cleaned.startsWith("+")) {
        cleaned = "+" + cleaned.replace(/^0+/, "");
      }
      return cleaned;
    })
    .refine((val) => /^\+[1-9]\d{6,14}$/.test(val.replace(/[\s()-]/g, "")), {
      message: "Please enter a valid phone number with country code (e.g. +12025550101)",
    }),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be 50 characters or less")
    .trim(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  { name: "Sarah Connor", phone: "+12025550101", role: "Primary Tester" },
  { name: "Alex Mercer", phone: "+15550123456", role: "Product Lead" },
  { name: "Maya Lin", phone: "+15550145522", role: "UI Designer" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "+1",
      name: "",
    },
  });

  // If already authenticated, redirect straight to chat
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace("/chat");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      // Clean phone number before submitting
      const sanitizedPhone = data.phone.replace(/[\s()-]/g, "");
      await login({
        phone: sanitizedPhone,
        name: data.name,
      });

      router.push("/chat");
    } catch (err: any) {
      const msg =
        err?.message || "Failed to sign in. Please verify your connection and try again.";
      setServerError(msg);
      setIsSubmitting(false);
    }
  };

  const handleSelectDemo = (account: (typeof DEMO_ACCOUNTS)[0]) => {
    setValue("name", account.name, { shouldValidate: true });
    setValue("phone", account.phone, { shouldValidate: true });
    setServerError(null);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-mono">Restoring session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col justify-between bg-[#0B0F19] relative overflow-hidden px-4 py-6 sm:py-8 selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Top Navbar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              Taghyeer Chat
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">v1.0 • Real-Time</span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-slate-200 transition font-medium px-3 py-1.5 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60"
        >
          <span className="hidden sm:inline">← Back to Landing Page</span>
          <span className="sm:hidden">← Back</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto z-10 py-6">
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          {/* Card Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Passwordless Entry
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign in to Taghyeer
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Enter your phone and name. New users are registered automatically.
            </p>
          </div>

          {/* Auto-Registration Assurance Banner */}
          <div className="mb-6 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-indigo-200/90 leading-relaxed">
              <strong className="text-indigo-300 font-semibold">Zero password friction:</strong> If
              your phone number is new, a unique account will be automatically provisioned for you.
            </div>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Phone Number Field */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Phone Number (with Country Code)
              </label>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  placeholder="+1 (202) 555-0101"
                  disabled={isSubmitting}
                  {...register("phone")}
                  className={`w-full bg-slate-950/80 border ${
                    errors.phone ? "border-rose-500" : "border-slate-800"
                  } focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition focus:outline-none`}
                />
              </div>
              {errors.phone ? (
                <p className="text-[11px] text-rose-400 mt-1">{errors.phone.message}</p>
              ) : (
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  Example: +12025550101 or +447911123456
                </p>
              )}
            </div>

            {/* Display Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Your Display Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Sarah Connor"
                disabled={isSubmitting}
                {...register("name")}
                className={`w-full bg-slate-950/80 border ${
                  errors.name ? "border-rose-500" : "border-slate-800"
                } focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition focus:outline-none`}
              />
              {errors.name && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-lg shadow-indigo-500/25 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Continue to Live Chat</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Demo Presets
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1-click fill</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.phone}
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 text-left transition group"
                >
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                    {acc.name.split(" ")[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">{acc.phone}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-2 z-10 font-mono">
        Taghyeer Chat System • Built with Next.js 16 & Socket.io
      </footer>
    </div>
  );
}
