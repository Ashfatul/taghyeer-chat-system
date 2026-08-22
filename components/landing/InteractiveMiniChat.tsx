"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, RefreshCw, Zap, ArrowDown, Users, CheckCheck } from "lucide-react";
import UserAvatar from "../chat/UserAvatar";
import { cn } from "@/lib/utils/cn";
import { hashToHsl } from "@/lib/utils/colors";

interface SimMessage {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  time: string;
  isMe: boolean;
}

const DIRECT_MESSAGES: SimMessage[] = [
  {
    id: "d1",
    sender: "alex",
    senderName: "Alex Mercer",
    text: "Hey Sarah! Are the real-time WebSocket events configured?",
    time: "10:30 AM",
    isMe: false,
  },
  {
    id: "d2",
    sender: "sarah",
    senderName: "Sarah Connor",
    text: "Yes! Sub-millisecond latency via Socket.io v4 with optimistic UI rendering.",
    time: "10:32 AM",
    isMe: true,
  },
  {
    id: "d3",
    sender: "alex",
    senderName: "Alex Mercer",
    text: "Awesome! The auto-scroll physics and group admin controls feel super smooth. 🔥",
    time: "10:33 AM",
    isMe: false,
  },
];

const GROUP_MESSAGES: SimMessage[] = [
  {
    id: "g1",
    sender: "alex",
    senderName: "Alex Mercer",
    text: "Has everyone tested the multi-participant real-time sync?",
    time: "10:28 AM",
    isMe: false,
  },
  {
    id: "g2",
    sender: "maya",
    senderName: "Maya Lin",
    text: "Verified! The admin controls, member roster, and typing indicators are live.",
    time: "10:30 AM",
    isMe: false,
  },
  {
    id: "g3",
    sender: "sarah",
    senderName: "Sarah Connor",
    text: "Optimistic updates and unread highlights are active across all threads too! 🚀",
    time: "10:32 AM",
    isMe: true,
  },
  {
    id: "g4",
    sender: "alex",
    senderName: "Alex Mercer",
    text: "Everything is rock-solid. Ready for demo! ✨",
    time: "10:33 AM",
    isMe: false,
  },
];

const INBOUND_DIRECT_REPLIES = [
  "Just tested with two browser sessions — instant sync without page refresh!",
  "The non-disruptive scroll threshold is genius. My reading position stays locked.",
  "Zero password friction: login automatically created my new account.",
  "Search with debouncing finds users instantly across 1,000+ records! ⚡",
];

const INBOUND_GROUP_REPLIES = [
  { sender: "alex", senderName: "Alex Mercer", text: "Promoted Maya to admin — permissions synced in real time!" },
  { sender: "maya", senderName: "Maya Lin", text: "Got the notification! Added 2 new members to the squad." },
  { sender: "alex", senderName: "Alex Mercer", text: "Group info drawer and member management look super clean. 💎" },
  { sender: "maya", senderName: "Maya Lin", text: "All delivery ticks and unread counters are operating smoothly!" },
];

export default function InteractiveMiniChat() {
  const [chatMode, setChatMode] = useState<"direct" | "group">("direct");
  const [messages, setMessages] = useState<SimMessage[]>(DIRECT_MESSAGES);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("Alex Mercer");
  const [unreadCount, setUnreadCount] = useState(0);
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

  const handleSwitchMode = (mode: "direct" | "group") => {
    setChatMode(mode);
    setMessages(mode === "group" ? GROUP_MESSAGES : DIRECT_MESSAGES);
    setUnreadCount(0);
    setIsTyping(false);
    setTimeout(() => scrollToBottom(false), 50);
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
    const isGroup = chatMode === "group";
    const chosenTypingName = isGroup && Math.random() > 0.5 ? "Maya Lin" : "Alex Mercer";
    setTypingUser(chosenTypingName);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      let newMsg: SimMessage;
      if (isGroup) {
        const item = INBOUND_GROUP_REPLIES[Math.floor(Math.random() * INBOUND_GROUP_REPLIES.length)];
        newMsg = {
          id: `sim_${Date.now()}`,
          sender: item.sender,
          senderName: item.senderName,
          text: item.text,
          time,
          isMe: false,
        };
      } else {
        const replyText = INBOUND_DIRECT_REPLIES[Math.floor(Math.random() * INBOUND_DIRECT_REPLIES.length)];
        newMsg = {
          id: `sim_${Date.now()}`,
          sender: "alex",
          senderName: "Alex Mercer",
          text: replyText,
          time,
          isMe: false,
        };
      }

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
        text: "📜 Earlier message: Real-time sync verified on port 3000.",
        time: "10:15 AM",
        isMe: false,
      },
      {
        id: `fill_2_${Date.now()}`,
        sender: "maya",
        senderName: "Maya Lin",
        text: "📜 Earlier message: Audio chime synthesizer configured.",
        time: "10:18 AM",
        isMe: false,
      },
    ];

    setMessages((prev) => [...fillers, ...prev]);
    if (streamRef.current) {
      streamRef.current.scrollTop = 40; // scroll up to test unread bounce
    }
    setTimeout(triggerInboundReply, 300);
  };

  const handleReset = () => {
    setMessages(chatMode === "group" ? GROUP_MESSAGES : DIRECT_MESSAGES);
    setUnreadCount(0);
    setIsTyping(false);
    setTimeout(() => scrollToBottom(false), 50);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col select-none text-left">
      {/* Simulator Control Toolbar */}
      <div className="p-2.5 sm:p-3 bg-slate-950/90 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-xs font-bold text-white tracking-tight truncate">
            Interactive Live Sandbox
          </span>
          <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono shrink-0 hidden xs:inline-block sm:inline-block">
            Direct & Group Simulator
          </span>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
          <button
            onClick={triggerInboundReply}
            disabled={isTyping}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition active:scale-95 shadow-sm disabled:opacity-40 whitespace-nowrap"
          >
            <Zap className="w-3 h-3 shrink-0" />
            <span className="hidden sm:inline">Simulate Reply</span>
            <span className="sm:hidden">Simulate</span>
          </button>

          <button
            onClick={testScrollLock}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition whitespace-nowrap"
            title="Scroll up and simulate incoming message to test unread floating badge"
          >
            <span className="hidden sm:inline">Test Scroll Lock</span>
            <span className="sm:hidden">Scroll Lock</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs transition shrink-0"
            title="Reset Simulator"
            aria-label="Reset Simulator"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mini Chat Window */}
      <div className="flex flex-col h-[400px] sm:h-[440px] bg-[#0B0F19] relative text-left">
        {/* Header matching real ChatHeader */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="shrink-0">
              <UserAvatar
                name={chatMode === "group" ? "Engineering Core" : "Alex Mercer"}
                userId={chatMode === "group" ? undefined : "alex_id"}
                isGroup={chatMode === "group"}
                size="md"
                showOnline={true}
                isOnline={true}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-bold text-white truncate">
                  {chatMode === "group" ? "Engineering Core" : "Alex Mercer"}
                </span>
                {chatMode === "group" && (
                  <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 font-mono font-medium shrink-0">
                    Group
                  </span>
                )}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-400 font-mono">
                {chatMode === "group" ? (
                  <p className="truncate text-slate-400">Alex Mercer, Maya Lin, Sarah Connor (You)</p>
                ) : (
                  <div className="text-emerald-400 flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    <span className="truncate">
                      Active now
                      <span className="hidden sm:inline"> • +1 (202) 555-0102</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => handleSwitchMode("direct")}
              className={cn(
                "px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition",
                chatMode === "direct" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              Direct
            </button>
            <button
              onClick={() => handleSwitchMode("group")}
              className={cn(
                "px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition",
                chatMode === "group" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
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
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 custom-scrollbar text-left"
        >
          {/* Date Divider */}
          <div className="flex justify-center my-1.5 sm:my-2">
            <span className="bg-slate-900/90 border border-slate-800 text-slate-400 text-[10px] font-semibold px-3 py-0.5 sm:py-1 rounded-full shadow-sm select-none backdrop-blur-md">
              Today
            </span>
          </div>

          {/* Messages */}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex items-end gap-1.5 sm:gap-2 max-w-[90%] sm:max-w-[75%] animate-fade-in group relative",
                m.isMe ? "ml-auto justify-end" : "justify-start"
              )}
            >
              {!m.isMe && (
                <div className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 mb-0.5 select-none">
                  <UserAvatar name={m.senderName} userId={m.sender} size="xs" />
                </div>
              )}

              <div className="flex flex-col relative min-w-0 text-left">
                {/* Group Sender Name with HSL deterministic styling */}
                {!m.isMe && chatMode === "group" && (
                  <span
                    className="text-[10px] sm:text-[11px] font-bold mb-0.5 ml-1 select-none flex items-center gap-1 text-left truncate max-w-[200px]"
                    style={{ color: hashToHsl(m.senderName).text }}
                  >
                    {m.senderName}
                  </span>
                )}

                {/* Bubble Body */}
                <div
                  className={cn(
                    "relative px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-sm text-xs sm:text-sm leading-relaxed [overflow-wrap:anywhere] break-words whitespace-pre-wrap select-text text-left transition-all",
                    m.isMe
                      ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-2xl rounded-br-xs shadow-indigo-500/10"
                      : "bg-slate-800/90 border border-slate-700/70 text-slate-100 rounded-2xl rounded-bl-xs shadow-black/10"
                  )}
                >
                  <div className="pr-1 text-left">{m.text}</div>
                  <div
                    className={cn(
                      "flex items-center justify-end gap-1 mt-1 text-[10px] font-mono select-none",
                      m.isMe ? "text-indigo-200/90" : "text-slate-400"
                    )}
                  >
                    <span>{m.time}</span>
                    {m.isMe && <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs pl-1 animate-fade-in text-left">
              <div className="w-6 h-6 sm:w-7 sm:h-7 shrink-0">
                <UserAvatar name={typingUser} size="xs" />
              </div>
              <div className="bg-slate-800/80 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl rounded-bl-xs border border-slate-700/60 flex items-center gap-1.5">
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
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-lg border border-indigo-400/40 flex items-center gap-1.5 whitespace-nowrap animate-bounce"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>{unreadCount} New Message{unreadCount > 1 ? "s" : ""}</span>
            </button>
          </div>
        )}

        {/* Composer Bar with uniform base heights */}
        <form
          onSubmit={handleSendMessage}
          className="p-2.5 sm:p-3 border-t border-slate-800/80 bg-slate-900/90 backdrop-blur-md flex items-center gap-2 text-left"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type a simulated message..."
            className="flex-1 h-10 sm:h-11 bg-slate-950 border border-slate-800 rounded-xl px-3.5 sm:px-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition text-left min-w-0"
          />
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="h-10 sm:h-11 px-3.5 sm:px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-semibold transition active:scale-95 disabled:opacity-40 flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-indigo-500/20"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
