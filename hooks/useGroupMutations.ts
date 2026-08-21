"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  renameGroup,
  addParticipants,
  removeParticipant,
  promoteAdmin,
} from "@/lib/api/conversations";
import { Conversation, GroupConversation } from "@/lib/types";
import { CONVERSATIONS_QUERY_KEY } from "./useConversations";

export function useGroupMutations(conversationId: string) {
  const queryClient = useQueryClient();

  const updateConversationCache = (updatedGroup: GroupConversation) => {
    queryClient.setQueryData<Conversation[]>(CONVERSATIONS_QUERY_KEY, (oldData = []) => {
      return oldData.map((c) => (c._id === updatedGroup._id ? updatedGroup : c));
    });
    queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
  };

  const renameMutation = useMutation({
    mutationFn: (name: string) => renameGroup(conversationId, { name }),
    onSuccess: (updatedGroup) => {
      updateConversationCache(updatedGroup);
    },
  });

  const addParticipantsMutation = useMutation({
    mutationFn: (userIds: string[]) => addParticipants(conversationId, { userIds }),
    onSuccess: (updatedGroup) => {
      updateConversationCache(updatedGroup);
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: (userId: string) => removeParticipant(conversationId, userId),
    onSuccess: (res) => {
      if (res && typeof res === "object" && "_id" in res) {
        updateConversationCache(res as GroupConversation);
      } else {
        queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
      }
    },
  });

  const promoteAdminMutation = useMutation({
    mutationFn: (userId: string) => promoteAdmin(conversationId, { userId }),
    onSuccess: (updatedGroup) => {
      updateConversationCache(updatedGroup);
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: (myUserId: string) => removeParticipant(conversationId, myUserId),
    onSuccess: () => {
      queryClient.setQueryData<Conversation[]>(CONVERSATIONS_QUERY_KEY, (oldData = []) => {
        return oldData.filter((c) => c._id !== conversationId);
      });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });

  return {
    renameGroup: renameMutation,
    addParticipants: addParticipantsMutation,
    removeParticipant: removeParticipantMutation,
    promoteAdmin: promoteAdminMutation,
    leaveGroup: leaveGroupMutation,
  };
}
