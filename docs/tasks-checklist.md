# Requirements & Implementation Checklist

This checklist tracks all deliverables and features against the requirements specified in [`docs/requirements.md`](./requirements.md).

---

## Part 1 — API Documentation & Feature Implementation

### 1. API Documentation (Standalone Deliverable)
- [x] **REST API Specification:** Complete documentation of all endpoints, HTTP methods, headers, query params, and JSON schemas in [`docs/api-documentation.md`](./api-documentation.md).
- [x] **WebSocket Event Specification:** Documented Socket.io connection handshake, token auth, and event payloads (`message:new`, `conversation:updated`, `message:send`).
- [x] **Postman & Swagger Exports:** Provided standalone [`docs/postman_collection.json`](./postman_collection.json) and [`docs/swagger.json`](./swagger.json).

### 2. Core Chat Features
- [x] **Passwordless Login (`/login`):**
  - [x] Sign in using phone number and display name.
  - [x] Automatic account creation for new phone numbers.
  - [x] JWT session persistence in `localStorage` with `GET /api/auth/me` verification.
  - [x] 1-click test user accounts for rapid evaluation.
- [x] **Starting Conversations:**
  - [x] Search directory users by name or phone number with debounced input.
  - [x] Regex sanitization to prevent backend MongoDB 500 crashes on `+` and special characters.
  - [x] Instant 1-on-1 direct conversation starter (`POST /api/conversations/direct`).
- [x] **Group Conversations:**
  - [x] Create multi-user groups with 2+ participants and custom group name (`POST /api/conversations/group`).
  - [x] Slide-over **Group Info Drawer** showing member roster, creation date, and admin tags.
  - [x] Admin actions: group renaming, member invite modal, and member removal / admin promotion.
  - [x] Member self-leave group flow.
- [x] **Message List & Stream:**
  - [x] Visual distinction: outgoing messages (Electric Indigo, bottom-right tail) vs incoming messages (Dark surface, bottom-left tail).
  - [x] Timestamps and delivery checkmarks (`✓✓`).
  - [x] Deterministic HSL color hashing for sender names and avatars in group chats.
  - [x] Reverse cursor pagination (`before={timestamp}`) to load older messages smoothly.
- [x] **Sending Messages:**
  - [x] Prevent sending empty / whitespace-only messages.
  - [x] Optimistic UI: instant bubble render with pending clock icon while request is in-flight.
  - [x] Auto-expanding composer (44px base height up to 140px) with emoji bar and `Enter` / `Shift+Enter` keyboard support.
- [x] **Real-Time Updates:**
  - [x] Live Socket.io `message:new` listener syncing directly into TanStack Query cache without manual page refresh.
  - [x] Payload normalizer handling server `id` vs `_id` differences.
  - [x] Real-time conversation list updates (`conversation:updated`).
- [x] **Scroll Physics (`useSmartScroll`):**
  - [x] Auto-scroll to latest message on send and on initial load.
  - [x] Reading position lock: if user scrolled up > 120px, viewport remains locked and a floating `[ ↓ N New Messages ]` pill appears.
  - [x] Prepend scroll retention: loading older history preserves exact pixel position.
- [x] **State Handling:**
  - [x] Shimmer loading skeletons for conversations and message feeds.
  - [x] Clean empty states for empty search results and unselected chats.
  - [x] 1-click **Retry** button for failed message sends.

---

## Part 2 — Creative Landing Page (`/`)

- [x] **Custom Visual Identity:** High-contrast dark theme (`#0B0F19` canvas, `#0F172A` cards, `#6366F1` indigo accents) with smooth Framer Motion animations.
- [x] **Interactive Live Chat Simulator:**
  - [x] In-browser sandbox in the hero section allowing evaluators to test messaging, direct/group switching, and scroll lock before logging in.
- [x] **Interactive API & Architecture Inspector:**
  - [x] Live tabs showing REST endpoints, sample JSON payloads, and WebSocket events.
- [x] **Responsive Layout:** Optimized across mobile, tablet, and wide desktop screens.

---

## Part 3 — Thought Process & Write-up

- [x] **Technical & Architectural Decisions:** Documented in [`docs/thought-process.md`](./thought-process.md) (why TanStack Query + Socket.io over Redux/Zustand, state pipeline, scroll physics).
- [x] **Design Choices:** Documented aesthetic rationale, composer ergonomics, and landing page sandbox.
- [x] **AI Tool Usage Declaration:** Honest breakdown of where AI was used (boilerplate, schemas) vs what was manually engineered (socket normalizer, search scoring, smart scroll).
- [x] **Issues & API Quirks Encountered:** Documented root causes and solutions for the socket `id` vs `_id` bug, MongoDB regex 500 crash, missing group dates, and mutation state collisions.
- [x] **Future Improvements:** Prioritized production roadmap (IndexedDB offline sync, E2EE, rich media attachments).

---

## Bonus Elements Implemented

- [x] **Procedural Web Audio API Feedback:** Zero-latency synthesized micro-chimes for sent and received messages with a header mute toggle.
- [x] **Live WebSocket HUD:** Real-time badge in chat header displaying live connection status (`Connected`, `Connecting...`, `Offline`).
- [x] **1-Click Optimistic Failure Recovery:** Inline retry action for messages that fail network transmission.
- [x] **Interactive Hero Simulator:** Embedded playable sandbox on the landing page for quick evaluation.

---

## Deployment & Verification

- [x] **Hosted Live App:** [https://taghyeer-chat-system.vercel.app/](https://taghyeer-chat-system.vercel.app/)
- [x] **TypeScript Typecheck:** 0 errors (`npx tsc --noEmit`).
- [x] **Production Build:** Static page generation compiled successfully with Turbopack (`npm run build`).
