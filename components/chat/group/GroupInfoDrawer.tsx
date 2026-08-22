"use client";

import React, { useState } from "react";
import { GroupConversation } from "@/lib/types";
import { useGroupMutations } from "@/hooks/useGroupMutations";
import UserAvatar from "../UserAvatar";
import GroupMemberList from "./GroupMemberList";
import AddMembersModal from "./AddMembersModal";
import {
  X,
  Edit2,
  Check,
  UserPlus,
  LogOut,
  ShieldCheck,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface GroupInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: GroupConversation;
  currentUserId?: string;
  onLeaveSuccess: () => void;
}

export default function GroupInfoDrawer({
  isOpen,
  onClose,
  conversation,
  currentUserId,
  onLeaveSuccess,
}: GroupInfoDrawerProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(conversation.name || "");
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [isConfirmingLeave, setIsConfirmingLeave] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    renameGroup,
    removeParticipant,
    promoteAdmin,
    leaveGroup,
  } = useGroupMutations(conversation._id);

  const isAdmin = conversation.admins?.includes(currentUserId || "") || false;

  const handleSaveName = async () => {
    if (!editedName.trim() || editedName === conversation.name) {
      setIsEditingName(false);
      return;
    }
    setActionError(null);

    try {
      await renameGroup.mutateAsync(editedName.trim());
      setIsEditingName(false);
    } catch (err: any) {
      setActionError(err?.message || "Failed to rename group");
    }
  };

  const handlePromoteAdmin = async (userId: string) => {
    setActionError(null);
    try {
      await promoteAdmin.mutateAsync(userId);
    } catch (err: any) {
      setActionError(err?.message || "Failed to promote member to admin");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setActionError(null);
    try {
      await removeParticipant.mutateAsync(userId);
    } catch (err: any) {
      setActionError(err?.message || "Failed to remove member");
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentUserId) return;
    setActionError(null);

    try {
      await leaveGroup.mutateAsync(currentUserId);
      onLeaveSuccess();
      onClose();
    } catch (err: any) {
      setActionError(err?.message || "Failed to leave group");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-20 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Container */}
      <aside className="fixed inset-y-0 right-0 z-30 w-full sm:w-96 md:relative md:inset-auto bg-slate-900/95 border-l border-slate-800 flex flex-col h-full shadow-2xl backdrop-blur-xl overflow-hidden animate-slide-left select-none">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Group Info</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          {/* Error Alert */}
          {actionError && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Group Profile Hero */}
          <div className="flex flex-col items-center text-center">
            <UserAvatar
              name={conversation.name}
              isGroup={true}
              participants={conversation.participants}
              size="xl"
              className="mb-3"
            />

            {/* Editable Group Title */}
            {isEditingName ? (
              <div className="flex items-center gap-1.5 w-full mt-1">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  maxLength={40}
                  className="flex-1 bg-slate-950 border border-indigo-500 rounded-xl px-3 py-1.5 text-base sm:text-xs text-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={renameGroup.isPending}
                  className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  {renameGroup.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false);
                    setEditedName(conversation.name || "");
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5 group">
                <h4 className="text-base font-bold text-white tracking-tight">
                  {conversation.name}
                </h4>
                {isAdmin && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    title="Rename Group"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-300 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Creation Meta */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-1.5">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>
                Created{" "}
                {(() => {
                  const rawDate = conversation.createdAt || conversation.updatedAt;
                  if (!rawDate) return "Recently";
                  try {
                    const d = new Date(rawDate);
                    return isNaN(d.getTime()) ? "Recently" : format(d, "MMMM d, yyyy");
                  } catch {
                    return "Recently";
                  }
                })()}
              </span>
            </div>
          </div>

          {/* Members Section */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Participants ({conversation.participants?.length || 0})
              </span>

              {isAdmin && (
                <button
                  onClick={() => setIsAddMembersOpen(true)}
                  className="px-2.5 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-semibold transition active:scale-95 flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              )}
            </div>

            {/* Member List Component */}
            <GroupMemberList
              participants={conversation.participants || []}
              admins={conversation.admins || []}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onPromoteAdmin={handlePromoteAdmin}
              onRemoveMember={handleRemoveMember}
            />
          </div>

          {/* Leave Group Action */}
          <div className="pt-4 border-t border-slate-800/80">
            {isConfirmingLeave ? (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Leave &ldquo;{conversation.name}&rdquo;?</span>
                </div>
                <p className="text-[11px] text-rose-300/80 leading-relaxed">
                  You will no longer receive new messages or participate in this group conversation.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleLeaveGroup}
                    disabled={leaveGroup.isPending}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow"
                  >
                    {leaveGroup.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Yes, Leave</span>
                    )}
                  </button>
                  <button
                    onClick={() => setIsConfirmingLeave(false)}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirmingLeave(true)}
                className="w-full py-2.5 px-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Leave Group</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Add Members Modal */}
      <AddMembersModal
        isOpen={isAddMembersOpen}
        onClose={() => setIsAddMembersOpen(false)}
        conversationId={conversation._id}
        existingParticipantIds={
          conversation.participants?.map((p) => p._id) || []
        }
      />
    </>
  );
}
