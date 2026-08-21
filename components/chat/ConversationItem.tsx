"use client";

import React from "react";
import { Conversation, User } from "@/lib/types";
import UserAvatar from "./UserAvatar";
import { cn } from "@/lib/utils/cn";
import { formatConversationDate } from "@/lib/utils/colors";
import { Users } from "lucide-react";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  currentUserId?: string;
  onClick: () => void;
}

export default function ConversationItem({
  conversation,
  isActive,
  currentUserId,
  onClick,
}: ConversationItemProps) {
  const isGroup = conversation.type === "group";

  // Determine Title
  const title = isGroup
    ? conversation.name || "Group Conversation"
    : conversation.participant?.name || "Direct Conversation";

  // Determine Avatar Props
  const avatarName = isGroup ? conversation.name : conversation.participant?.name;
  const avatarUserId = isGroup ? undefined : conversation.participant?._id;
  const participants = isGroup ? conversation.participants : undefined;

  // Determine snippet & prefix
  let snippetText = "No messages yet";
  if (conversation.lastMessage?.text) {
    const isSentByMe = conversation.lastMessage.sender === currentUserId;
    if (isSentByMe) {
      snippetText = `You: ${conversation.lastMessage.text}`;
    } else if (isGroup && participants) {
      const sender = participants.find((p: User) => p._id === conversation.lastMessage?.sender);
      if (sender) {
        snippetText = `${sender.name.split(" ")[0]}: ${conversation.lastMessage.text}`;
      } else {
        snippetText = conversation.lastMessage.text;
      }
    } else {
      snippetText = conversation.lastMessage.text;
    }
  }

  const timestamp = formatConversationDate(
    conversation.lastMessage?.createdAt || conversation.updatedAt
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer relative select-none group border border-transparent",
        isActive
          ? "bg-indigo-500/15 border-indigo-500/30 text-white shadow-sm"
          : "hover:bg-slate-800/60 text-slate-300 hover:border-slate-800/80"
      )}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-full" />
      )}

      {/* Avatar */}
      <UserAvatar
        name={avatarName}
        userId={avatarUserId}
        isGroup={isGroup}
        participants={participants}
        size="md"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={cn(
                "text-xs font-bold truncate",
                isActive ? "text-white" : "text-slate-200 group-hover:text-white"
              )}
            >
              {title}
            </span>
            {isGroup && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] rounded-full bg-violet-500/15 text-violet-300 font-mono shrink-0">
                <Users className="w-2.5 h-2.5" />
                {conversation.participants?.length || 0}
              </span>
            )}
          </div>

          {timestamp && (
            <span
              className={cn(
                "text-[10px] font-mono shrink-0",
                isActive ? "text-indigo-300" : "text-slate-500"
              )}
            >
              {timestamp}
            </span>
          )}
        </div>

        {/* Last Message Snippet */}
        <p
          className={cn(
            "text-[11px] truncate leading-relaxed",
            isActive ? "text-indigo-200/90" : "text-slate-400 group-hover:text-slate-300"
          )}
        >
          {snippetText}
        </p>
      </div>
    </div>
  );
}
