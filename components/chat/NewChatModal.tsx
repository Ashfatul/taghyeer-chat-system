"use client";

import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/lib/types";
import { searchUsers } from "@/lib/api/users";
import { useStartDirectConversation, useCreateGroupConversation } from "@/hooks/useConversations";
import UserAvatar from "./UserAvatar";
import { formatPhoneNumber } from "@/lib/utils/colors";
import {
  X,
  Search,
  Users,
  MessageSquare,
  Loader2,
  Plus,
  Check,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversationId: string) => void;
  currentUserId?: string;
}

export default function NewChatModal({
  isOpen,
  onClose,
  onSelectConversation,
  currentUserId,
}: NewChatModalProps) {
  const [activeTab, setActiveTab] = useState<"direct" | "group">("direct");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<User[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);

  const startDirectMutation = useStartDirectConversation();
  const createGroupMutation = useCreateGroupConversation();

  // Reset state when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setGroupName("");
      setSelectedParticipants([]);
      setModalError(null);
      setActiveTab("direct");
    }
  }, [isOpen]);

  // Debounced user search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchUsers(searchQuery);
        // Exclude current user from search results
        const filtered = results.filter((u) => u._id !== currentUserId);
        setSearchResults(filtered);
      } catch (err: any) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUserId]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle Direct Message Selection
  const handleStartDirect = async (user: User) => {
    setModalError(null);
    try {
      const conversation = await startDirectMutation.mutateAsync(user._id);
      onSelectConversation(conversation._id);
      onClose();
    } catch (err: any) {
      setModalError(err?.message || "Failed to start direct conversation");
    }
  };

  // Toggle Group Participant Selection
  const toggleParticipant = (user: User) => {
    setSelectedParticipants((prev) => {
      const exists = prev.some((p) => p._id === user._id);
      if (exists) {
        return prev.filter((p) => p._id !== user._id);
      }
      return [...prev, user];
    });
  };

  // Handle Create Group Submission
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setModalError("Please enter a group name");
      return;
    }
    if (selectedParticipants.length < 2) {
      setModalError("Please select at least 2 participants for a group conversation");
      return;
    }

    setModalError(null);
    try {
      const group = await createGroupMutation.mutateAsync({
        name: groupName.trim(),
        participantIds: selectedParticipants.map((p) => p._id),
      });
      onSelectConversation(group._id);
      onClose();
    } catch (err: any) {
      setModalError(err?.message || "Failed to create group conversation");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl z-10 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Start a Conversation
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Search by name or phone number to connect
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-2xl my-4 border border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              setActiveTab("direct");
              setModalError(null);
            }}
            className={cn(
              "py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition",
              activeTab === "direct"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Message</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("group");
              setModalError(null);
            }}
            className={cn(
              "py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition",
              activeTab === "group"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Create Group</span>
          </button>
        </div>

        {/* Error Alert */}
        {modalError && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{modalError}</span>
          </div>
        )}

        {/* Group Name Input (Only in Group mode) */}
        {activeTab === "group" && (
          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Group Subject / Name
            </label>
            <input
              type="text"
              placeholder="e.g. Product Design Team"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={40}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />

            {/* Selected Participants Chips */}
            {selectedParticipants.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {selectedParticipants.map((participant) => (
                  <span
                    key={participant._id}
                    className="inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium"
                  >
                    <UserAvatar name={participant.name} userId={participant._id} size="xs" />
                    <span>{participant.name.split(" ")[0]}</span>
                    <button
                      type="button"
                      onClick={() => toggleParticipant(participant)}
                      className="hover:text-white transition ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Search Input */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 min-h-[160px] pr-1">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              <span className="text-xs font-mono">Searching users...</span>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => {
              const isSelected = selectedParticipants.some((p) => p._id === user._id);

              if (activeTab === "direct") {
                return (
                  <div
                    key={user._id}
                    className="p-2.5 rounded-2xl bg-slate-950/40 hover:bg-slate-800/80 border border-slate-800/80 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar name={user.name} userId={user._id} size="sm" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{user.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {formatPhoneNumber(user.phone)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartDirect(user)}
                      disabled={startDirectMutation.isPending}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition active:scale-95 flex items-center gap-1 disabled:opacity-50"
                    >
                      {startDirectMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <span>Chat</span>
                      )}
                    </button>
                  </div>
                );
              }

              // Group Mode
              return (
                <div
                  key={user._id}
                  onClick={() => toggleParticipant(user)}
                  className={cn(
                    "p-2.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition select-none",
                    isSelected
                      ? "bg-indigo-500/15 border-indigo-500/40 text-white"
                      : "bg-slate-950/40 hover:bg-slate-800/80 border-slate-800/80 text-slate-300"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar name={user.name} userId={user._id} size="sm" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{user.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {formatPhoneNumber(user.phone)}
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center border transition",
                      isSelected
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "border-slate-700 bg-slate-900 text-transparent"
                    )}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          ) : searchQuery.trim() ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No users found matching &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              Type a name or phone number above to find participants.
            </div>
          )}
        </div>

        {/* Group Mode Footer CTA */}
        {activeTab === "group" && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400 font-mono">
              {selectedParticipants.length} selected (min 2)
            </span>
            <button
              type="button"
              onClick={handleCreateGroup}
              disabled={
                createGroupMutation.isPending ||
                !groupName.trim() ||
                selectedParticipants.length < 2
              }
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-semibold transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
            >
              {createGroupMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Group...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Group</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
