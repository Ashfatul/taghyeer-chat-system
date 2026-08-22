"use client";

import React, { useMemo } from "react";
import { Conversation } from "@/lib/types";
import ConversationItem from "./ConversationItem";
import { MessageSquarePlus, Search } from "lucide-react";
import { matchConversation } from "@/lib/utils/search";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  currentUserId?: string;
  isLoading: boolean;
  searchQuery: string;
  onSelectConversation: (id: string) => void;
  onOpenNewChatModal: () => void;
}

export default function ConversationList({
  conversations,
  activeId,
  currentUserId,
  isLoading,
  searchQuery,
  onSelectConversation,
  onOpenNewChatModal,
}: ConversationListProps) {
  // Filter conversations based on client-side search query (name, phone, partial digits, message snippets)
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter((conv) => matchConversation(conv, searchQuery));
  }, [conversations, searchQuery]);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="p-2 space-y-2">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3 animate-pulse"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex justify-between items-center">
                <div className="h-3.5 bg-slate-800 rounded w-24" />
                <div className="h-2.5 bg-slate-800 rounded w-10" />
              </div>
              <div className="h-3 bg-slate-800/70 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty Search Results State
  if (searchQuery.trim() && filteredConversations.length === 0) {
    return (
      <div className="p-6 text-center flex flex-col items-center justify-center my-auto">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
          <Search className="w-5 h-5" />
        </div>
        <div className="text-xs font-bold text-slate-300">No conversations found</div>
        <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
          No active chats match &ldquo;{searchQuery}&rdquo;.
        </p>
      </div>
    );
  }

  // Completely Empty Conversations State
  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center flex flex-col items-center justify-center my-auto">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-indigo-600/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
          <MessageSquarePlus className="w-6 h-6" />
        </div>
        <div className="text-sm font-bold text-white">No Conversations Yet</div>
        <p className="text-xs text-slate-400 mt-1.5 max-w-[220px] leading-relaxed">
          Start a new direct message or create a group to begin chatting in real time.
        </p>
        <button
          onClick={onOpenNewChatModal}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 transition active:scale-95 flex items-center gap-1.5"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          <span>Start First Chat</span>
        </button>
      </div>
    );
  }

  // Conversation List
  return (
    <div className="p-2 space-y-1 overflow-y-auto custom-scrollbar flex-1">
      {filteredConversations.map((conversation) => (
        <ConversationItem
          key={conversation._id}
          conversation={conversation}
          isActive={conversation._id === activeId}
          currentUserId={currentUserId}
          onClick={() => onSelectConversation(conversation._id)}
        />
      ))}
    </div>
  );
}
