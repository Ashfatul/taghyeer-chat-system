"use client";

import React, { useState, useEffect } from "react";
import { User } from "@/lib/types";
import { searchUsers, warmupUserCache } from "@/lib/api/users";
import { useGroupMutations } from "@/hooks/useGroupMutations";
import { useDebounce } from "@/hooks/useDebounce";
import UserAvatar from "../UserAvatar";
import { formatPhoneNumber } from "@/lib/utils/colors";
import { X, Search, UserPlus, Loader2, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  existingParticipantIds: string[];
}

export default function AddMembersModal({
  isOpen,
  onClose,
  conversationId,
  existingParticipantIds,
}: AddMembersModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addParticipants } = useGroupMutations(conversationId);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedUsers([]);
      setError(null);
    } else {
      warmupUserCache().catch(() => {});
    }
  }, [isOpen]);

  // Debounced user search with cancellation safety
  useEffect(() => {
    const trimmed = debouncedSearchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let isCurrent = true;
    setIsSearching(true);

    searchUsers(trimmed)
      .then((results) => {
        if (!isCurrent) return;
        const filtered = results.filter(
          (u) => !existingParticipantIds.includes(u._id)
        );
        setSearchResults(filtered);
      })
      .catch(() => {
        if (!isCurrent) return;
        setSearchResults([]);
      })
      .finally(() => {
        if (isCurrent) {
          setIsSearching(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [debouncedSearchQuery, existingParticipantIds]);

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u._id === user._id);
      if (exists) {
        return prev.filter((u) => u._id !== user._id);
      }
      return [...prev, user];
    });
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;
    setError(null);

    try {
      await addParticipants.mutateAsync(selectedUsers.map((u) => u._id));
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to add participants to group");
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
      <div className="relative w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl z-10 flex flex-col max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-400" />
              Add Group Participants
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Search by name or number to invite members
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="my-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Selected Users Chips */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 my-3">
            {selectedUsers.map((user) => (
              <span
                key={user._id}
                className="inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium"
              >
                <UserAvatar name={user.name} userId={user._id} size="xs" />
                <span>{user.name.split(" ")[0]}</span>
                <button
                  type="button"
                  onClick={() => toggleUserSelection(user)}
                  className="hover:text-white transition ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search Input */}
        <div className="relative my-3">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users to add..."
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

        {/* Results Stream */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 min-h-[160px] pr-1">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              <span className="text-xs font-mono">Searching users...</span>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => {
              const isSelected = selectedUsers.some((u) => u._id === user._id);

              return (
                <div
                  key={user._id}
                  onClick={() => toggleUserSelection(user)}
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
              No new users found matching &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              Search by name or number to add participants.
            </div>
          )}
        </div>

        {/* Footer Submit Button */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400 font-mono">
            {selectedUsers.length} selected
          </span>
          <button
            onClick={handleAddMembers}
            disabled={selectedUsers.length === 0 || addParticipants.isPending}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-semibold transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
          >
            {addParticipants.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Adding Members...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add to Group</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
