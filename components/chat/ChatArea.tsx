"use client";

import React, { useCallback } from "react";
import { Conversation, Message } from "@/lib/types";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface ChatAreaProps {
  conversation: Conversation;
  currentUserId?: string;
  onBack?: () => void;
  onToggleGroupInfo?: () => void;
}

export default function ChatArea({
  conversation,
  currentUserId,
  onBack,
  onToggleGroupInfo,
}: ChatAreaProps) {
  const {
    messages,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useMessages(conversation._id);

  const sendMessageMutation = useSendMessage(conversation._id);

  const handleSendMessage = useCallback(
    async (text: string) => {
      await sendMessageMutation.mutateAsync(text);
    },
    [sendMessageMutation]
  );

  const handleRetryMessage = useCallback(
    async (msg: Message) => {
      await sendMessageMutation.mutateAsync(msg.text);
    },
    [sendMessageMutation]
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0F19] relative overflow-hidden">
      {/* Active Conversation Header */}
      <ChatHeader
        conversation={conversation}
        onBack={onBack}
        onToggleGroupInfo={onToggleGroupInfo}
      />

      {/* Virtualized Message Stream with Smart Auto-Scroll */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        conversationId={conversation._id}
        isGroup={conversation.type === "group"}
        participants={
          conversation.type === "group"
            ? conversation.participants
            : conversation.participant
            ? [conversation.participant]
            : []
        }
        isLoading={isLoading}
        hasMore={hasNextPage}
        isFetchingMore={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        onRetryMessage={handleRetryMessage}
      />

      {/* Message Composer Input Bar */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />
    </div>
  );
}
