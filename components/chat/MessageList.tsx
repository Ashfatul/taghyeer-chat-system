"use client";

import React from "react";
import { Message } from "@/lib/types";
import MessageBubble from "./MessageBubble";
import ScrollToBottomButton from "./ScrollToBottomButton";
import { useSmartScroll } from "@/hooks/useSmartScroll";
import { formatDateDivider } from "@/lib/utils/colors";
import { Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  conversationId: string;
  isGroup: boolean;
  isLoading: boolean;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  onLoadMore?: () => void;
  onRetryMessage?: (message: Message) => void;
}

export default function MessageList({
  messages,
  currentUserId,
  conversationId,
  isGroup,
  isLoading,
  hasMore,
  isFetchingMore,
  onLoadMore,
  onRetryMessage,
}: MessageListProps) {
  const {
    containerRef,
    isAtBottom,
    unreadCount,
    scrollToBottom,
    handleScroll,
  } = useSmartScroll({
    messages,
    currentUserId,
    conversationId,
    onLoadMore,
    hasMore,
    isFetchingMore,
  });

  // Initial History Loading Skeleton
  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-4 overflow-hidden flex flex-col justify-end">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={`flex items-end gap-2 ${n % 2 === 0 ? "justify-end" : "justify-start"}`}
          >
            {n % 2 !== 0 && <div className="w-7 h-7 rounded-full bg-slate-800 animate-pulse" />}
            <div
              className={`h-10 rounded-2xl animate-pulse ${
                n % 2 === 0 ? "w-48 bg-indigo-600/30" : "w-64 bg-slate-800"
              }`}
            />
          </div>
        ))}
      </div>
    );
  }

  // Completely Empty Message History
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 shadow-lg shadow-indigo-500/10">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-white">No messages here yet</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
          Send a message below to kick off this conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden flex flex-col">
      {/* Scrollable Message History Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1"
      >
        {/* Loading Older Messages Spinner at the top */}
        {isFetchingMore && (
          <div className="flex justify-center py-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono shadow-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Loading older messages...</span>
            </div>
          </div>
        )}

        {/* Chronological Messages with Date Dividers */}
        {messages.map((message, index) => {
          const senderId =
            typeof message.sender === "string"
              ? message.sender
              : message.sender?._id;

          const isMe = senderId === currentUserId || message.status === "sending";

          // Calculate Date Divider
          const currentDate = format(new Date(message.createdAt), "yyyy-MM-dd");
          const prevDate =
            index > 0
              ? format(new Date(messages[index - 1].createdAt), "yyyy-MM-dd")
              : null;
          const showDateDivider = index === 0 || currentDate !== prevDate;

          // Calculate Consecutive Stacking (same sender within 2 minutes)
          let showSender = true;
          if (index > 0 && !showDateDivider) {
            const prevMsg = messages[index - 1];
            const prevSenderId =
              typeof prevMsg.sender === "string"
                ? prevMsg.sender
                : prevMsg.sender?._id;

            const timeDiff =
              new Date(message.createdAt).getTime() -
              new Date(prevMsg.createdAt).getTime();

            if (prevSenderId === senderId && timeDiff < 120000) {
              showSender = false;
            }
          }

          return (
            <React.Fragment key={message._id || message.tempId || index}>
              {/* Date Group Pill */}
              {showDateDivider && (
                <div className="flex justify-center my-4">
                  <span className="bg-slate-900/90 border border-slate-800 text-slate-400 text-[10px] font-semibold px-3 py-1 rounded-full shadow-sm select-none backdrop-blur-md">
                    {formatDateDivider(message.createdAt)}
                  </span>
                </div>
              )}

              {/* Message Bubble */}
              <MessageBubble
                message={message}
                isMe={isMe}
                isGroup={isGroup}
                showSender={showSender}
                onRetry={onRetryMessage}
              />
            </React.Fragment>
          );
        })}
      </div>

      {/* Floating Jump-to-Bottom Badge */}
      <ScrollToBottomButton
        visible={!isAtBottom}
        unreadCount={unreadCount}
        onClick={() => scrollToBottom(true)}
      />
    </div>
  );
}
