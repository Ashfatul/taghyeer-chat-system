"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, RefreshCw, Zap, ArrowDown, Users, CheckCheck } from "lucide-react";
import UserAvatar from "../chat/UserAvatar";
import { cn } from "@/lib/utils/cn";

interface SimMessage {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  time: string;
  isMe: boolean;
}

const INITIAL_MESSAGES: SimMessage[] = [
  {
    id: "1",
    sender: "alex",
    senderName: "Alex Mercer",
    text: "Hey Sarah! Are the real-time WebSocket events configured?",
    time: "10:30 AM",
    isMe: false,
  },
  {
    id: "2",
    sender: "sarah",
    senderName: "Sarah Connor",
    text: "Yes! Sub-millisecond latency via Socket.io v4 with optimistic UI rendering.",
    time: "10:32 AM",
    isMe: true,
  },
  {
    id: "3",
    sender: "alex",
    senderName: "Alex Mercer",
    text: "Awesome! The auto-scroll physics and group admin controls feel super smooth. 🔥",
    time: "10:33 AM",
    isMe: false,
  },
];

const INBOUND_REPLIES = [
  "Just tested with two browser sessions — instant sync without page refresh!",
  "The non-disruptive scroll threshold is genius. My reading position stays locked.",
  "Group admin promotions update the member list in real time! ✨",
  "Zero password friction: login automatically created my new account.",
];

export default function InteractiveMiniChat() {
  const [messages, setMessages] = useState<SimMessage[]>(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatMode, setChatMode] = useState<"direct" | "group">("direct");
  const streamRef = useRef<HTMLDivElement | null>(null);

  const isNearBottom = () => {
    const el = streamRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= 60;
  };

  const scrollToBottom = (smooth = true) => {
    if (streamRef.current) {
      streamRef.current.scrollTo({
        top: streamRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "instant",
      });
      setUnreadCount(0);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputVal.trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg: SimMessage = {
      id: `sim_${Date.now()}`,
      sender: "sarah",
      senderName: "Sarah Connor",
      text,
      time,
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal("");
    setTimeout(() => scrollToBottom(true), 50);
  };

  const triggerInboundReply = () => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const replyText = INBOUND_REPLIES[Math.floor(Math.random() * INBOUND_REPLIES.length)];
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const newMsg: SimMessage = {
        id: `sim_${Date.now()}`,
        sender: chatMode === "group" && Math.random() > 0.5 ? "maya" : "alex",
        senderName: chatMode === "group" && Math.random() > 0.5 ? "Maya Lin" : "Alex Mercer",
        text: replyText,
        time,
        isMe: false,
      };

      const atBottom = isNearBottom();
      setMessages((prev) => [...prev, newMsg]);

      if (atBottom) {
        setTimeout(() => scrollToBottom(true), 50);
      } else {
        setUnreadCount((c) => c + 1);
      }
    }, 1000);
  };

  const testScrollLock = () => {
    const fillers: SimMessage[] = [
      {
        id: `fill_1_${Date.now()}`,
        sender: "alex",
        senderName: "Alex Mercer",
        text: "📜 Simulating conversation history batch 1...",
        time: "10:15 AM",
        isMe: false,
      },
      {
        id: `fill_2_${Date.now()}`,
        sender: "maya",
        senderName: "Maya Lin",
        text: "📜 Simulating conversation history batch 2...",
        time: "10:18 AM",
        isMe: false,
      },
    ];

    setMessages((prev) => [...fillers, ...prev]);
    if (streamRef.current) {
      streamRef.current.scrollTop = 50; // scroll up to test unread bounce
    }
    setTimeout(triggerInboundReply, 300);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setUnreadCount(0);
    setIsTyping(false);
    setTimeout(() => scrollToBottom(false), 50);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col select-none">
      {/* Simulator Control Toolbar */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-tight">Interactive Live Sandbox</span>
          <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">
            Direct & Group Simulator
          </span>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={triggerInboundReply}
            disabled={isTyping}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition active:scale-95 shadow-sm disabled:opacity-40"
          >
            <Zap className="w-3 h-3" />
            <span>Simulate Reply</span>
          </button>

          <button
            onClick={testScrollLock}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
            title="Scroll up and simulate incoming message to test unread floating badge"
          >
            Test Scroll Lock
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs transition"
            title="Reset Simulator"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mini Chat Window */}
      <div className="flex flex-col h-[400px] sm:h-[440px] bg-[#0B0F19] relative">
        {/* Header */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserAvatar
              name={chatMode === "group" ? "Product Squad" : "Alex Mercer"}
              userId={chatMode === "group" ? undefined : "alex_id"}
              isGroup={chatMode === "group"}
              size="sm"
              showOnline={true}
              isOnline={true}
            />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                {chatMode === "group" ? "Product Squad" : "Alex Mercer"}
                {chatMode === "group" && (
                  <span className="text-[10px] text-violet-300 font-mono bg-violet-500/15 px-1.5 rounded">
                    3 members
                  </span>
                )}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">
                ● Live WebSocket Sync (24ms)
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setChatMode("direct")}
              className={cn(
                "px-2 py-0.5 rounded-lg text-[10px] font-semibold transition",
                chatMode === "direct" ? "bg-indigo-600 text-white" : "text-slate-400"
              )}
            >
              Direct
            </button>
            <button
              onClick={() => setChatMode("group")}
              className={cn(
                "px-2 py-0.5 rounded-lg text-[10px] font-semibold transition",
                chatMode === "group" ? "bg-indigo-600 text-white" : "text-slate-400"
              )}
            >
              Group
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div
          ref={streamRef}
          onScroll={() => {
            if (isNearBottom()) setUnreadCount(0);
          }}
          className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
        >
          {/* Date Divider */}
          <div className="flex justify-center">
            <span className="bg-slate-900/90 border border-slate-800 text-slate-400 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
              Today, August 21, 2026
            </span>
          </div>

          {/* Messages */}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex items-end gap-2 max-w-[85%] animate-fade-in",
                m.isMe ? "ml-auto justify-end" : "justify-start"
              )}
            >
              {!m.isMe && (
                <UserAvatar name={m.senderName} userId={m.sender} size="xs" />
              )}

              <div className="flex flex-col">
                {!m.isMe && chatMode === "group" && (
                  <span className="text-[10px] font-bold text-indigo-400 ml-1 mb-0.5">
                    {m.senderName}
                  </span>
                )}

                <div
                  className={cn(
                    "px-3.5 py-2 text-xs leading-relaxed break-words",
                    m.isMe
                      ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-2xl rounded-br-xs shadow-md shadow-indigo-500/10"
                      : "bg-slate-800/90 border border-slate-700/70 text-slate-100 rounded-2xl rounded-bl-xs shadow-sm"
                  )}
                >
                  <div>{m.text}</div>
                  <div
                    className={cn(
                      "flex items-center justify-end gap-1 text-[9px] font-mono mt-0.5",
                      m.isMe ? "text-indigo-200" : "text-slate-400"
                    )}
                  >
                    <span>{m.time}</span>
                    {m.isMe && <CheckCheck className="w-3 h-3 text-indigo-200" />}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs pl-2 animate-fade-in">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
                AM
              </div>
              <div className="bg-slate-800/80 px-3 py-1.5 rounded-2xl rounded-bl-xs border border-slate-700/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Floating Jump-to-Bottom Badge */}
        {unreadCount > 0 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20">
            <button
              onClick={() => scrollToBottom(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-indigo-400/40 flex items-center gap-1.5 animate-bounce"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>{unreadCount} New Message{unreadCount > 1 ? "s" : ""}</span>
            </button>
          </div>
        )}

        {/* Composer Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type a simulated message... (Press Enter)"
            className="flex-1 h-10 bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition active:scale-95 disabled:opacity-40 flex items-center justify-center gap-1 shrink-0 shadow-sm"
          >
            <span>Send</span>
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
}
