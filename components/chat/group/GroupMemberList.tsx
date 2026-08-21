"use client";

import React, { useState } from "react";
import { User } from "@/lib/types";
import UserAvatar from "../UserAvatar";
import { formatPhoneNumber } from "@/lib/utils/colors";
import { ShieldCheck, MoreVertical, UserMinus, ShieldAlert, Check } from "lucide-react";

interface GroupMemberListProps {
  participants: User[];
  admins: string[];
  currentUserId?: string;
  isAdmin: boolean;
  onPromoteAdmin: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
}

export default function GroupMemberList({
  participants,
  admins,
  currentUserId,
  isAdmin,
  onPromoteAdmin,
  onRemoveMember,
}: GroupMemberListProps) {
  const [openDropdownUserId, setOpenDropdownUserId] = useState<string | null>(null);
  const [confirmRemoveUserId, setConfirmRemoveUserId] = useState<string | null>(null);

  const handleToggleDropdown = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownUserId((prev) => (prev === userId ? null : userId));
    setConfirmRemoveUserId(null);
  };

  return (
    <div className="space-y-1">
      {participants.map((member) => {
        const isMemberAdmin = admins.includes(member._id);
        const isMe = member._id === currentUserId;
        const isDropdownOpen = openDropdownUserId === member._id;
        const isConfirmingRemove = confirmRemoveUserId === member._id;

        return (
          <div
            key={member._id}
            className="p-2.5 rounded-2xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 flex items-center justify-between gap-3 transition relative group"
          >
            {/* User Details */}
            <div className="flex items-center gap-2.5 min-w-0">
              <UserAvatar name={member.name} userId={member._id} size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-100 truncate">
                    {member.name}
                  </span>
                  {isMe && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300">
                      You
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {formatPhoneNumber(member.phone)}
                </div>
              </div>
            </div>

            {/* Badges & Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Admin Badge */}
              {isMemberAdmin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-[10px] font-semibold text-violet-300">
                  <ShieldCheck className="w-3 h-3 text-violet-400" />
                  <span>Admin</span>
                </span>
              )}

              {/* Admin Dropdown Actions (Only for admins managing other members) */}
              {isAdmin && !isMe && (
                <div className="relative">
                  <button
                    onClick={(e) => handleToggleDropdown(member._id, e)}
                    className="w-7 h-7 rounded-lg hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 flex items-center justify-center transition"
                    title="Member actions"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <>
                      {/* Click outside backdrop */}
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => {
                          setOpenDropdownUserId(null);
                          setConfirmRemoveUserId(null);
                        }}
                      />

                      <div className="absolute right-0 top-8 w-48 bg-slate-900 border border-slate-700/90 rounded-2xl p-1.5 shadow-2xl z-30 animate-fade-in backdrop-blur-xl">
                        {!isMemberAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPromoteAdmin(member._id);
                              setOpenDropdownUserId(null);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-violet-300 flex items-center gap-2 transition"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                            <span>Make Group Admin</span>
                          </button>
                        )}

                        {isConfirmingRemove ? (
                          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] space-y-1.5">
                            <div className="font-semibold flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5" /> Remove member?
                            </div>
                            <div className="flex gap-1.5 mt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveMember(member._id);
                                  setOpenDropdownUserId(null);
                                  setConfirmRemoveUserId(null);
                                }}
                                className="flex-1 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold text-center transition"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmRemoveUserId(null);
                                }}
                                className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] text-center transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmRemoveUserId(member._id);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 flex items-center gap-2 transition"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>Remove from Group</span>
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
