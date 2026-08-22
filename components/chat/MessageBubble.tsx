"use client";

import React, { useState } from "react";
import { Message, User } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { formatMessageTimestamp, hashToHsl } from "@/lib/utils/colors";
import { globalUserCache } from "@/lib/api/users";
import UserAvatar from "./UserAvatar";
import { Check, CheckCheck, Clock, AlertCircle, Copy, Check as CopyCheck } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  isGroup: boolean;
  showSender: boolean;
  participants?: User[];
  onRetry?: (message: Message) => void;
}

export default function MessageBubble({
  message,
  isMe,
  isGroup,
  showSender,
  participants,
  onRetry,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  let senderName = "Participant";
  let senderId = "";

  if (typeof message.sender === "object" && message.sender !== null) {
    senderName = message.sender.name || "Participant";
    senderId = message.sender._id || "";
  } else if (typeof message.sender === "string") {
    senderId = message.sender;
    const participantMatch = participants?.find((p) => p._id === senderId);
    if (participantMatch?.name) {
      senderName = participantMatch.name;
    } else {
      const cached = globalUserCache.get(senderId);
      if (cached?.name) {
        senderName = cached.name;
      }
    }
  }

  const senderColors = hashToHsl(senderId || senderName);
  const timeFormatted = formatMessageTimestamp(message.createdAt);

  const handleCopyText = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        "flex items-end gap-2 group relative max-w-[85%] sm:max-w-[75%]",
        isMe ? "ml-auto justify-end" : "justify-start",
        showSender ? "mt-3" : "mt-1"
      )}
    >
      {/* Left Avatar for Incoming Messages */}
      {!isMe && (
        <div className="w-7 h-7 shrink-0 mb-0.5 select-none">
          {showSender ? (
            <UserAvatar name={senderName} userId={senderId} size="xs" />
          ) : (
            <div className="w-7 h-7" />
          )}
        </div>
      )}

      {/* Bubble Container */}
      <div className="flex flex-col relative min-w-0">
        {/* Group Sender Name Header */}
        {!isMe && isGroup && showSender && (
          <span
            className="text-[11px] font-bold mb-1 ml-1 select-none flex items-center gap-1"
            style={{ color: senderColors.text }}
          >
            {senderName}
          </span>
        )}

        {/* Message Bubble Body */}
        <div
          className={cn(
            "relative px-4 py-2.5 shadow-sm text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap select-text transition-all",
            isMe
              ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-2xl rounded-br-xs shadow-indigo-500/10"
              : "bg-slate-800/90 border border-slate-700/70 text-slate-100 rounded-2xl rounded-bl-xs shadow-black/10"
          )}
        >
          {/* Message Text */}
          <div className="pr-1">{message.text}</div>

          {/* Timestamp & Status Metadata */}
          <div
            className={cn(
              "flex items-center justify-end gap-1 mt-1 text-[10px] font-mono select-none",
              isMe ? "text-indigo-200/90" : "text-slate-400"
            )}
          >
            <span>{timeFormatted}</span>

            {/* Outgoing Message Status Indicators */}
            {isMe && (
              <span className="inline-flex items-center ml-0.5">
                {message.status === "sending" ? (
                  <span title="Sending...">
                    <Clock className="w-3 h-3 text-indigo-300 animate-spin" />
                  </span>
                ) : message.status === "failed" ? (
                  <button
                    onClick={() => onRetry?.(message)}
                    title="Failed to send. Click to retry."
                    className="inline-flex items-center gap-0.5 text-rose-300 hover:text-rose-200 transition"
                  >
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                    <span className="underline text-[9px]">Retry</span>
                  </button>
                ) : (
                  <span title="Delivered">
                    <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Quick Hover Copy Action: Vertically Centered with clean 10px spacing */}
        <button
          onClick={handleCopyText}
          title="Copy message"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-full bg-slate-900/95 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800 shadow-md backdrop-blur-sm z-10 select-none",
            isMe ? "right-[calc(100%+10px)]" : "left-[calc(100%+10px)]"
          )}
        >
          {copied ? <CopyCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
