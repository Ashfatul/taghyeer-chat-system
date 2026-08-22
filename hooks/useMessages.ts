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
        const msgId = msg._id || (msg as any).id || msg.tempId;
        const key =
          msgId ||
          `${msg.text}_${typeof msg.createdAt === "number" ? msg.createdAt : new Date(msg.createdAt).getTime()}`;

        if (map.has(key)) {
          const existing = map.get(key)!;
          // Prefer delivered/sent status over optimistic sending
          if (existing.status === "sending" && msg.status !== "sending") {
            map.set(key, msg);
          }
        } else {
          map.set(key, msg);
        }
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

    const handleNewMessage = (rawMessage: any) => {
      const msgConvId =
        typeof rawMessage.conversation === "string"
          ? rawMessage.conversation
          : rawMessage.conversation?._id;

      if (msgConvId !== conversationId) return;

      const messageId = rawMessage._id || rawMessage.id;
      const normalizedCreatedAt =
        typeof rawMessage.createdAt === "number"
          ? new Date(rawMessage.createdAt).toISOString()
          : rawMessage.createdAt || new Date().toISOString();

      const normalizedMessage: Message = {
        ...rawMessage,
        _id: messageId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        createdAt: normalizedCreatedAt,
        status: "delivered",
      };

      queryClient.setQueryData<{ pages: MessagesListResponse[]; pageParams: unknown[] }>(
        getMessagesQueryKey(conversationId),
        (oldData) => {
          if (!oldData || oldData.pages.length === 0) {
            return {
              pages: [{ messages: [normalizedMessage], hasMore: false }],
              pageParams: [undefined],
            };
          }

          // Check if message is already present by exact server ID
          let alreadyExists = false;
          let matchedOptimistic = false;

          for (const page of oldData.pages) {
            for (const m of page.messages) {
              const mId = m._id || (m as any).id;
              if (mId && messageId && mId === messageId) {
                alreadyExists = true;
                break;
              }
              // Only match tempId if it was sent by me (optimistic send)
              if (
                m.tempId &&
                m.status === "sending" &&
                m.text === normalizedMessage.text &&
                Math.abs(new Date(m.createdAt).getTime() - new Date(normalizedMessage.createdAt).getTime()) < 15000
              ) {
                matchedOptimistic = true;
                break;
              }
            }
            if (alreadyExists || matchedOptimistic) break;
          }

          if (alreadyExists) {
            // Already present with exact _id, update in place
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                messages: page.messages.map((m) => {
                  const mId = m._id || (m as any).id;
                  return mId === messageId ? normalizedMessage : m;
                }),
              })),
            };
          }

          if (matchedOptimistic) {
            // Replace the optimistic message with the confirmed socket message
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                messages: page.messages.map((m) => {
                  if (
                    m.tempId &&
                    m.status === "sending" &&
                    m.text === normalizedMessage.text &&
                    Math.abs(new Date(m.createdAt).getTime() - new Date(normalizedMessage.createdAt).getTime()) < 15000
                  ) {
                    return normalizedMessage;
                  }
                  return m;
                }),
              })),
            };
          }

          // Brand new message from another user (or receiver end): APPEND to Page 0
          const updatedPages = [...oldData.pages];
          updatedPages[0] = {
            ...updatedPages[0],
            messages: [...updatedPages[0].messages, normalizedMessage],
          };

          const senderId =
            typeof normalizedMessage.sender === "string"
              ? normalizedMessage.sender
              : normalizedMessage.sender?._id;
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
    onSuccess: (savedMessage: any, text, context) => {
      const messageId = savedMessage._id || savedMessage.id;
      const normalizedCreatedAt =
        typeof savedMessage.createdAt === "number"
          ? new Date(savedMessage.createdAt).toISOString()
          : savedMessage.createdAt || new Date().toISOString();

      const confirmedMessage: Message = {
        ...savedMessage,
        _id: messageId || context?.tempId,
        createdAt: normalizedCreatedAt,
        status: "sent",
      };

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
                (context?.tempId && (m.tempId === context.tempId || m._id === context.tempId)) ||
                (messageId && (m._id === messageId || (m as any).id === messageId))
                  ? confirmedMessage
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
