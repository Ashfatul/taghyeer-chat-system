"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, Loader2, Sparkles } from "lucide-react";
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

  // Auto-grow textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, 44), 140);
    textarea.style.height = `${nextHeight}px`;
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
      }
    } finally {
      setIsSending(false);
      // Keep focus on textarea for smooth consecutive messaging
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
    <div className="p-3 bg-slate-900/90 border-t border-slate-800 relative select-none">
      {/* Quick Emoji Bar (Toggled or shown on desktop) */}
      {showEmojiPicker && (
        <div className="mb-2 p-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 overflow-x-auto custom-scrollbar animate-fade-in">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              className="w-8 h-8 rounded-xl hover:bg-slate-800 flex items-center justify-center text-sm hover:scale-110 transition active:scale-95 shrink-0"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Composer Box */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Emoji Toggle Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          title="Quick Emojis"
          className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center transition shrink-0 mb-0.5",
            showEmojiPicker
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
          )}
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Text Area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            disabled={disabled}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none custom-scrollbar leading-relaxed"
            style={{ minHeight: "44px", maxHeight: "140px" }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() || isSending || disabled}
          className="h-10 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-500/25 transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0 mb-0.5"
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
