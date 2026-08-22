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

  const hasUnread = !isActive && !!conversation.unreadCount && conversation.unreadCount > 0;

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
        "w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer relative select-none group border",
        isActive
          ? "bg-indigo-500/15 border-indigo-500/30 text-white shadow-sm"
          : hasUnread
          ? "bg-slate-800/90 border-indigo-500/40 text-white shadow-sm shadow-indigo-500/10"
          : "hover:bg-slate-800/60 border-transparent text-slate-300 hover:border-slate-800/80"
      )}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-full" />
      )}

      {/* Avatar with unread indicator ring */}
      <div className="relative shrink-0">
        <UserAvatar
          name={avatarName}
          userId={avatarUserId}
          isGroup={isGroup}
          participants={participants}
          size="md"
        />
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-900 ring-2 ring-indigo-500/40 animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={cn(
                "text-xs truncate",
                isActive
                  ? "text-white font-bold"
                  : hasUnread
                  ? "text-white font-extrabold"
                  : "text-slate-200 font-bold group-hover:text-white"
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
                isActive
                  ? "text-indigo-300"
                  : hasUnread
                  ? "text-indigo-400 font-semibold"
                  : "text-slate-500"
              )}
            >
              {timestamp}
            </span>
          )}
        </div>

        {/* Last Message Snippet & Unread Badge */}
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-[11px] truncate leading-relaxed flex-1",
              isActive
                ? "text-indigo-200/90"
                : hasUnread
                ? "text-slate-100 font-medium"
                : "text-slate-400 group-hover:text-slate-300"
            )}
          >
            {snippetText}
          </p>

          {hasUnread && (
            <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-[10px] font-bold shadow-md shadow-indigo-500/30 shrink-0 min-w-[18px] text-center">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
