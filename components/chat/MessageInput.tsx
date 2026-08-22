"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<void> | void;
  disabled?: boolean;
}

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🎉", "🚀", "🔥", "✨", "👏"];

export default function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow textarea height dynamically while preventing spurious scrollbars
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height temporarily to accurately compute scrollHeight
    textarea.style.height = "44px";

    if (!text.trim()) {
      textarea.style.height = "44px";
      textarea.style.overflowY = "hidden";
      return;
    }

    const scrollH = textarea.scrollHeight;
    if (scrollH > 140) {
      textarea.style.height = "140px";
      textarea.style.overflowY = "auto";
    } else if (scrollH > 44) {
      textarea.style.height = `${scrollH}px`;
      textarea.style.overflowY = "hidden";
    } else {
      textarea.style.height = "44px";
      textarea.style.overflowY = "hidden";
    }
  }, [text]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSendMessage(trimmed);
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "44px";
        textareaRef.current.style.overflowY = "hidden";
      }
    } finally {
      setIsSending(false);
      // Keep focus on textarea for seamless conversational typing
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  return (
    <div className="p-3 sm:p-4 pb-safe bg-slate-900/95 border-t border-slate-800/80 backdrop-blur-xl relative select-none">
      {/* Quick Emoji Bar */}
      {showEmojiPicker && (
        <div className="mb-2.5 p-1.5 sm:p-2 rounded-2xl bg-slate-950/90 border border-slate-800/90 flex items-center gap-1.5 overflow-x-auto custom-scrollbar animate-fade-in shadow-xl backdrop-blur-md">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl hover:bg-slate-800 flex items-center justify-center text-sm sm:text-base hover:scale-110 transition active:scale-95 shrink-0"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Composer Form: perfectly aligned with equal 44px base heights */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-2.5">
        {/* Emoji Toggle Button: exact 44px (h-11 w-11) */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          title="Quick Emojis"
          className={cn(
            "w-11 h-11 rounded-2xl flex items-center justify-center transition shrink-0 active:scale-95",
            showEmojiPicker
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "bg-slate-950/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80"
          )}
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Text Area Container: base height 44px (min-h-[44px]) */}
        <div className="flex-1 min-w-0 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled}
            className="w-full bg-slate-950/90 border border-slate-800/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-2xl px-4 py-[10px] text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition resize-none leading-6 min-h-[44px] max-h-[140px] block overflow-hidden custom-scrollbar"
            style={{ height: "44px" }}
          />
        </div>

        {/* Send Button: exact 44px (h-11) */}
        <button
          type="submit"
          disabled={!text.trim() || isSending || disabled}
          className="h-11 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
