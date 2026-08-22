"use client";

import React, { useState, useEffect } from "react";
import { useConversations, markConversationAsRead } from "@/hooks/useConversations";
import { useQueryClient } from "@tanstack/react-query";
import ChatSidebar from "./ChatSidebar";
import ChatArea from "./ChatArea";
import GroupInfoDrawer from "./group/GroupInfoDrawer";
import { Sparkles, Plus } from "lucide-react";
import NewChatModal from "./NewChatModal";
import { useAuth } from "@/context/AuthContext";
import { GroupConversation } from "@/lib/types";

export default function ChatShell() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: conversations = [], isLoading } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isGroupDrawerOpen, setIsGroupDrawerOpen] = useState(false);

  // Auto-select first conversation if available on desktop
  useEffect(() => {
    if (
      !activeConversationId &&
      conversations.length > 0 &&
      typeof window !== "undefined" &&
      window.innerWidth >= 1024
    ) {
      const firstId = conversations[0]._id;
      setActiveConversationId(firstId);
      markConversationAsRead(queryClient, firstId);
    }
  }, [conversations, activeConversationId, queryClient]);

  // Clear unread badge whenever active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      markConversationAsRead(queryClient, activeConversationId);
    }
  }, [activeConversationId, queryClient]);

  const activeConversation = conversations.find((c) => c._id === activeConversationId);

  // Close group drawer and clear unread badge when selecting conversations
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setIsGroupDrawerOpen(false);
    markConversationAsRead(queryClient, id);
  };

  return (
    <div className="h-screen h-[100dvh] w-full bg-[#0B0F19] text-slate-100 flex overflow-hidden">
      {/* Left Sidebar (visible on mobile if no conversation is selected, always visible on tablet/desktop) */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeConversationId}
        isLoading={isLoading}
        onSelectConversation={handleSelectConversation}
        className={activeConversationId ? "hidden md:flex" : "flex w-full md:w-80 lg:w-96 shrink-0"}
      />

      {/* Center Main Chat Panel Area */}
      <main
        className={`flex-1 flex flex-col h-full bg-[#0B0F19] relative min-w-0 overflow-hidden ${
          !activeConversationId ? "hidden md:flex" : "flex"
        }`}
      >
        {activeConversation ? (
          <div className="flex-1 flex h-full overflow-hidden relative">
            <ChatArea
              conversation={activeConversation}
              currentUserId={user?._id}
              onBack={() => setActiveConversationId(null)}
              onToggleGroupInfo={() => setIsGroupDrawerOpen((prev) => !prev)}
            />

            {/* Right Slide-over Group Details Drawer */}
            {activeConversation.type === "group" && (
              <GroupInfoDrawer
                isOpen={isGroupDrawerOpen}
                onClose={() => setIsGroupDrawerOpen(false)}
                conversation={activeConversation as GroupConversation}
                currentUserId={user?._id}
                onLeaveSuccess={() => {
                  setActiveConversationId(null);
                  setIsGroupDrawerOpen(false);
                }}
              />
            )}
          </div>
        ) : (
          /* Empty Chat Selected State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto select-none">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-xl shadow-indigo-500/10">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Select a Conversation</h2>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
              Choose an existing chat from the sidebar or start a new direct conversation to begin messaging.
            </p>
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="mt-5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>
          </div>
        )}
      </main>

      {/* Global New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSelectConversation={handleSelectConversation}
        currentUserId={user?._id}
      />
    </div>
  );
}
