# Thought Process & Technical Decisions

**Author:** Ashfatul Islam  
**Project:** Taghyeer Real-Time Chat System  
**Stack:** Next.js 16 (App Router), React 19, Socket.io v4, TanStack Query v5, Tailwind CSS v4  
**Date:** August 2026  

---

## 1. Architecture & Technical Decisions

When approaching this take-home, my main goal was to build something that feels like a real, resilient chat product rather than a quick hackathon demo. Real-time messaging apps are notoriously tricky because you have multiple asynchronous sources of truth: user input, optimistic local updates, REST API pagination, and live WebSocket broadcasts.

Here is how I structured the application and why I made specific technical choices.

### 1.1 Why TanStack Query + Socket.io (Instead of Global Redux / Zustand)
In a chat app, state breaks down into two categories:
1. **Server State (Message feeds, conversation lists, user profiles):** Highly volatile, asynchronous, and paginated.
2. **UI State (Active drawer, search modal open/closed, active conversation ID):** Ephemeral and local.

Instead of managing message arrays in a monolithic global store (Redux or Zustand) with dozens of manual reducers, I used **TanStack Query v5** to manage the server state as an infinite cache, and **Socket.io Client** purely as an event pipeline:
- When the user opens a conversation, `useInfiniteQuery` fetches the initial 50 messages using reverse cursor pagination (`before={timestamp}`).
- When a new socket event (`message:new`) arrives, instead of re-fetching the entire list over HTTP, the socket listener directly updates the specific TanStack Query cache key (`["conversations", id, "messages"]`).
- This gave me automatic deduplication, cache invalidation, background window refocus revalidation, and zero state synchronization bugs between HTTP and WebSockets.

### 1.2 State Architecture & Optimistic Pipeline
Waiting for a network roundtrip before rendering a user's message makes a chat app feel sluggish. I built an optimistic send pipeline:
1. As soon as the user presses **Enter**, a temporary message is created with a client ID (`temp_${Date.now()}`), current timestamp, and status `"sending"`.
2. This is immediately injected into the local TanStack Query cache, rendering the bubble instantly with a pending clock indicator, accompanied by a subtle synthesized audio chime via the Web Audio API.
3. The REST `POST /api/messages` call and Socket.io emission run concurrently.
4. When the server responds with the saved MongoDB document, the temporary item is swapped with the permanent `_id` and marked as `"delivered"` (rendering double checkmarks `✓✓`).
5. If the request fails (e.g., offline or network timeout), the message status flips to `"failed"`, displaying an inline **Retry** button so the user doesn't lose what they wrote.

### 1.3 Handling Scroll Physics (`useSmartScroll`)
One of the most frustrating things in poorly built chat apps is scroll jumping. The assignment requirements specifically noted:
> *"The view should auto-scroll to the latest message by default, but should not force-scroll the user down if they've scrolled up to read earlier messages."*

To solve this cleanly, I wrote a custom hook (`useSmartScroll`):
- **Stick-to-bottom logic:** When the user is already within 120px of the bottom, new incoming or outgoing messages automatically smoothly scroll to the bottom.
- **Reading lock:** If the user scrolls up past 120px to read older history, auto-scroll is disabled. An animated floating pill (`[ ↓ N New Messages ]`) appears at the bottom with the unread count, allowing a 1-click jump back to the bottom.
- **Prepend scroll retention:** When older messages are fetched (infinite scroll upwards), appending 50 items to the top of the container would normally shift the user's viewport. By recording `container.scrollHeight` immediately before the DOM update and adjusting `scrollTop` by the delta afterwards, the user's reading position remains pixel-perfect.

---

## 2. Creative Showcase & UI/UX Decisions (Part 2)

For Part 2, there was no provided Figma file, so I wanted to create a modern, high-contrast dark interface ("Deep Space") inspired by modern developer tools like Linear and Raycast.

### 2.1 The Interactive Landing Page Sandbox (`/`)
Rather than building a static marketing page filled with stock screenshots, I built a **fully functional in-browser chat simulator** directly in the hero section:
- Evaluators can test typing simulations, switch between Direct and Group conversation modes, test scroll locking, and inspect the real-time visual feedback without needing to log in first.
- Below the hero, I included an **Interactive API & Architecture Inspector** where evaluators can click through each endpoint, view actual sample request/response payloads, and see how the WebSocket protocol behaves.

### 2.2 Chat Ergonomics & Visual Polish
- **Asymmetric Bubble Design:** Outgoing messages use Electric Indigo (`#6366F1`) with a sharp bottom-right tail (`rounded-2xl rounded-br-xs`), while incoming messages use a dark surface card with a bottom-left tail (`rounded-2xl rounded-bl-xs`).
- **Deterministic Color Hashing:** In group chats, participant names and avatar badges use a deterministic HSL color hashing function based on their user ID or name string. This ensures "Sarah" always has the same distinct color across all messages in the room without storing color preferences on the backend.
- **Uniform 44px Composer:** The input bar uses a uniform 44px base height for the emoji trigger, auto-expanding textarea, and send button, keeping alignment clean across desktop and mobile keyboards.
- **Procedural Web Audio:** Instead of loading heavy `.mp3` audio files over the network, I synthesized two lightweight micro-chimes (sent chime and received pop) directly via the browser's `AudioContext`. It has zero network overhead and can be muted anytime from the header.

---

## 3. Real-World Issues & API Quirks Encountered

Working with the live backend revealed several undocumented edge cases and bugs. Here is how I identified and solved them:

### 3.1 The Socket `id` vs REST `_id` Message Replacement Bug
- **The Issue:** While testing live two-way messaging between two browser windows, I noticed a strange bug: when User A sent 5 messages in a row, User B's screen kept replacing the previous message with the new one, showing only 1 message instead of 5 until page reload.
- **The Root Cause:** Inspecting network payloads revealed that the REST API returns MongoDB documents with `_id: string`, but the Socket.io backend emits `message:new` events with **`id: string`** (no underscore) and integer millisecond timestamps instead of ISO strings. In the message deduplication logic, `m._id === newMsg._id` evaluated to `undefined === undefined` (which is `true`), causing React state to overwrite the previous message in-place!
- **The Solution:** I created a strict normalizer on socket receipt that unifies `rawMessage._id || rawMessage.id`, formats timestamps into standard ISO strings, and scopes optimistic replacement strictly to messages with a matching `tempId` and `sending` status.

### 3.2 MongoDB Regex 500 Crash on Special Characters (`+`)
- **The Issue:** When testing phone search with standard international prefixes like `+10000...`, the backend endpoint `GET /api/users/search?q=+...` crashed with HTTP 500 (`MongoServerError: Regular expression is invalid: quantifier does not follow a repeatable item`).
- **The Root Cause:** The backend server is directly passing the query parameter `q` into a raw MongoDB `$regex` without escaping regex metacharacters. In regular expressions, `+` is a quantifier that cannot be the first character.
- **The Solution:** 
  1. I wrote `escapeRegex()` in `lib/utils/search.ts` to sanitize all special characters before sending them to the API.
  2. Because the server regex also required exact or case-sensitive matches, I implemented a client-side directory cache (`globalUserCache`) with a parallel A-Z warmup on login.
  3. I paired this with an in-memory scoring engine (`matchUserScore`) that handles partial digits, area codes, initials, and unformatted strings with instant 0ms response times.

### 3.3 Group Sender Name Resolution
- **The Issue:** In group chats, incoming message payloads only contained the sender's 24-character hex ID (`sender: "67b9..."`), not the sender's user object. This caused group messages to render as `"Unknown User"` or `"Participant"`.
- **The Solution:** I connected `MessageBubble.tsx` to the active conversation's participant roster and the global user directory. When `message.sender` is a string ID, the component looks up the participant by ID to display their real name and hashed avatar color.

### 3.4 Missing `createdAt` on Groups (`Invalid time value` Crash)
- **The Issue:** Opening the Group Info Drawer for certain groups caused a React runtime error: `RangeError: Invalid time value` from `date-fns/format`.
- **The Root Cause:** Some group conversation objects created on the backend had `createdAt` as `undefined`.
- **The Solution:** Added a safe date parser fallback (`conversation.createdAt || conversation.updatedAt`) with an `!isNaN(...)` validity check before formatting, safely displaying `"Recently"` if dates are omitted.

### 3.5 Multi-Button Spinner Collision in Search Modal
- **The Issue:** In the user search modal, clicking "Chat" on one user triggered loading spinners on all other user cards simultaneously.
- **The Root Cause:** The UI was checking `startDirectMutation.isPending`, which is a global hook state.
- **The Solution:** Added granular state tracking (`startingUserId: string | null`) so only the clicked button enters the loading state while temporarily disabling the others.

### 3.6 Verified Backend Limitations (Deletions & Replies)
Through direct endpoint probing:
- `DELETE /api/conversations/:id` and `DELETE /api/messages/:id` return `404 Not Found`. The backend only supports removing participants from groups (`DELETE /api/conversations/:id/participants/:userId`).
- Passing `replyTo` or parent message IDs to `POST /api/messages` is ignored by the backend schema.  
Both limitations were handled cleanly in the UI by hiding unsupported actions rather than presenting non-functional buttons.

---

## 4. AI Tool Usage & Workflow Transparency

In full transparency, I utilized **Antigravity CLI (powered by Claude and Gemini models)** as an AI pair-programming assistant during this assignment. AI was used strictly as a high-speed accelerator for boilerplate, repetitive scaffolding, and format conversion, while all architectural decisions, state synchronization, edge-case debugging, and custom algorithms were engineered manually.

### 4.1 Specific Tasks Where AI Was Used
1. **TypeScript Interface Scaffolding (`lib/types/index.ts`):**
   - Fed the raw Swagger schema endpoints to the AI to quickly generate base TypeScript interfaces (`User`, `Conversation`, `Message`, `AuthResponse`).
2. **Repetitive UI Skeletons & Layout Scaffolding:**
   - Prompted AI to generate repetitive Tailwind CSS shimmer placeholder cards for `ConversationList` and `MessageList` during loading states.
3. **Specification & Collection Formatting:**
   - Used AI to format my manual `curl` test endpoints and verified JSON payloads into standardized OpenAPI 3.0 (`docs/swagger.json`) and Postman Collection (`docs/postman_collection.json`) export files.
4. **Static Brand Asset Generation:**
   - Generated the multi-stop gradient SVG brand mark (`app/icon.svg`) and favicon binaries.

### 4.2 Where Deep Engineering & Manual Problem Solving Were Required
1. **Real-Time WebSocket Cache Synchronization (`hooks/useMessages.ts`):**
   - *The Challenge:* Basic AI-scaffolded cache updates assumed symmetrical payload structures between REST and WebSocket APIs. In practice, live multi-tab testing revealed the backend Socket.io server emitted `id` (integer timestamp) while REST used MongoDB `_id` (string hex). This caused socket messages to overwrite existing messages due to `undefined === undefined` match collisions.
   - *Engineering Solution:* Rather than band-aiding with arbitrary re-fetches, I diagnosed the issue via network frames and engineered a unified payload normalizer and identity-matching layer that guarantees reliable message deduplication.
2. **MongoDB Regex 500 Crash & Phone Search Limitation (`lib/utils/search.ts`):**
   - *The Challenge:* Standard search queries passed directly to `GET /api/users/search?q=...` crashed the backend with HTTP 500 on `+` characters due to raw MongoDB regex parsing on the server.
   - *Engineering Solution:* I analyzed the server error codes, built `escapeRegex()`, and implemented a client-side directory cache (`globalUserCache`) with an A-Z warmup engine and a custom token-based ranking algorithm (`matchUserScore`) supporting partial digits, area codes, and initials.
3. **Viewport Scroll Physics & Reading Position Retention (`hooks/useSmartScroll.ts`):**
   - *The Challenge:* Standard scrolling approaches (`scrollIntoView()`) break user experience by forcefully jumping the screen down when older messages are prepended or when reading historical context.
   - *Engineering Solution:* I built `useSmartScroll` from scratch, calculating `scrollHeight` differentials before and after DOM updates to preserve exact reading positions during upward pagination.
4. **Mutation Loading State Isolation (`components/chat/NewChatModal.tsx`):**
   - *The Challenge:* Simple hook implementations tie loading spinners to a global mutation `isPending` state, which causes every row in a search list to spin when a single user is clicked.
   - *Engineering Solution:* Refactored the modal to track discrete `startingUserId` identifiers, ensuring only the target button shows a spinner while preventing accidental duplicate requests.

---

## 5. Future Improvements (What I'd Build With More Time)

If this were going into production for real users, here is what I would prioritize next:

1. **Local-First Offline Storage (IndexedDB):** Use Dexie.js / IndexedDB to persist conversation and message history locally on the client. Messages could be read instantly offline, and outgoing messages sent while offline would be queued in a background sync queue.
2. **End-to-End Encryption (E2EE):** Implement client-side key exchange via Web Crypto API (Signal Protocol / Olm) so message text is encrypted before hitting the server.
3. **Rich Media Uploads:** Integrate presigned S3 / Cloudinary URLs for image, video, and audio voice note attachments with client-side image compression.
4. **Typing Indicators & Read Receipts:** Emit granular socket events (`user:typing`, `message:read`) to show live typing bubbles and blue double checkmarks when the recipient views the chat.
5. **Virtual Windowing for Huge Message Feeds:** For conversations with 10,000+ messages, integrate `@tanstack/react-virtual` to keep DOM node counts minimal and maintain 60 FPS scrolling on mobile devices.
