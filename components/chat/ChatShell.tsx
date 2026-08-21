"use client";

import React, { useState, useEffect } from "react";
import { useConversations } from "@/hooks/useConversations";
import ChatSidebar from "./ChatSidebar";
import UserAvatar from "./UserAvatar";
import { MessageSquare, Sparkles, ArrowLeft, Plus } from "lucide-react";
import NewChatModal from "./NewChatModal";
import { useAuth } from "@/context/AuthContext";

export default function ChatShell() {
  const { user } = useAuth();
  const { data: conversations = [], isLoading } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  // Auto-select first conversation if available on desktop
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0 && typeof window !== "undefined" && window.innerWidth >= 1024) {
      setActiveConversationId(conversations[0]._id);
    }
  }, [conversations, activeConversationId]);

  const activeConversation = conversations.find((c) => c._id === activeConversationId);

  return (
    <div className="h-screen w-full bg-[#0B0F19] text-slate-100 flex overflow-hidden">
      {/* Left Sidebar (visible on mobile if no conversation is selected, always visible on tablet/desktop) */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeConversationId}
        isLoading={isLoading}
        onSelectConversation={(id) => setActiveConversationId(id)}
        className={activeConversationId ? "hidden md:flex" : "flex"}
      />

      {/* Main Chat Panel Area */}
      <main
        className={`flex-1 flex flex-col h-full bg-[#0B0F19] relative ${
          !activeConversationId ? "hidden md:flex" : "flex"
        }`}
      >
        {activeConversation ? (
          <div className="flex-1 flex flex-col h-full">
            {/* Header with Mobile Back Button */}
            <header className="p-3.5 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                  title="Back to Conversations"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <UserAvatar
                  name={
                    activeConversation.type === "group"
                      ? activeConversation.name
                      : activeConversation.participant?.name
                  }
                  userId={
                    activeConversation.type === "group"
                      ? undefined
                      : activeConversation.participant?._id
                  }
                  isGroup={activeConversation.type === "group"}
                  participants={
                    activeConversation.type === "group"
                      ? activeConversation.participants
                      : undefined
                  }
                  size="md"
                />

                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    {activeConversation.type === "group"
                      ? activeConversation.name
                      : activeConversation.participant?.name}
                  </h2>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    {activeConversation.type === "group"
                      ? `${activeConversation.participants?.length || 0} participants`
                      : "Online • Direct Chat"}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-mono">
                Phase 2 Verified
              </div>
            </header>

            {/* Placeholder Message Area until Phase 3 */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center my-auto">
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">
                {activeConversation.type === "group"
                  ? activeConversation.name
                  : activeConversation.participant?.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                Conversation loaded. Phase 2 conversation selection and real-time list synchronization is fully active.
              </p>
              <div className="mt-4 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-mono">
                Ready for Phase 3 Message Stream & Input
              </div>
            </div>
          </div>
        ) : (
          /* Empty Chat Selected State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
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
        onSelectConversation={(id) => setActiveConversationId(id)}
        currentUserId={user?._id}
      />
    </div>
  );
}
