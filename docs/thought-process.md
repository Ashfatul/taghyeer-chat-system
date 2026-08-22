# Thought Process & Technical Write-up

**Candidate:** Ashfatul Islam  
**Project:** Taghyeer Real-Time Chat System  
**Repository / Live App:** Taghyeer Chat System (Next.js 16, React 19, Socket.io v4, TanStack Query v5, Tailwind CSS v4)  
**Date:** August 21, 2026  

---

## 1. Architecture & Technical Decisions

### 1.1 Tech Stack Justification
| Layer | Choice | Rationale & Trade-offs |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router) + React 19** | Leverage React 19 compiler optimizations, standard layout composition, client components for interactive chat state, and fast routing. |
| **Styling** | **Tailwind CSS v4** | Modern CSS theme tokens, hardware-accelerated transitions, custom scrollbars, and zero runtime overhead. |
| **Server State** | **TanStack Query v5 (`@tanstack/react-query`)** | Chosen over raw `useState`/`useReducer` or Redux to provide robust cache management, background revalidation, query deduplication, and reverse cursor pagination for infinite message streams. |
| **Real-Time Transport** | **Socket.io Client v4** | Provides automatic reconnect backoffs, heartbeat keep-alives, room broadcasting, and JWT handshake authentication. |
| **Form & Validation** | **React Hook Form + Zod** | Declarative schema validation, input masking, and error feedback with zero unnecessary re-renders. |

### 1.2 Unified State & Optimistic UI Strategy
In real-time messaging, perceivable latency during message transmission degrades user experience. To achieve a snappy, native-feeling interaction, we implemented an **Optimistic Mutation Pipeline**:
1. When a user submits a message, `useSendMessage` immediately generates a temporary client-side ID (`temp_${timestamp}`) and injects an optimistic `Message` entity (`status: 'sending'`) into the TanStack Query cache.
2. The message bubble immediately renders with a spinning clock indicator and plays a synthesized audio chime via Web Audio API.
3. Once the server confirms the send via REST ack or Socket event, the temporary entity is seamlessly updated to `status: 'delivered'`, transitioning the indicator to delivery checkmarks (`✓✓`).
4. If a network interruption occurs, the message status is marked as `status: 'failed'`, presenting a 1-click **Retry** button.

---

## 2. UI/UX Design Choices (Part 2 Creative Showcase)

### 2.1 Visual Language & Theme
- **Color Hierarchy**: Deep Slate Canvas (`#0B0F19`), Layered Cards (`#0F172A`), Electric Indigo Accents (`#6366F1`), and Emerald status indicators (`#10B981`).
- **Typography**: Clean, geometric sans-serif for interface text paired with tabular mono numbers for timestamps and network HUD stats.
- **WCAG Compliance**: All text and bubble colors satisfy WCAG AAA/AA contrast standards (indigo gradients with white text achieve >5.5:1 contrast ratio against dark backgrounds).

### 2.2 Visual Bubble Differentiation & Group Clarity
- **Outgoing (Self)**: Right-aligned, Electric Indigo gradient (`from-indigo-600 to-indigo-500`), asymmetric speech tail on the bottom-right (`rounded-2xl rounded-br-xs`), and translucent white delivery metadata.
- **Incoming (Counterparts)**: Left-aligned, dark surface card (`bg-slate-800 border border-slate-700`), asymmetric speech tail on the bottom-left (`rounded-2xl rounded-bl-xs`).
- **Deterministic HSL Colors for Group Senders**: Senders in group conversations have their display names colored via a deterministic HSL hash of their User ID, ensuring unique visual identification without hardcoded color mappings.

### 2.3 Smart Viewport Auto-Scroll Physics (`useSmartScroll`)
One of the most frustrating flaws in chat interfaces is being forced to the bottom when reviewing historical messages. We engineered `useSmartScroll` with strict viewport ergonomics:
1. **Initial Mount / Conversation Switch**: Smoothly scrolls down to the newest message.
2. **User Sends a Message**: Instantly scrolls to bottom to display the outgoing bubble.
3. **Incoming Message While Scrolled Near Bottom (< 120px)**: Automatically scrolls smoothly to the new message.
4. **Incoming Message While Scrolled Up (> 120px)**: **Does NOT force-scroll**. Preserves the user's reading position, increments the unread counter, and triggers an animated floating `[ ↓ {N} New Messages ]` bounce pill.
5. **Historical Cursor Pagination (Scroll to Top)**: When older messages are prepended to the top of the container, the scroll manager computes `newScrollHeight - previousScrollHeight` and offsets the container so historical messages appear without any layout jumping.

### 2.4 Interactive In-Browser Live Chat Simulator
For Part 2 (Creative Showcase), rather than presenting static screenshots, we built an **Interactive In-Browser Live Chat Simulator** embedded directly in the landing page (`/`). Evaluators can switch between Direct and Group personas, send messages, trigger simulated inbound replies, test typing indicators, and observe smart scroll locks in action before logging in.

### 2.5 Debounced Search, Multi-Token Matching & Hybrid User Directory Architecture (`useDebounce`, `lib/utils/search.ts`)
Searching for contacts and active conversations is central to a seamless messaging experience. We implemented a unified search engine with debouncing and multi-layer query resolution:
1. **Custom `useDebounce` Hook**:
   - **User Search (New Chat & Add Members Modals)**: Applies a 300ms debounce to prevent firing network requests on every keystroke.
   - **Conversation List Search (Sidebar)**: Applies a 200ms debounce to avoid recomputing filter algorithms over active chat lists during rapid typing.
   - **Asynchronous Cancellation Safety**: Search effects include cancellation flags (`let isCurrent = true; ... return () => { isCurrent = false; }`) to guarantee that delayed responses from older searches never overwrite fresh results.
2. **Multi-Token, Case-Insensitive Matching**:
   - Matches full names, first names, last names, substring tokens, and multi-word queries (e.g. searching `"sar con"` resolves to `"Sarah Connor"`).
   - In MongoDB, queries are safely formatted with embedded case-insensitive flags (`(?i).*token1.*token2`) to bypass backend case-sensitive prefix limitations.
3. **Universal Phone Number Normalization & Partial Digit Matching**:
   - Cleans formatting symbols to match phone numbers regardless of country code (`+`), parentheses, dashes, or spaces (e.g. `+1 (202) 555-0102`, `202-555-0102`, `12025550102`).
   - Supports partial digit queries (e.g. searching last 4 digits `0102`, area code `202`, or middle segment `555`).
4. **Hybrid In-Memory Directory with Live Server Fallback**:
   - Automatically indexes users from existing conversations, auth sessions, and background warmups into `globalUserCache`.
   - Executes instant 0ms in-memory lookups while concurrently dispatching safe server queries, merging and scoring candidates by relevance (Exact match: 100, Prefix match: 90, Word token match: 80-85, Substring/Phone match: 75).

---

## 3. AI Tool Usage Declaration

### 3.1 Tools Used
- **Antigravity CLI Agent**: Code orchestration, file generation, and interactive verification.
- **LLM Capabilities**: Schema analysis from Swagger docs, rapid drafting of TypeScript interfaces, and unit testing ideas.

### 3.2 Specific Tasks Delegated
- Rapid generation of TypeScript models from OpenAPI schemas.
- Drafting initial Tailwind CSS classes for responsive layouts.
- Structuring the multi-phase implementation roadmap.

### 3.3 What Was Changed, Rejected, or Handled Manually
- **Rejected Simple `useEffect` State Polling**: AI drafts initially suggested fetching messages on a polling interval. This was rejected in favor of an event-driven architecture uniting TanStack Query v5 cache synchronization with Socket.io real-time broadcast listeners.
- **Custom Viewport Scroll Physics**: Default AI recommendations used standard `element.scrollIntoView()`, which broke historical scroll positions when prepending cursor pages. We engineered a custom `useSmartScroll` hook with pixel offset retention.
- **MongoDB RegExp Vulnerability Patch & Advanced Search Architecture**: AI drafts passed raw search strings into `/api/users/search?q=...`. During live API inspection, queries with `+` crashed the backend with MongoDB 500 errors. We engineered a dedicated `search.ts` engine with safe query construction, phone normalization, in-memory caching, and debouncing.

---

## 4. Issues Ran Into & API Quirks Encountered

### 4.1 MongoDB Regex Search 500 Error & Exact Phone Matching
- **Issue**:
  1. Searching for phone numbers with a leading `+` (e.g. `+12025550101`) or names with regex characters caused the server endpoint `GET /api/users/search?q=...` to crash with HTTP 500 (`MongoServerError: Regular expression is invalid: quantifier does not follow a repeatable item`).
  2. The server backend evaluated `phone: q` with strict equality and `name` with case-sensitive prefix regex, failing to return users when searching lowercase names, formatted phones, or partial phone digits.
- **Solution**:
  1. Created `lib/utils/search.ts` with `buildSafeServerSearchQueries`, converting queries to safe escaped expressions with `(?i).*` flags and stripping unescaped leading `+` from regex parameters.
  2. Implemented `useDebounce` to throttle search inputs.
  3. Created an in-memory user registry (`globalUserCache`) in `lib/api/users.ts` with background warmups, enabling instant partial phone and name matching across all formats.

### 4.2 Endpoint vs WebSocket Origin Discrepancy
- **Issue**: REST endpoints reside under the `/api/*` sub-path (e.g. `https://frontend-task-chatapp.onrender.com/api/conversations`), while the Socket.io WebSocket gateway and health endpoint reside at the root domain (`https://frontend-task-chatapp.onrender.com`).
- **Solution**: Configured the HTTP client with `BASE_URL = https://frontend-task-chatapp.onrender.com/api` and the Socket.io client with `ROOT_URL = https://frontend-task-chatapp.onrender.com`.

### 4.3 Passwordless Auth & Session Persistence
- **Observation**: `POST /api/auth/login` operates passwordlessly. Submitting a phone and name either authenticates an existing user or registers a new account and returns `{ token, user }`.
- **Solution**: Handled in `AuthContext` with automatic `localStorage` token storage and initial verification via `GET /api/auth/me`.

---

## 5. Future Improvements & Production Roadmap

1. **End-to-End Encryption (E2EE)**:
   - Implement client-side key generation via the Web Crypto API (Signal Protocol / Olm) to encrypt message payloads before transmission.
2. **Rich Media & File Attachments**:
   - Integrate presigned S3/Cloudinary upload URLs with client-side image compression, preview lightbox, and voice audio notes.
3. **Message Reactions & Inline Threading**:
   - Add emoji reactions (`👍`, `❤️`, `🔥`) and reply parent references to form message threads.
4. **Offline Sync with IndexedDB & Service Worker**:
   - Cache recent message history locally with IndexedDB to allow offline reading and queue outgoing messages for background sync when reconnected.

---
*Created as part of the Taghyeer Frontend Developer Take-Home Assignment.*
