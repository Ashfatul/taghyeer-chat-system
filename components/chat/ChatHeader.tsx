"use client";

import React from "react";
import { Conversation } from "@/lib/types";
import UserAvatar from "./UserAvatar";
import { ArrowLeft, Users, Radio, Info } from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils/colors";

interface ChatHeaderProps {
  conversation: Conversation;
  onBack?: () => void;
  onToggleGroupInfo?: () => void;
}

export default function ChatHeader({
  conversation,
  onBack,
  onToggleGroupInfo,
}: ChatHeaderProps) {
  const isGroup = conversation.type === "group";

  const title = isGroup
    ? conversation.name || "Group Conversation"
    : conversation.participant?.name || "Direct Conversation";

  const subtitle = isGroup
    ? `${conversation.participants?.length || 0} participants`
    : conversation.participant?.phone
    ? formatPhoneNumber(conversation.participant.phone)
    : "Online • Direct Chat";

  return (
    <header className="p-3 sm:p-3.5 border-b border-slate-800 bg-slate-900/70 backdrop-blur-xl flex items-center justify-between z-10 select-none">
      {/* Left: Back button + Avatar + User/Group Info */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition shrink-0"
            title="Back to Conversations"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <UserAvatar
          name={isGroup ? conversation.name : conversation.participant?.name}
          userId={isGroup ? undefined : conversation.participant?._id}
          isGroup={isGroup}
          participants={isGroup ? conversation.participants : undefined}
          size="md"
          showOnline={!isGroup}
          isOnline={true}
        />

        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate flex items-center gap-1.5">
            <span>{title}</span>
          </h2>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Real-time Live Badge + Group Details Action */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
          <Radio className="w-2.5 h-2.5 animate-pulse" />
          <span>Live Sync</span>
        </span>

        {isGroup && onToggleGroupInfo && (
          <button
            onClick={onToggleGroupInfo}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            title="View Group Details & Members"
          >
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Group Info</span>
          </button>
        )}
      </div>
    </header>
  );
}
