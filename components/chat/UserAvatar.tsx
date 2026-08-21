"use client";

import React from "react";
import { hashToHsl, getInitials } from "@/lib/utils/colors";
import { cn } from "@/lib/utils/cn";
import { Users } from "lucide-react";
import { User } from "@/lib/types";

interface UserAvatarProps {
  name?: string;
  userId?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showOnline?: boolean;
  isOnline?: boolean;
  isGroup?: boolean;
  participants?: User[];
  className?: string;
}

const SIZE_CLASSES = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

const DOT_SIZE_CLASSES = {
  xs: "w-1.5 h-1.5 border",
  sm: "w-2 h-2 border",
  md: "w-2.5 h-2.5 border-2",
  lg: "w-3 h-3 border-2",
  xl: "w-3.5 h-3.5 border-2",
};

export default function UserAvatar({
  name = "User",
  userId,
  size = "md",
  showOnline = false,
  isOnline = false,
  isGroup = false,
  participants,
  className,
}: UserAvatarProps) {
  // If it's a group conversation with multiple participants
  if (isGroup) {
    if (participants && participants.length >= 2) {
      const p1 = participants[0];
      const p2 = participants[1];
      const colors1 = hashToHsl(p1._id || p1.name);
      const colors2 = hashToHsl(p2._id || p2.name);

      return (
        <div className={cn("relative shrink-0", SIZE_CLASSES[size], className)}>
          {/* First participant avatar (top-left) */}
          <div
            className="w-[65%] h-[65%] rounded-full absolute top-0 left-0 flex items-center justify-center font-bold text-[9px] shadow-sm border border-slate-900"
            style={{
              backgroundColor: colors1.bg,
              color: colors1.text,
              borderColor: colors1.border,
            }}
          >
            {getInitials(p1.name)}
          </div>
          {/* Second participant avatar (bottom-right) */}
          <div
            className="w-[65%] h-[65%] rounded-full absolute bottom-0 right-0 flex items-center justify-center font-bold text-[9px] shadow-sm border border-slate-900"
            style={{
              backgroundColor: colors2.bg,
              color: colors2.text,
              borderColor: colors2.border,
            }}
          >
            {getInitials(p2.name)}
          </div>
        </div>
      );
    }

    // Default Group Icon Avatar
    return (
      <div
        className={cn(
          "rounded-2xl bg-gradient-to-tr from-violet-600/30 to-indigo-600/30 border border-violet-500/40 text-violet-300 flex items-center justify-center font-bold shrink-0 shadow-sm",
          SIZE_CLASSES[size],
          className
        )}
      >
        <Users className={cn(size === "xs" ? "w-3 h-3" : size === "sm" ? "w-4 h-4" : "w-5 h-5")} />
      </div>
    );
  }

  // Single Direct User Avatar
  const colors = hashToHsl(userId || name);
  const initials = getInitials(name);

  return (
    <div className={cn("relative shrink-0 select-none", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold shadow-sm transition-transform",
          SIZE_CLASSES[size]
        )}
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`,
        }}
      >
        {initials}
      </div>

      {showOnline && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-slate-950",
            DOT_SIZE_CLASSES[size],
            isOnline ? "bg-emerald-500" : "bg-slate-500"
          )}
          title={isOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}
