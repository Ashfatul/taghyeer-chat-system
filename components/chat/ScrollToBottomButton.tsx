"use client";

import React from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ScrollToBottomButtonProps {
  visible: boolean;
  unreadCount: number;
  onClick: () => void;
}

export default function ScrollToBottomButton({
  visible,
  unreadCount,
  onClick,
}: ScrollToBottomButtonProps) {
  if (!visible && unreadCount === 0) return null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 transition-all duration-200">
      <button
        onClick={onClick}
        className={cn(
          "px-4 py-2 rounded-full text-xs font-semibold shadow-xl border flex items-center gap-2 transition-all active:scale-95",
          unreadCount > 0
            ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/40 animate-bounce"
            : "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 backdrop-blur-md"
        )}
      >
        <ArrowDown className="w-3.5 h-3.5" />
        <span>
          {unreadCount > 0
            ? `${unreadCount} New Message${unreadCount > 1 ? "s" : ""}`
            : "Jump to Latest"}
        </span>
      </button>
    </div>
  );
}
