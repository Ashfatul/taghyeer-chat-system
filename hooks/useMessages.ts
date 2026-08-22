"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { getConversationMessages } from "@/lib/api/conversations";
import { sendMessage as apiSendMessage } from "@/lib/api/messages";
import { Message, MessagesListResponse, Conversation } from "@/lib/types";
import { getSocket } from "@/lib/socket/socket";
import { useAuth } from "@/context/AuthContext";
import { CONVERSATIONS_QUERY_KEY } from "./useConversations";
import { playSentSound, playReceivedSound } from "@/lib/utils/sound";

export function getMessagesQueryKey(conversationId: string) {
  return ["conversations", conversationId, "messages"];
}

export function useMessages(conversationId: string | null) {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const query = useInfiniteQuery<MessagesListResponse, Error>({
    queryKey: getMessagesQueryKey(conversationId || ""),
    queryFn: async ({ pageParam }) => {
      if (!conversationId) return { messages: [], hasMore: false };
      return getConversationMessages(conversationId, {
        before: pageParam as string | undefined,
        limit: 50,
      });
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || lastPage.messages.length === 0) {
        return undefined;
      }
      // The oldest message in the batch is at index 0 (if sorted asc) or last index
      // Since API returns oldest to newest or newest to oldest, we find the min createdAt
      const timestamps = lastPage.messages.map((m) => new Date(m.createdAt).getTime());
      const minTimestamp = Math.min(...timestamps);
      return new Date(minTimestamp).toISOString();
    },
    enabled: !!conversationId && isAuthenticated,
    staleTime: 1000 * 10, // 10 seconds
  });

  // Flatten and deduplicate all messages into a clean chronological list (oldest to newest)
  const messages = useMemo(() => {
    if (!query.data?.pages) return [];

    const map = new Map<string, Message>();

    // Pages are loaded in reverse pagination order: Page 0 is latest batch, Page 1 is older, etc.
    query.data.pages.forEach((page) => {
      page.messages.forEach((msg) => {
        const key = msg._id || msg.tempId || `${msg.text}_${msg.createdAt}`;
        map.set(key, msg);
      });
    });

    const all = Array.from(map.values());
    // Sort chronologically ascending (oldest first, newest last)
    all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return all;
  }, [query.data?.pages]);

  // Real-time socket sync for this specific conversation
  useEffect(() => {
    if (!conversationId || !isAuthenticated) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (newMessage: Message) => {
      const msgConvId =
        typeof newMessage.conversation === "string"
          ? newMessage.conversation
          : (newMessage.conversation as any)?._id;

      if (msgConvId !== conversationId) return;

      queryClient.setQueryData<{ pages: MessagesListResponse[]; pageParams: unknown[] }>(
        getMessagesQueryKey(conversationId),
        (oldData) => {
          if (!oldData || oldData.pages.length === 0) {
            return {
              pages: [{ messages: [newMessage], hasMore: false }],
              pageParams: [undefined],
            };
          }

          // Check if message is already present (e.g. from optimistic update)
          const alreadyExists = oldData.pages.some((page) =>
            page.messages.some(
              (m) =>
                m._id === newMessage._id ||
                (m.tempId && m.text === newMessage.text && Math.abs(new Date(m.createdAt).getTime() - new Date(newMessage.createdAt).getTime()) < 5000)
            )
          );

          if (alreadyExists) {
            // Replace optimistic message with confirmed message
            return {
              ...oldData,
              pages: oldData.pages.map((page, pIdx) => {
                if (pIdx === 0) {
                  return {
                    ...page,
                    messages: page.messages.map((m) =>
                      m._id === newMessage._id ||
                      (m.tempId && m.text === newMessage.text)
                        ? { ...newMessage, status: "delivered" }
                        : m
                    ),
                  };
                }
                return page;
              }),
            };
          }

          // Append new incoming message to latest page (Page 0)
          const updatedPages = [...oldData.pages];
          updatedPages[0] = {
            ...updatedPages[0],
            messages: [...updatedPages[0].messages, { ...newMessage, status: "delivered" }],
          };

          const senderId =
            typeof newMessage.sender === "string"
              ? newMessage.sender
              : newMessage.sender?._id;
          if (senderId !== user?._id) {
            playReceivedSound();
          }

          return {
            ...oldData,
            pages: updatedPages,
          };
        }
      );
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [conversationId, isAuthenticated, queryClient, user?._id]);

  return {
    ...query,
    messages,
  };
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (text: string) => {
      return apiSendMessage({ conversationId, text });
    },
    onMutate: async (text: string) => {
      await queryClient.cancelQueries({ queryKey: getMessagesQueryKey(conversationId) });

      const previousData = queryClient.getQueryData<{
        pages: MessagesListResponse[];
        pageParams: unknown[];
      }>(getMessagesQueryKey(conversationId));

      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const optimisticMessage: Message = {
        _id: tempId,
        tempId,
        conversation: conversationId,
        sender: user || { _id: "me", name: "You", phone: "" },
        text,
        createdAt: new Date().toISOString(),
        status: "sending",
      };

      playSentSound();

      // Optimistically update message cache
      queryClient.setQueryData<{ pages: MessagesListResponse[]; pageParams: unknown[] }>(
        getMessagesQueryKey(conversationId),
        (oldData) => {
          if (!oldData || oldData.pages.length === 0) {
            return {
              pages: [{ messages: [optimisticMessage], hasMore: false }],
              pageParams: [undefined],
            };
          }

          const updatedPages = [...oldData.pages];
          updatedPages[0] = {
            ...updatedPages[0],
            messages: [...updatedPages[0].messages, optimisticMessage],
          };

          return {
            ...oldData,
            pages: updatedPages,
          };
        }
      );

      // Optimistically update conversation list's lastMessage
      queryClient.setQueryData<Conversation[]>(CONVERSATIONS_QUERY_KEY, (oldList = []) => {
        const idx = oldList.findIndex((c) => c._id === conversationId);
        if (idx === -1) return oldList;

        const updated: Conversation = {
          ...oldList[idx],
          lastMessage: {
            text,
            sender: user?._id || "me",
            createdAt: optimisticMessage.createdAt,
          },
          updatedAt: optimisticMessage.createdAt,
        };

        const rest = oldList.filter((_, i) => i !== idx);
        return [updated, ...rest];
      });

      return { previousData, tempId };
    },
    onSuccess: (savedMessage, text, context) => {
      // Replace optimistic message with confirmed server message
      queryClient.setQueryData<{ pages: MessagesListResponse[]; pageParams: unknown[] }>(
        getMessagesQueryKey(conversationId),
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m) =>
                m.tempId === context?.tempId || m._id === context?.tempId
                  ? { ...savedMessage, status: "sent" }
                  : m
              ),
            })),
          };
        }
      );
    },
    onError: (err, text, context) => {
      // Mark optimistic message as failed
      queryClient.setQueryData<{ pages: MessagesListResponse[]; pageParams: unknown[] }>(
        getMessagesQueryKey(conversationId),
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m) =>
                m.tempId === context?.tempId || m._id === context?.tempId
                  ? { ...m, status: "failed" }
                  : m
              ),
            })),
          };
        }
      );
    },
  });
}
