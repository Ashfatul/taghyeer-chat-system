"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Conversation } from "@/lib/types";
import { useDebounce } from "@/hooks/useDebounce";
import UserAvatar from "./UserAvatar";
import ConversationList from "./ConversationList";
import NewChatModal from "./NewChatModal";
import { formatPhoneNumber } from "@/lib/utils/colors";
import {
  Search,
  Plus,
  LogOut,
  Radio,
  X,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  isLoading: boolean;
  onSelectConversation: (id: string) => void;
  className?: string;
}

export default function ChatSidebar({
  conversations,
  activeId,
  isLoading,
  onSelectConversation,
  className,
}: ChatSidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 200);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside
      className={`w-full md:w-80 lg:w-96 bg-slate-900/90 border-r border-slate-800 flex flex-col h-full overflow-hidden select-none ${
        className || ""
      }`}
    >
      {/* User Header Profile */}
      <div className="p-3.5 border-b border-slate-800/90 bg-slate-950/60 backdrop-blur-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <UserAvatar
            name={user?.name}
            userId={user?._id}
            size="md"
            showOnline={true}
            isOnline={true}
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
              <span>{user?.name || "My Account"}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              {formatPhoneNumber(user?.phone || "")}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <span
            className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400"
            title="WebSocket Gateway Active"
          >
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            <span>Live</span>
          </span>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 flex items-center justify-center transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search & New Chat Action Bar */}
      <div className="p-3 border-b border-slate-800/70 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => setIsNewChatModalOpen(true)}
          title="New Conversation"
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition active:scale-95 flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New</span>
        </button>
      </div>

      {/* Conversation List */}
      <ConversationList
        conversations={conversations}
        activeId={activeId}
        currentUserId={user?._id}
        isLoading={isLoading}
        searchQuery={debouncedSearchQuery}
        onSelectConversation={onSelectConversation}
        onOpenNewChatModal={() => setIsNewChatModalOpen(true)}
      />

      {/* Sidebar Footer Indicator */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/60 text-center text-[10px] text-slate-500 font-mono flex items-center justify-between px-4">
        <span className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3 text-indigo-400" />
          {conversations.length} {conversations.length === 1 ? "chat" : "chats"}
        </span>
        <span className="text-slate-500">Taghyeer v1.0</span>
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSelectConversation={onSelectConversation}
        currentUserId={user?._id}
      />
    </aside>
  );
}
