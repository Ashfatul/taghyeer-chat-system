"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  getConversations,
  startDirectConversation,
  createGroupConversation,
} from "@/lib/api/conversations";
import { Conversation, CreateGroupPayload, Message } from "@/lib/types";
import { getSocket } from "@/lib/socket/socket";
import { useAuth } from "@/context/AuthContext";

export const CONVERSATIONS_QUERY_KEY = ["conversations"];

export function useConversations() {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const query = useQuery<Conversation[]>({
    queryKey: CONVERSATIONS_QUERY_KEY,
    queryFn: getConversations,
    enabled: isAuthenticated,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Real-time socket sync for conversation list
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (!socket) return;

    // When a new message is received globally
    const handleNewMessage = (newMessage: any) => {
      const msgConvId =
        typeof newMessage.conversation === "string"
          ? newMessage.conversation
          : newMessage.conversation?._id;

      const normalizedCreatedAt =
        typeof newMessage.createdAt === "number"
          ? new Date(newMessage.createdAt).toISOString()
          : newMessage.createdAt || new Date().toISOString();

      queryClient.setQueryData<Conversation[]>(CONVERSATIONS_QUERY_KEY, (oldData = []) => {
        const conversationIndex = oldData.findIndex(
          (c) => c._id === msgConvId
        );

        const senderId =
          typeof newMessage.sender === "string"
            ? newMessage.sender
            : newMessage.sender?._id;

        const updatedLastMessage = {
          text: newMessage.text,
          sender: senderId,
          createdAt: normalizedCreatedAt,
        };

        if (conversationIndex === -1) {
          // New conversation received from outside — refetch list
          queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
          return oldData;
        }

        const isFromMe = senderId === user?._id;
        const currentUnread = oldData[conversationIndex].unreadCount || 0;
        const newUnread = isFromMe ? 0 : currentUnread + 1;

        const updatedConversation: Conversation = {
          ...oldData[conversationIndex],
          lastMessage: updatedLastMessage,
          updatedAt: normalizedCreatedAt,
          unreadCount: newUnread,
        };

        // Move active conversation to the top
        const rest = oldData.filter((_, idx) => idx !== conversationIndex);
        return [updatedConversation, ...rest];
      });
    };

    // When a conversation is updated (title renamed, members added/removed)
    const handleConversationUpdated = (updatedConversation: Conversation) => {
      queryClient.setQueryData<Conversation[]>(CONVERSATIONS_QUERY_KEY, (oldData = []) => {
        const exists = oldData.some((c) => c._id === updatedConversation._id);
        if (!exists) {
          return [updatedConversation, ...oldData];
        }
        return oldData.map((c) =>
          c._id === updatedConversation._id ? updatedConversation : c
        );
      });
    };

    socket.on("message:new", handleNewMessage);
    socket.on("conversation:updated", handleConversationUpdated);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("conversation:updated", handleConversationUpdated);
    };
  }, [isAuthenticated, queryClient, user]);

  return query;
}

/**
 * Helper to mark a specific conversation as read (clears unread badge in sidebar)
 */
export function markConversationAsRead(queryClient: ReturnType<typeof useQueryClient>, conversationId: string) {
  queryClient.setQueryData<Conversation[]>(CONVERSATIONS_QUERY_KEY, (oldData = []) => {
    return oldData.map((c) =>
      c._id === conversationId ? { ...c, unreadCount: 0 } : c
    );
  });
}

export function useStartDirectConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => startDirectConversation(userId),
    onSuccess: (newConversation) => {
      queryClient.setQueryData<Conversation[]>(CONVERSATIONS_QUERY_KEY, (oldData = []) => {
        const existing = oldData.find((c) => c._id === newConversation._id);
        if (existing) {
          return oldData;
        }
        return [newConversation, ...oldData];
      });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });
}

export function useCreateGroupConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGroupPayload) => createGroupConversation(payload),
    onSuccess: (newGroup) => {
      queryClient.setQueryData<Conversation[]>(CONVERSATIONS_QUERY_KEY, (oldData = []) => {
        const existing = oldData.find((c) => c._id === newGroup._id);
        if (existing) {
          return oldData;
        }
        return [newGroup, ...oldData];
      });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });
}
