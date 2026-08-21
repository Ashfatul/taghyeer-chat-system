"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Message } from "@/lib/types";

interface UseSmartScrollOptions {
  messages: Message[];
  currentUserId?: string;
  conversationId?: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isFetchingMore?: boolean;
}

const BOTTOM_THRESHOLD_PX = 120;
const TOP_LOAD_THRESHOLD_PX = 80;

export function useSmartScroll({
  messages,
  currentUserId,
  conversationId,
  onLoadMore,
  hasMore,
  isFetchingMore,
}: UseSmartScrollOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const prevMessagesLengthRef = useRef(messages.length);
  const prevScrollHeightRef = useRef<number>(0);
  const prevConversationIdRef = useRef(conversationId);

  // Check if viewport is near the bottom
  const checkIsNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_THRESHOLD_PX;
  }, []);

  // Smooth scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    const el = containerRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? "smooth" : "instant",
    });

    setIsAtBottom(true);
    setUnreadCount(0);
  }, []);

  // Handle scroll events on the container
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const nearBottom = checkIsNearBottom();
    setIsAtBottom(nearBottom);

    if (nearBottom) {
      setUnreadCount(0);
    }

    // Check if scrolled near the top to load older history
    if (el.scrollTop <= TOP_LOAD_THRESHOLD_PX && hasMore && !isFetchingMore && onLoadMore) {
      prevScrollHeightRef.current = el.scrollHeight;
      onLoadMore();
    }
  }, [checkIsNearBottom, hasMore, isFetchingMore, onLoadMore]);

  // Adjust scroll position after loading older messages to prevent layout jumping
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (prevScrollHeightRef.current > 0 && el.scrollHeight > prevScrollHeightRef.current) {
      const diff = el.scrollHeight - prevScrollHeightRef.current;
      el.scrollTop += diff;
      prevScrollHeightRef.current = 0;
    }
  }, [messages.length]);

  // Handle active conversation change -> reset and jump to bottom
  useEffect(() => {
    if (conversationId !== prevConversationIdRef.current) {
      prevConversationIdRef.current = conversationId;
      setUnreadCount(0);
      setIsAtBottom(true);
      // Immediate jump to bottom
      requestAnimationFrame(() => {
        scrollToBottom(false);
      });
    }
  }, [conversationId, scrollToBottom]);

  // Handle new incoming vs outgoing messages
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prevLen = prevMessagesLengthRef.current;
    const currentLen = messages.length;
    prevMessagesLengthRef.current = currentLen;

    if (currentLen > prevLen) {
      const lastMessage = messages[messages.length - 1];
      const senderId =
        typeof lastMessage?.sender === "string"
          ? lastMessage.sender
          : lastMessage?.sender?._id;

      const isSentByMe = senderId === currentUserId || lastMessage?.status === "sending";

      if (isSentByMe) {
        // User sent a message -> always scroll down to see it
        requestAnimationFrame(() => scrollToBottom(true));
      } else {
        // Incoming message from other participant
        if (isAtBottom) {
          requestAnimationFrame(() => scrollToBottom(true));
        } else {
          // User is reading history -> do NOT disrupt scroll position, show badge
          setUnreadCount((prev) => prev + 1);
        }
      }
    }
  }, [messages, currentUserId, isAtBottom, scrollToBottom]);

  return {
    containerRef,
    isAtBottom,
    unreadCount,
    scrollToBottom,
    handleScroll,
  };
}
