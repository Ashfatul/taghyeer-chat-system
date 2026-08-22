# Taghyeer Real-Time Chat System

> **A production-grade, WebSocket-powered real-time chat application built with Next.js 16 (App Router), React 19, Socket.io v4, TanStack Query v5, and Tailwind CSS v4.**

🌐 **Live Deployment:** [https://taghyeer-chat-system.vercel.app/](https://taghyeer-chat-system.vercel.app/)  
📖 **API Specification:** [`docs/api-documentation.md`](./docs/api-documentation.md)  
📮 **Postman Collection:** [`docs/postman_collection.json`](./docs/postman_collection.json)  
📜 **Swagger / OpenAPI 3.0 Spec:** [`docs/swagger.json`](./docs/swagger.json)  
🧠 **Technical Thought Process:** [`docs/thought-process.md`](./docs/thought-process.md)  
✅ **Tasks & Requirements Checklist:** [`docs/tasks-checklist.md`](./docs/tasks-checklist.md)  

---

## ⚡ Live Demo & Quick Start

### 🌐 Live Application
You can test and evaluate the deployed production application immediately at:  
👉 **[https://taghyeer-chat-system.vercel.app/](https://taghyeer-chat-system.vercel.app/)**

*Includes 1-click test credentials and an interactive sandbox on the homepage!*

---

### 💻 Local Development Setup

#### 1. Installation
```bash
# Clone repository
git clone https://github.com/Ashfatul/taghyeer-chat-system.git
cd taghyeer-chat-system

# Install dependencies
npm install
```

#### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=https://frontend-task-chatapp.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://frontend-task-chatapp.onrender.com
```

#### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 4. Production Build & Verification
```bash
npm run build
npm start
```

---

## 🌟 Feature Overview

### 💬 Part 1: Real-Time Chat Hub (`/chat`)
- **Passwordless Authentication (`/login`)**:
  - Sign in with phone number and display name. Automatically creates accounts for new users.
  - JWT session persistence in `localStorage` with automatic verification via `GET /api/auth/me`.
  - 1-click demo accounts for instant evaluation.
- **Dynamic Sidebar & Conversation Hub**:
  - Real-time conversation list with active indicators, sender snippets (`"You: ..."` vs `"Alex: ..."`), and relative timestamps.
  - Client-side search across conversations and message snippets.
  - Shimmer loading skeletons and empty states.
- **User Search & Direct Messaging**:
  - Debounced search (300ms) querying `/api/users/search`.
  - Regex sanitization avoiding server MongoDB 500 crashes on special characters (`+`, `*`, `?`, `[`).
  - 1-click conversation starter.
- **Multi-User Group Management & Roles**:
  - Create groups with 2+ participants using interactive chip tokenizers.
  - Slide-over **Group Info Drawer** showing metadata and creation dates.
  - **Admin Governance**: Inline group renaming (`PATCH /api/conversations/:id`), participant invite modal, and member context menu (`⋮`) for promoting members to admin or removing them from the group.
  - Self-service **Leave Group** action with confirmation dialog.
- **High-Speed Message Stream & Composer**:
  - **Distinct Bubbles**: Outgoing messages in Electric Indigo with bottom-right tail and delivery checks (`✓✓`); incoming messages in dark surface cards with bottom-left tail and deterministic HSL sender colors.
  - **Smart Auto-Scroll Physics (`useSmartScroll`)**: Automatic scrolling to bottom by default; gracefully preserves reading position if scrolled up (>120px) and displays an animated floating `[ ↓ {N} New Messages ]` pill.
  - **Infinite Cursor Pagination**: Prepending older historical messages (`before={timestamp}`) with scroll height delta compensation to eliminate layout jumps.
  - **Instant Optimistic Sending**: Temporary ID generation, clock icon, and seamless status transition to delivered upon server acknowledgement.
  - **Keyboard Ergonomics**: Auto-expanding textarea (44px to 140px), `Enter` to send, `Shift + Enter` for newlines, and quick emoji bar (👍, ❤️, 😂, 🎉, 🚀, 🔥, ✨, 👏).

---

### 🎨 Part 2: Creative Showcase Landing Page (`/`)
- **Dark Luxury Glassmorphic Aesthetic**: Ambient multi-stop gradient glow, subtle grid texturing, and WCAG AAA/AA compliant typography.
- **Interactive In-Browser Live Chat Simulator**:
  - Embedded playable sandbox in the hero section.
  - Switch between Direct and Group modes.
  - Trigger simulated counterpart replies, typing indicators, and scroll lock tests without logging in.
- **Bento Grid Architecture Breakdown**:
  - Sub-millisecond WebSocket transport.
  - Group collaboration & role governance.
  - Viewport auto-scroll physics & reading lock.
  - Zero-friction passwordless provisioning.
- **Live API & Architecture Inspector**:
  - Interactive REST endpoints viewer with sample request payloads, `200 OK` responses, and 1-click copy.
  - WebSocket protocol specification (`message:new`, `conversation:updated`, `message:send`).
  - Documented edge-case resilience matrix.

---

### 🎁 Bonus "One-Step-Ahead" Features
1. **Web Audio API Feedback (Zero External Assets)**:
   - Synthesized subtle audio chimes on message send (high chime) and message receive (soft pop).
   - Audio mute/unmute toggle in `ChatHeader` with persistent storage.
2. **Real-Time Connection HUD**: Live dynamic connection status badge in the chat header tracking real-time WebSocket lifecycle (`Connected` / `Connecting...` / `Offline`).
3. **Optimistic Send Failure Recovery**: 1-click **Retry** button if network drops during message transmission.
4. **Interactive Sandbox**: Playable live chat widget on the landing page for evaluators.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.3.2 (App Router & Turbopack) |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS v4 & Lucide Icons |
| **State & Cache** | TanStack Query v5 (`@tanstack/react-query`) |
| **Real-Time Gateway** | Socket.io Client v4 (`socket.io-client`) |
| **Validation** | React Hook Form & Zod |
| **Date Utilities** | Date-fns |
| **Type Safety** | TypeScript 5 (Strict Mode) |

---

## 📁 Project Structure

```
taghyeer-chat-system/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx      # Passwordless login with phone formatting & 1-click demos
│   ├── chat/
│   │   └── page.tsx            # Protected chat shell route
│   ├── error.tsx               # Global error boundary
│   ├── globals.css             # Tailwind v4 theme tokens & custom scrollbars
│   ├── layout.tsx              # Root layout with Query & Auth context providers
│   ├── not-found.tsx          # Custom 404 page
│   └── page.tsx                # Creative Showcase Landing Page
├── components/
│   ├── chat/
│   │   ├── ChatArea.tsx        # Chat container (Header + Stream + Composer)
│   │   ├── ChatHeader.tsx      # Active conversation header, presence & audio toggle
│   │   ├── ChatSidebar.tsx     # User profile, search bar, new chat trigger, conversation list
│   │   ├── ChatShell.tsx       # Responsive 3-pane layout shell
│   │   ├── ConversationItem.tsx# Conversation row with sender preview & timestamps
│   │   ├── ConversationList.tsx# Conversation list container with skeletons & search filter
│   │   ├── MessageBubble.tsx   # Asymmetric bubbles, delivery checks & copy action
│   │   ├── MessageInput.tsx    # Auto-expanding composer with validation & emoji bar
│   │   ├── MessageList.tsx     # Message stream with date dividers & smart scroll
│   │   ├── NewChatModal.tsx    # Dual-mode modal: Direct search & Group creation
│   │   ├── ScrollToBottomButton.tsx # Floating unread messages bounce pill
│   │   ├── UserAvatar.tsx      # HSL color hashing, initials & stacked group clusters
│   │   └── group/
│   │       ├── AddMembersModal.tsx  # User search & invite modal
│   │       ├── GroupInfoDrawer.tsx  # Slide-over drawer with rename & member actions
│   │       └── GroupMemberList.tsx  # Member roster with admin badges & context menu
│   └── landing/
│       ├── ArchitectureSection.tsx  # Interactive API & WebSocket protocol inspector
│       ├── FeatureSection.tsx       # Bento grid feature showcase
│       ├── InteractiveMiniChat.tsx  # In-browser live chat simulator widget
│       ├── LandingFooter.tsx        # Navigation footer & credits
│       ├── LandingNavbar.tsx        # Sticky glassmorphic header with live status
│       └── TechStackSection.tsx     # Modern tech stack showcase
├── context/
│   ├── AuthContext.tsx         # JWT persistence, session validation & login/logout
│   └── QueryProvider.tsx       # TanStack Query Client provider
├── docs/
│   ├── api-documentation.md    # Complete REST & WebSocket API specification
│   ├── implementation-plan.md  # Comprehensive UI/UX design blueprint & plan
│   ├── plan.md                 # Execution roadmap & deliverables index
│   ├── requirements.md         # Candidate assignment instructions
│   └── thought-process.md      # Detailed technical write-up & decisions
├── hooks/
│   ├── useConversations.ts     # Conversation list query & socket synchronization
│   ├── useDebounce.ts          # Generic input debouncer for searches
│   ├── useGroupMutations.ts    # Group renaming, member management & admin promotion
│   ├── useMessages.ts          # Infinite cursor query, optimistic sends & audio cues
│   └── useSmartScroll.ts       # Viewport detection, reading lock & prepend offset
└── lib/
    ├── api/                    # API client & modular resource services
    ├── socket/                 # Socket.io client manager
    ├── types/                  # TypeScript data models & schemas
    └── utils/                  # Colors, dates, search engine & ranking, sound FX
```

---

## 🧪 Verification & Build Status

- **TypeScript Typecheck**: Passed with 0 errors (`npx tsc --noEmit`).
- **Production Build**: Successfully compiled 6/6 static routes with Next.js Turbopack (`npm run build`).

---

## 📖 Thought Process & Documentation

For the comprehensive technical write-up detailing:
- Architectural decisions & trade-offs
- UI/UX design rationale
- AI tool usage declaration & manual interventions
- API quirks & solutions (MongoDB regex sanitization, origin discrepancies)
- Future roadmap

Please consult [`docs/thought-process.md`](./docs/thought-process.md).
