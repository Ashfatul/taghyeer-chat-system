"use client";

import React, { useState } from "react";
import {
  Code2,
  Radio,
  Layers,
  ShieldAlert,
  Copy,
  Check,
  ChevronRight,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const REST_ENDPOINTS = [
  {
    method: "POST",
    path: "/api/auth/login",
    auth: "None",
    desc: "Passwordless login / registration",
    body: '{\n  "phone": "+12025550101",\n  "name": "Sarah Connor"\n}',
    response: '{\n  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n  "user": {\n    "_id": "6a8833d9e5d6aac97521f00d",\n    "name": "Sarah Connor",\n    "phone": "+12025550101"\n  }\n}',
  },
  {
    method: "GET",
    path: "/api/conversations",
    auth: "Bearer JWT",
    desc: "List active direct & group conversations",
    body: "No request body (Query parameters)",
    response: '[\n  {\n    "_id": "6a8833e7e5d6aac97521f010",\n    "type": "direct",\n    "participant": {\n      "_id": "6a8833dfe5d6aac97521f00e",\n      "name": "Alex Mercer",\n      "phone": "+15550123456"\n    },\n    "lastMessage": {\n      "text": "Sounds good!",\n      "sender": "6a8833dfe5d6aac97521f00e",\n      "createdAt": "2026-08-21T10:34:00Z"\n    }\n  }\n]',
  },
  {
    method: "POST",
    path: "/api/messages",
    auth: "Bearer JWT",
    desc: "Send a new message to conversation",
    body: '{\n  "conversationId": "6a8833e7e5d6aac97521f010",\n  "text": "Hello from Sarah!"\n}',
    response: '{\n  "_id": "6a883401e5d6aac97521f014",\n  "conversation": "6a8833e7e5d6aac97521f010",\n  "sender": "6a8833d9e5d6aac97521f00d",\n  "text": "Hello from Sarah!",\n  "createdAt": "2026-08-21T10:34:05.120Z"\n}',
  },
  {
    method: "POST",
    path: "/api/conversations/group",
    auth: "Bearer JWT",
    desc: "Create a multi-user group chat",
    body: '{\n  "name": "Design Squad",\n  "participantIds": ["6a8833dfe5d6aac97521f00e", "6a8833e0e5d6aac97521f00f"]\n}',
    response: '{\n  "_id": "6a883420e5d6aac97521f018",\n  "type": "group",\n  "name": "Design Squad",\n  "createdBy": "6a8833d9e5d6aac97521f00d",\n  "admins": ["6a8833d9e5d6aac97521f00d"],\n  "participants": [...]\n}',
  },
  {
    method: "GET",
    path: "/api/users/search",
    auth: "Bearer JWT",
    desc: "Search users by name or phone (Sanitized)",
    body: "GET /api/users/search?q=Sarah",
    response: '[\n  {\n    "_id": "6a8833d9e5d6aac97521f00d",\n    "name": "Sarah Connor",\n    "phone": "+12025550101"\n  }\n]',
  },
];

const SOCKET_EVENTS = [
  {
    event: "message:new",
    direction: "Server → Client (Broadcast)",
    desc: "Emitted when any participant sends a message in a conversation",
    payload: '{\n  "_id": "6a883401e5d6aac97521f014",\n  "conversation": "6a8833e7e5d6aac97521f010",\n  "sender": {\n    "_id": "6a8833d9e5d6aac97521f00d",\n    "name": "Sarah Connor"\n  },\n  "text": "Hello world!",\n  "createdAt": "2026-08-21T10:34:05.120Z"\n}',
  },
  {
    event: "conversation:updated",
    direction: "Server → Client (Broadcast)",
    desc: "Emitted when group name changes, members are added/removed, or admin status changes",
    payload: '{\n  "_id": "6a883420e5d6aac97521f018",\n  "type": "group",\n  "name": "Product & Design Squad",\n  "admins": ["6a8833d9e5d6aac97521f00d", "6a8833dfe5d6aac97521f00e"],\n  "participants": [...]\n}',
  },
  {
    event: "message:send",
    direction: "Client → Server (Optional Socket Emit)",
    desc: "Send message directly via WebSocket with ack callback",
    payload: '{\n  "conversationId": "6a8833e7e5d6aac97521f010",\n  "text": "Live socket message"\n}',
  },
];

const RESILIENCE_ITEMS = [
  {
    title: "MongoDB RegExp Special Character Shield",
    issue: "Server /api/users/search endpoint throws MongoDB 500 error if queries contain raw regex characters (+, *, ?, ^, $, [, ]).",
    solution: "Frontend automatically strips leading + and escapes all regex metacharacters in lib/utils/colors.ts before dispatching queries.",
  },
  {
    title: "Infinite Scroll Cursor Deduplication",
    issue: "Reverse cursor pagination (before) can occasionally return overlapping message records during high-concurrency sends.",
    solution: "A Map-based deduplication layer in useMessages guarantees zero duplicate React key collisions and flawless chronological sorting.",
  },
  {
    title: "WebSocket Reconnection Backoff & Cache Revalidation",
    issue: "Temporary cellular network dropouts cause socket disconnects.",
    solution: "Configured with 10 reconnect attempts and exponential delay (1s-5s), with automatic TanStack Query cache revalidation on reconnect.",
  },
];

export default function ArchitectureSection() {
  const [activeTab, setActiveTab] = useState<"rest" | "socket" | "resilience">("rest");
  const [selectedEndpointIdx, setSelectedEndpointIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const selectedEndpoint = REST_ENDPOINTS[selectedEndpointIdx];

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="architecture" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 relative">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Terminal className="w-3.5 h-3.5" />
          Technical Specification
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Live API & Architecture Inspector
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Explore the live RESTful endpoints, Socket.io real-time protocols, and edge-case resilience architecture.
        </p>
      </div>

      {/* Main Tabbed Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab("rest")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition",
                activeTab === "rest"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>REST Endpoints</span>
            </button>

            <button
              onClick={() => setActiveTab("socket")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition",
                activeTab === "socket"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>WebSocket Protocol</span>
            </button>

            <button
              onClick={() => setActiveTab("resilience")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition",
                activeTab === "resilience"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Edge-Case Matrix</span>
            </button>
          </div>

          <a
            href="https://frontend-task-chatapp.onrender.com/docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono transition"
          >
            <span>Live Swagger Documentation</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Tab Content 1: REST Endpoints */}
        {activeTab === "rest" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Endpoint List */}
            <div className="lg:col-span-5 space-y-1.5">
              {REST_ENDPOINTS.map((ep, idx) => (
                <button
                  key={ep.path}
                  onClick={() => setSelectedEndpointIdx(idx)}
                  className={cn(
                    "w-full p-3 rounded-2xl text-left border transition flex items-center justify-between select-none",
                    selectedEndpointIdx === idx
                      ? "bg-indigo-500/15 border-indigo-500/40 text-white"
                      : "bg-slate-950/50 hover:bg-slate-800/60 border-slate-800/80 text-slate-400"
                  )}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold font-mono",
                          ep.method === "POST"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : ep.method === "GET"
                            ? "bg-sky-500/20 text-sky-400"
                            : "bg-amber-500/20 text-amber-400"
                        )}
                      >
                        {ep.method}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-200 truncate">
                        {ep.path}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 truncate">{ep.desc}</div>
                  </div>
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 shrink-0 transition",
                      selectedEndpointIdx === idx ? "text-indigo-400 translate-x-0.5" : "text-slate-600"
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Right Column: Payload & Response Viewer */}
            <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">
                      {selectedEndpoint.method} {selectedEndpoint.path}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Auth: {selectedEndpoint.auth}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(selectedEndpoint.response)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition text-xs flex items-center gap-1 font-mono"
                    title="Copy response JSON"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                {/* Request Payload */}
                <div className="mb-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                    Request Payload
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto custom-scrollbar leading-relaxed">
                    {selectedEndpoint.body}
                  </pre>
                </div>

                {/* Response Schema */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                    Response JSON (`200 OK`)
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto custom-scrollbar leading-relaxed max-h-52">
                    {selectedEndpoint.response}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: WebSocket Protocol */}
        {activeTab === "socket" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                WebSocket connections connect to root origin <code className="font-mono text-indigo-300">https://frontend-task-chatapp.onrender.com</code> with JWT passed in handshake auth: <code className="font-mono text-indigo-300">{`{ auth: { token } }`}</code>.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SOCKET_EVENTS.map((ev) => (
                <div
                  key={ev.event}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-indigo-400 font-mono">
                        {ev.event}
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mb-2">{ev.direction}</div>
                    <p className="text-xs text-slate-300 mb-3">{ev.desc}</p>
                  </div>
                  <pre className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto custom-scrollbar">
                    {ev.payload}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 3: Edge-Case Matrix */}
        {activeTab === "resilience" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RESILIENCE_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-3 leading-relaxed">
                    <strong className="text-slate-300 font-semibold">Observation:</strong> {item.issue}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 leading-relaxed">
                  <strong className="font-semibold text-emerald-200">Solution:</strong> {item.solution}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
