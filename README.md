# Taghyeer Real-Time Chat System

A real-time, WebSocket-powered chat application built with **Next.js 16 (App Router)**, **React 19**, **Socket.io v4**, **TanStack Query v5**, and **Tailwind CSS v4**.

- 🌐 **Live Demo:** [https://taghyeer-chat-system.vercel.app/](https://taghyeer-chat-system.vercel.app/)
- 📖 **API Documentation (Part 1):** [`docs/api-documentation.md`](./docs/api-documentation.md)
- 🧠 **Thought Process & Decisions (Part 3):** [`docs/thought-process.md`](./docs/thought-process.md)
- ✅ **Requirements Checklist:** [`docs/tasks-checklist.md`](./docs/tasks-checklist.md)
- 📮 **Postman Collection:** [`docs/postman_collection.json`](./docs/postman_collection.json)
- 📜 **Swagger / OpenAPI Spec:** [`docs/swagger.json`](./docs/swagger.json)

---

## Quick Start & Local Setup

### 1. Prerequisites
- Node.js 18.18+ or 20+
- npm, yarn, or pnpm

### 2. Installation
```bash
# Clone repository
git clone https://github.com/Ashfatul/taghyeer-chat-system.git
cd taghyeer-chat-system

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_API_URL=https://frontend-task-chatapp.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://frontend-task-chatapp.onrender.com
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## Features Overview

### Part 1: Real-Time Chat Application (`/chat`)
- **Passwordless Authentication (`/login`):**
  - Phone number + display name login with automatic registration for new users.
  - JWT session persistence in `localStorage` verified via `GET /api/auth/me`.
  - 1-click test accounts for instant evaluation.
- **Conversations & Sidebar:**
  - Real-time conversation list with active indicators, last message snippets, and timestamps.
  - Client-side search across active conversations.
  - Skeletons and empty states.
- **User Search & Direct Messaging:**
  - Debounced search (300ms) with client-side regex escaping to prevent server 500 crashes.
  - In-memory directory caching for instant recall.
- **Group Management & Roles:**
  - Create groups with 2+ participants.
  - Slide-over **Group Info Drawer** with member roster, admin badges, and creation dates.
  - Group renaming, member invite modal, and member removal/admin promotion context menus.
  - Self-service "Leave Group" action.
- **Message Stream & Composer:**
  - Asymmetric message bubbles with delivery checkmarks (`✓✓`).
  - **Smart Scroll Physics (`useSmartScroll`):** Auto-scrolls to bottom by default; locks viewport position when scrolled up reading history, displaying a floating `[ ↓ N New Messages ]` button.
  - **Reverse Infinite Cursor Pagination:** Prepends older history (`before={timestamp}`) while preserving scroll position.
  - **Optimistic Send Pipeline:** Instant bubble rendering with clock icon, Web Audio chime, and inline 1-click retry on failure.
  - Auto-expanding composer (44px to 140px) with emoji quick-bar and keyboard shortcuts (`Enter` to send, `Shift+Enter` for newline).

### Part 2: Showcase Landing Page (`/`)
- **Interactive In-Browser Live Chat Simulator:**
  - Playable demo directly in the hero section without needing to log in.
  - Allows evaluators to test typing simulation, direct/group switching, and scroll lock behavior.
- **Interactive API & Architecture Inspector:**
  - Live inspector displaying REST endpoints, sample request/response payloads, and WebSocket events.
- **Responsive Dark Theme:**
  - High-contrast dark aesthetic with smooth animations via Framer Motion and Tailwind CSS v4.

### Bonus Elements
1. **Procedural Web Audio Feedback:** Synthesized message send/receive micro-chimes via the Web Audio API (zero external asset latency), with a header mute toggle.
2. **WebSocket Connection HUD:** Real-time indicator tracking live socket lifecycle (`Connected` / `Connecting...` / `Offline`).
3. **1-Click Optimistic Failure Recovery:** Retry button to resend failed messages without re-typing.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Server components, routing, and Turbopack |
| **UI Library** | React 19 | Core UI component lifecycle |
| **Styling** | Tailwind CSS v4 | Utility-first styling with hardware-accelerated animations |
| **State & Cache** | TanStack Query v5 | Server state caching, optimistic updates, and infinite cursor queries |
| **Real-Time Gateway** | Socket.io Client v4 | Bidirectional WebSocket message and conversation event synchronization |
| **Form Validation** | React Hook Form + Zod | Schema validation and input handling |
| **Icons & Animation** | Lucide React + Framer Motion | UI icons and smooth landing page transitions |
| **Type Safety** | TypeScript 5 (Strict Mode) | End-to-end type safety |

---

## Project Structure

```
taghyeer-chat-system/
├── app/                  # Next.js App Router (Landing, Login, Chat, Error boundary)
├── components/
│   ├── chat/             # Chat UI (Sidebar, Area, Composer, Bubbles, Modals, Group drawer)
│   └── landing/          # Landing page (Hero simulator, Feature cards, API inspector)
├── context/              # Global React Context (AuthContext, QueryProvider)
├── docs/                 # Assignment Deliverables (API Docs, Thought Process, Postman, Swagger)
├── hooks/                # Custom hooks (useMessages, useConversations, useSmartScroll, useGroupMutations)
├── lib/
│   ├── api/              # HTTP client and modular REST services
│   ├── socket/           # Socket.io connection manager
│   ├── types/            # TypeScript data models and interfaces
│   └── utils/            # Search ranking, regex sanitization, colors, and audio synthesizer
└── public/               # Static assets & icons
```

---

## Deliverables & Documentation

- **Part 1 (API Specification):** [`docs/api-documentation.md`](./docs/api-documentation.md)
- **Part 3 (Technical Thought Process):** [`docs/thought-process.md`](./docs/thought-process.md)
- **Requirements Checklist:** [`docs/tasks-checklist.md`](./docs/tasks-checklist.md)
- **Live Deployment:** [https://taghyeer-chat-system.vercel.app/](https://taghyeer-chat-system.vercel.app/)
