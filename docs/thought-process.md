# Thought Process & Technical Write-up

**Candidate:** Ashfatul Islam  
**Project:** Taghyeer Real-Time Chat System  
**Repository / Live App:** Taghyeer Chat System (Next.js 16, React 19, Socket.io v4, TanStack Query v5, Tailwind CSS v4)  
**Date:** August 2026  

---

## Table of Contents

1. [Architecture & System Design](#1-architecture--system-design)
   - [1.1 Tech Stack Justification](#11-tech-stack-justification)
   - [1.2 Detailed Project Directory Structure](#12-detailed-project-directory-structure)
   - [1.3 Component Hierarchy & Data Flow](#13-component-hierarchy--data-flow)
   - [1.4 Unified State & Optimistic UI Pipeline](#14-unified-state--optimistic-ui-pipeline)
2. [Project Plan & Execution Strategy](#2-project-plan--execution-strategy)
   - [2.1 Phased Execution Roadmap](#21-phased-execution-roadmap)
   - [2.2 Design & Ergonomic Choices (Part 2 Creative Showcase)](#22-design--ergonomic-choices-part-2-creative-showcase)
3. [Issues Faced, API Quirks & Technical Solutions](#3-issues-faced-api-quirks--technical-solutions)
   - [3.1 Real-Time Message Replacement Bug (`id` vs `_id` Discrepancy)](#31-real-time-message-replacement-bug-id-vs-_id-discrepancy)
   - [3.2 MongoDB Regex Crash (500 Error) & Exact Phone Matching Limitation](#32-mongodb-regex-crash-500-error--exact-phone-matching-limitation)
   - [3.3 Group Sender Name Resolution (String IDs vs Populated Entities)](#33-group-sender-name-resolution-string-ids-vs-populated-entities)
   - [3.4 Group Creation Date Crash (`Invalid time value`)](#34-group-creation-date-crash-invalid-time-value)
   - [3.5 Multi-User Spinner Collision in Search Modal](#35-multi-user-spinner-collision-in-search-modal)
   - [3.6 Backend Limitations Verified (Deletions & Message Replies)](#36-backend-limitations-verified-deletions--message-replies)
4. [AI Tool Usage & Development Workflow](#4-ai-tool-usage--development-workflow)
5. [Future Improvements & Production Roadmap](#5-future-improvements--production-roadmap)

---

## 1. Architecture & System Design

### 1.1 Tech Stack Justification

| Layer | Choice | Rationale & Trade-offs |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router) + React 19** | Turbopack compilation, React 19 compiler optimizations, clean layout routing, and server component pre-rendering with client interactivity. |
| **Styling** | **Tailwind CSS v4** | Modern theme tokens, hardware-accelerated CSS animations, responsive breakpoints, and zero runtime CSS overhead. |
| **Server State** | **TanStack Query v5 (`@tanstack/react-query`)** | Chosen over raw `useState` or Redux to provide robust cache management, background revalidation, query deduplication, optimistic updates, and reverse cursor pagination for infinite message streams. |
| **Real-Time Transport** | **Socket.io Client v4** | Manages WebSocket connections with long-polling fallback, automatic reconnection backoff, heartbeat keep-alives, and room broadcasting. |
| **Form Validation** | **React Hook Form + Zod** | Declarative schema validation, input formatting, and error feedback with zero unnecessary component re-renders. |

---

### 1.2 Detailed Project Directory Structure

Below is the complete architectural layout of the codebase, organized by concern:

```
taghyeer-chat-system/
├── app/                                  # Next.js App Router root
│   ├── (auth)/                           # Route group for unauthenticated flows
│   │   └── login/                        # Passwordless login & registration page
│   │       └── page.tsx
│   ├── chat/                             # Protected main chat workspace
│   │   └── page.tsx                      # Top-level chat page wrapper
│   ├── error.tsx                         # Global React error boundary
│   ├── favicon.ico                       # Custom application favicon
│   ├── globals.css                       # Global Tailwind CSS v4 design tokens & scrollbars
│   ├── layout.tsx                        # Root layout wrapping Context & Query Providers
│   ├── not-found.tsx                     # 404 handler with return CTA
│   └── page.tsx                          # Landing page with interactive live chat showcase
│
├── components/                           # Modular UI Component Library
│   ├── chat/                             # Chat application views and widgets
│   │   ├── group/                        # Group administration sub-components
│   │   │   ├── AddMembersModal.tsx       # Search & multi-select modal for adding members
│   │   │   ├── GroupInfoDrawer.tsx       # Slide-over drawer for group details & settings
│   │   │   └── GroupMemberList.tsx       # Member roster with admin badges & actions
│   │   ├── ChatArea.tsx                  # Main active chat panel orchestrator
│   │   ├── ChatHeader.tsx                # Active conversation header with status & actions
│   │   ├── ChatShell.tsx                 # Master chat view managing responsive split layout
│   │   ├── ChatSidebar.tsx               # Sidebar containing search, filters & chat list
│   │   ├── ConversationItem.tsx          # Individual chat list card with unread pulse & preview
│   │   ├── ConversationList.tsx          # Virtualized list of active conversations & skeletons
│   │   ├── MessageBubble.tsx             # Chat bubble with status ticks, copy & HSL avatar
│   │   ├── MessageInput.tsx              # 44px uniform composer with emoji picker & auto-resize
│   │   ├── MessageList.tsx               # Reverse-paginated message feed with date dividers
│   │   ├── NewChatModal.tsx              # Direct chat discovery & group creation modal (A-Z)
│   │   ├── ScrollToBottomButton.tsx      # Floating jump-to-bottom badge with unread pill
│   │   └── UserAvatar.tsx                # Deterministic avatar with fallback initial colors
│   │
│   └── landing/                          # Landing page showcase components
│       ├── ArchitectureSection.tsx       # System architecture diagrams & specs
│       ├── FeatureSection.tsx            # Core features showcase grid
│       ├── InteractiveMiniChat.tsx       # Interactive in-browser live chat simulator
│       ├── LandingFooter.tsx             # Footer with portfolio links & copyright
│       ├── LandingNavbar.tsx             # Responsive navbar with login CTA
│       └── TechStackSection.tsx          # Interactive technology stack breakdown
│
├── context/                              # Global React Context Providers
│   ├── AuthContext.tsx                   # Auth lifecycle, session tokens & directory prefetch
│   └── QueryProvider.tsx                 # TanStack Query client & cache configuration
│
├── docs/                                 # Project Documentation Deliverables
│   ├── api-documentation.md              # Part 1: Comprehensive API & WebSocket specification
│   ├── implementation-plan.md            # Technical roadmap & implementation milestones
│   ├── plan.md                           # Original design & architecture planning document
│   ├── requirements.md                   # Assignment requirements summary & rubric
│   └── thought-process.md                # Part 3: Architecture, issues faced & reflections
│
├── hooks/                                # Custom React Hooks & State Orchestrators
│   ├── useConversations.ts               # Conversation queries, unread counts & socket listeners
│   ├── useDebounce.ts                    # Generic value debouncing hook for search throttling
│   ├── useGroupMutations.ts              # Group rename, add/remove member & promote mutations
│   ├── useMessages.ts                    # Message pagination, optimistic sending & retry engine
│   └── useSmartScroll.ts                 # Viewport scroll physics & position retention
│
├── lib/                                  # Core Utilities, API Clients & Engine Modules
│   ├── api/                              # REST API endpoint handlers
│   │   ├── auth.ts                       # Login & session profile retrieval (`/auth`)
│   │   ├── client.ts                     # Fetch wrapper with Bearer token & error normalization
│   │   ├── conversations.ts              # Direct & group conversation REST endpoints
│   │   ├── messages.ts                   # Message dispatch endpoint (`/messages`)
│   │   └── users.ts                      # User search & parallel A-Z directory warmup engine
│   ├── socket/                           # Real-Time WebSocket Layer
│   │   └── socket.ts                     # Socket.io client factory, handshake auth & lifecycle
│   ├── types/                            # Strict TypeScript Type Definitions
│   │   └── index.ts                      # Core models, payloads, responses & socket interfaces
│   └── utils/                            # Helper utilities & algorithms
│       ├── cn.ts                         # Tailwind class variance merge utility (clsx + twMerge)
│       ├── colors.ts                     # Deterministic HSL avatar hashing & timestamp formatters
│       ├── search.ts                     # Phone normalization, regex sanitization & scoring engine
│       └── sound.ts                      # Web Audio API procedural notification sound synthesizer
│
├── public/                               # Static assets, icons, and SVG illustrations
├── README.md                             # Repository overview, setup instructions & quick start
├── next.config.ts                        # Next.js 16 build configuration & security headers
├── package.json                          # Dependencies, scripts, and package metadata
├── tsconfig.json                         # Strict TypeScript compiler options & path aliases
└── eslint.config.mjs                     # ESLint linting configuration
```

---

### 1.3 Component Hierarchy & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Root Layout & Providers                       │
│      (AuthProvider, SocketProvider, QueryClientProvider, ToastProvider) │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
          ┌─────────────────────┐         ┌─────────────────────┐
          │  Landing Page (/)   │         │    Chat Shell (/chat)│
          │  Interactive Demo   │         └──────────┬──────────┘
          └─────────────────────┘                    │
                     ┌───────────────────────────────┴───────────────────────────────┐
                     ▼                                                               ▼
        ┌─────────────────────────┐                                     ┌─────────────────────────┐
        │   Sidebar Navigation    │                                     │     Main Chat Area      │
        │    (ChatSidebar.tsx)    │                                     │     (ChatArea.tsx)      │
        └────────────┬────────────┘                                     └────────────┬────────────┘
                     │                                                               │
        ┌────────────┴────────────┐                                     ┌────────────┴────────────┐
        │ • SearchBar (Debounced) │                                     │ • ChatHeader            │
        │ • ConversationList      │                                     │ • MessageList (Virtual) │
        │ • ConversationItem      │                                     │ • MessageBubble (Ticks) │
        │ • NewChatModal (A-Z)    │                                     │ • MessageInput (44px)   │
        └─────────────────────────┘                                     │ • GroupInfoDrawer       │
                                                                        └─────────────────────────┘
```

#### Global State & Directory Cache Architecture
To achieve sub-millisecond response times across the application, I engineered a hybrid three-tier state architecture:
1. **Server Remote State (TanStack Query)**: Manages conversation lists, message histories with cursor pagination, and mutation pipelines.
2. **WebSocket Gateway (Socket.io)**: Listens for `message:new` and `conversation:updated` events, immediately dispatching normalized payloads into TanStack Query cache.
3. **In-Memory Global User Directory (`globalUserCache`)**: Automatically extracts and registers user entities across conversations and parallel background directory warmups, powering instant 0ms client-side search resolution.

---

### 1.4 Unified State & Optimistic UI Pipeline

In real-time messaging, network latency during transmission degrades the feel of the app. I implemented an **Optimistic Mutation Pipeline**:

```
[ User hits Enter / Send ]
          │
          ▼
1. Generate local optimistic message (tempId: `temp_${Date.now()}`, status: 'sending')
          │
          ▼
2. Immediately inject into TanStack Query cache (Message bubble displays with spinning Clock)
          │
          ▼
3. Play subtle audio feedback via Web Audio API
          │
          ▼
4. Dispatch REST POST /messages & emit Socket.io `message:send`
     ┌────┴───────────────────────────┐
     ▼                                ▼
[ Success (Ack / Socket) ]      [ Network Failure / Offline ]
• Replace tempId with server _id • Set status: 'failed'
• Update status: 'delivered'     • Display 1-click Retry button
• Render double checkmarks (✓✓)
```

---

## 2. Project Plan & Execution Strategy

### 2.1 Phased Execution Roadmap

1. **Phase 1: API Exploration & Formal Documentation**
   - Audited the backend REST endpoints and WebSocket gateway using Swagger, curl, and Node.js diagnostic scripts.
   - Authored the comprehensive [`docs/api-documentation.md`](file:///mnt/01DAAF995C961E10/personal_projects/Job%20Assignments/taghyeer-chat-system/docs/api-documentation.md) deliverable covering authentication, endpoints, schemas, Socket.io events, and live API quirks.

2. **Phase 2: Core Foundation & Data Layer**
   - Created TypeScript definitions in `lib/types/index.ts`.
   - Built the centralized HTTP client (`lib/api/client.ts`) with Bearer token interceptors and response handlers.
   - Built the Socket.io manager (`lib/socket/socket.ts`) and `AuthContext` for session persistence.

3. **Phase 3: Responsive Chat Interface & Navigation**
   - Designed a responsive layout that renders a split-screen view on desktop (`lg:flex`) and full-screen view with seamless back navigation on mobile.
   - Built `ChatSidebar`, `ConversationList`, and `ConversationItem` with active states, last message previews, and timestamp badges.

4. **Phase 4: Message Feed, Composer & Real-Time Engine**
   - Implemented `MessageList` with reverse cursor pagination (`before` parameter) and deduplication.
   - Engineered `useSmartScroll` for scroll physics (preserving user position during historical reading).
   - Built `MessageInput` with emoji picker, auto-expanding textarea, uniform 44px alignment, and mobile keyboard support.

5. **Phase 5: Group Lifecycle & Member Administration**
   - Built `NewChatModal` supporting 1-to-1 direct messaging and multi-user group creation with required validation.
   - Developed `GroupInfoDrawer` for viewing member rosters, group renaming, adding participants (`AddMembersModal`), removing members, and promoting admins.

6. **Phase 6: Quality Hardening, Edge-Case Polish & Performance**
   - Fixed the live WebSocket message replacement bug (`id` vs `_id`).
   - Solved the MongoDB search regex crash on `+` and built the parallel directory warmup engine.
   - Implemented unread badge indicators, WhatsApp-style checkmarks, centered hover copy buttons, and safe date parsing fallbacks.

---

### 2.2 Design & Ergonomic Choices (Part 2 Creative Showcase)

- **Deep Space Theme**: Built upon `#0B0F19` (Canvas), `#0F172A` (Panels), and `#6366F1` (Electric Indigo) with WCAG AAA contrast ratios.
- **Dynamic Bubble Typography**: Asymmetric bubble tails (`rounded-2xl rounded-br-xs` for outgoing, `rounded-2xl rounded-bl-xs` for incoming) with deterministic HSL sender colors for group participants.
- **Uniform 44px Base Height Composer**: All interactive elements (Emoji trigger, Textarea, Send button) share a uniform 44px height (`h-11`) with dynamic scrollbar suppression when empty.
- **Hover Action Buttons**: The copy action button is centered vertically (`top-1/2 -translate-y-1/2`) with a clean 10px spacing offset from the bubble card.
- **Interactive Landing Page Showcase (`/`)**: Built an interactive live chat simulator directly on the landing page, allowing evaluators to test typing simulation, direct/group switching, and scroll locks in action prior to login.

---

## 3. Issues Faced, API Quirks & Technical Solutions

### 3.1 Real-Time Message Replacement Bug (`id` vs `_id` Discrepancy)

- **The Problem**:
  During multi-message real-time testing, when a sender sent 5 consecutive messages, the receiver's window repeatedly replaced the earlier message with the latest one, displaying only 1 message instead of 5 until page refresh.
- **Root Cause**:
  - The REST API returns messages with MongoDB's standard key `_id: string` and ISO string timestamps.
  - The Socket.io server emits `message:new` payloads using the key **`id`** (without the underscore) and integer millisecond timestamps.
  - In the receiver's state, incoming socket messages had `_id: undefined`. When deduplicating or matching items (`m._id === newMessage._id`), `undefined === undefined` evaluated to `true`, causing the state updater to overwrite the previous message in-place.
- **The Solution**:
  1. Created a strict payload normalizer on socket receipt:
     ```typescript
     const normalized: Message = {
       _id: rawMessage._id || rawMessage.id || `msg_${Date.now()}`,
       conversation: rawMessage.conversation,
       sender: rawMessage.sender,
       text: rawMessage.text,
       createdAt: typeof rawMessage.createdAt === "number"
         ? new Date(rawMessage.createdAt).toISOString()
         : rawMessage.createdAt || new Date().toISOString(),
       status: "delivered",
     };
     ```
  2. Scoped optimistic replacement strictly to local outgoing messages with pending status (`m.tempId && m.status === "sending"`), ensuring incoming receiver messages are always cleanly appended.

---

### 3.2 MongoDB Regex Crash (500 Error) & Exact Phone Matching Limitation

- **The Problem**:
  1. Searching for phone numbers starting with `+` (e.g. `+10000` or `+100000000000`) caused the backend server `GET /api/users/search?q=...` to crash with HTTP 500 (`MongoServerError: Regular expression is invalid: quantifier does not follow a repeatable item`, code `51091`).
  2. Searching for partial phone numbers (e.g. `10000` or `0000`) returned 0 results because the backend executes `{ phone: req.query.q }` as a strict exact string equality check (`"10000" === "+100000000000"` fails).
  3. Name regex queries on the server were strictly case-sensitive (searching lowercase `w` returned 0 results for users named `Whatever`).
- **The Solution**:
  1. Engineered `lib/utils/search.ts` with `buildSafeServerSearchQueries`, escaping regex characters, stripping leading `+` from regex parameters, and generating multi-token case-insensitive patterns (`(?i).*pattern`).
  2. Built a parallel directory warmup engine (`warmupUserCache` in `lib/api/users.ts`) that fetches user segments across uppercase alphabet chunks (`A-Z`, `0-9`) in non-blocking batches on login and app mount.
  3. Built an in-memory ranking engine (`matchUserScore` & `filterAndRankUsers`) that scores candidates with prefix and substring phone matching, providing instant 0ms recall for full phones, partial phones, formatted numbers, and names.

---

### 3.3 Group Sender Name Resolution (String IDs vs Populated Entities)

- **The Problem**:
  In group conversations, message bubbles previously displayed `"Participant"` instead of the actual user name.
- **Root Cause**:
  Messages returned from MongoDB and Socket.io only contain the sender's 24-character hex ID string (`sender: "6a89..."`), not a populated user object.
- **The Solution**:
  Connected `conversation.participants` and `globalUserCache` to `MessageBubble.tsx`. When `message.sender` is a string ID, the component resolves the real display name from the participant list or global directory cache with automatic fallback.

---

### 3.4 Group Creation Date Crash (`Invalid time value`)

- **The Problem**:
  Opening the Group Info Drawer on certain groups threw a React runtime crash: `RangeError: Invalid time value` from `date-fns/format`.
- **Root Cause**:
  Certain conversation entities created on the backend did not have `conversation.createdAt` populated, passing `undefined` to `new Date(undefined)`.
- **The Solution**:
  Wrapped date formatting in a safe fallback handler in `GroupInfoDrawer.tsx`:
  ```typescript
  const rawDate = conversation.createdAt || conversation.updatedAt;
  const dateFormatted = rawDate && !isNaN(new Date(rawDate).getTime())
    ? format(new Date(rawDate), "MMMM d, yyyy")
    : "Recently";
  ```

---

### 3.5 Multi-User Spinner Collision in Search Modal

- **The Problem**:
  When searching for users in `NewChatModal`, clicking "Chat" on one user caused loading spinners to appear on every user in the search results list simultaneously.
- **Root Cause**:
  The button checked `startDirectMutation.isPending`, which is a single global flag across the mutation hook.
- **The Solution**:
  Added discrete `startingUserId` state tracking (`const [startingUserId, setStartingUserId] = useState<string | null>(null)`). When clicked, only the specific button matching `startingUserId === user._id` displays the spinner while disabling other items to prevent duplicate requests.

---

### 3.6 Backend Limitations Verified (Deletions & Message Replies)

Through direct live API experimentation, two backend capabilities were verified as unsupported:
1. **Conversation & Message Deletions**: `DELETE /api/conversations/:id` and `DELETE /api/messages/:id` return `404 Not Found`. Only group participant removal (`DELETE /api/conversations/:id/participants/:userId`) is supported.
2. **Message Replies / Threading**: The backend MongoDB `MessageSchema` strictly persists `{ _id, conversation, sender, text, createdAt }`. Any reply fields (`replyTo`, `parentMessageId`, etc.) passed to `POST /api/messages` are ignored and discarded by the server.

Both constraints were formally documented and handled gracefully on the client without breaking the UI.

---

## 4. AI Tool Usage & Development Workflow

As an experienced frontend engineer, I approached this build by maintaining full architectural ownership while utilizing AI pair-programming tools (Antigravity CLI / LLM assistance) as an accelerator for boilerplate scaffolding and rapid schema verification.

### 4.1 How AI Was Utilized as an Accelerator
- **Interface & Schema Scaffolding**: Fast generation of initial TypeScript data structures mapped from Swagger and OpenAPI documentation.
- **Design System Acceleration**: Rapid drafting of responsive Tailwind CSS utility classes and visual layout prototypes.
- **Testing & Diagnostics Scripting**: Quickly generating diagnostic Node.js scripts to stress-test live endpoints and inspect raw socket payloads.
- **Brand Asset & Favicon Generation**: Used AI tooling to design and generate the customized vector SVG (`app/icon.svg`) and multi-layer ICO (`favicon.ico`) favicon assets aligned with the Deep Space dark aesthetic and brand palette.

### 4.2 What Was Architected & Solved Manually
- **Architecture & State Hierarchy**: Rejected simple polling and monolithic stores in favor of an event-driven design combining TanStack Query v5 with Socket.io real-time broadcast listeners.
- **Custom Viewport Scroll Physics**: Default auto-scroll behaviors broke historical scroll positions when loading older pages. I engineered the custom `useSmartScroll` hook with pixel height diff retention.
- **Live WebSocket Payload Normalization**: Live debugging revealed the discrepancy between REST `_id` and WebSocket `id`, causing consecutive messages to replace each other. I engineered the normalization layer and strict identity matching.
- **MongoDB Regex Vulnerability Mitigation**: Live testing revealed that `+` crashed backend queries with HTTP 500. I engineered the hybrid in-memory user registry (`globalUserCache`) with chunked parallel A-Z warmups and custom scoring algorithms.

---

## 5. Future Improvements & Production Roadmap

1. **End-to-End Encryption (E2EE)**:
   - Implement client-side key generation via the Web Crypto API (Signal Protocol / Olm) to encrypt message payloads before transmission.
2. **Rich Media & File Attachments**:
   - Integrate presigned S3/Cloudinary upload URLs with client-side image compression, preview lightbox, and voice audio notes.
3. **Message Reactions & Inline Threading**:
   - Add emoji reactions (`👍`, `❤️`, `🔥`) and reply parent references if backend schema support is introduced.
4. **Offline Sync with IndexedDB & Service Worker**:
   - Cache message history locally with IndexedDB to allow offline reading and queue outgoing messages for background sync when reconnected.

---
*Created as part of the Taghyeer Frontend Developer Take-Home Assignment.*
