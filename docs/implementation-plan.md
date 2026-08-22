# Taghyeer Chat System — Comprehensive UI/UX Blueprint & Implementation Plan

> **Author:** Frontend Engineering Team  
> **Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, TanStack Query v5, Socket.io-client v4, React Hook Form + Zod, Framer Motion, Lucide Icons  
> **Source Specifications:** [`docs/requirements.md`](file:///mnt/01DAAF995C961E10/personal_projects/Job%20Assignments/taghyeer-chat-system/docs/requirements.md) | [`docs/api-documentation.md`](file:///mnt/01DAAF995C961E10/personal_projects/Job%20Assignments/taghyeer-chat-system/docs/api-documentation.md)  
> **Target Base URL:** `https://frontend-task-chatapp.onrender.com`

---

## 1. Executive Summary & Product Vision

The **Taghyeer Chat System** is an enterprise-grade, ultra-responsive real-time communication platform paired with a high-conversion creative showcase landing page. Built to satisfy the exact requirements of the frontend take-home assignment, the application delivers:

1. **Zero-Friction Authentication**: Passwordless phone + name onboarding with automated first-time user registration.
2. **High-Performance Real-Time Engine**: Hybrid architecture combining RESTful persistence with Socket.io v4 WebSockets, optimistic UI updates, and intelligent connection fallback.
3. **Advanced Conversation & Group Collaboration**: Direct 1-on-1 chats and multi-user groups with granular admin governance (role promotion, member removal, and real-time metadata synchronization).
4. **Ergonomic Chat Stream & Auto-Scroll Physics**: Smart viewport management that auto-scrolls for new messages without interrupting users who are reviewing chat history, complete with a floating unread message indicator.
5. **Creative Showcase Landing Page**: A visually stunning presentation featuring an interactive in-browser live chat simulator, interactive API inspector, and bento-grid feature architecture.

---

## 2. Complete Design System & Visual Identity Specification

### 2.1 Design Philosophy & Aesthetic Identity

The design language embodies **"SaaS Precision with Ambient Warmth"**:
- **Canvas & Surfaces**: Deep slate/charcoal tones in dark mode paired with crisp, clean slate-50 surfaces in light mode, layered with soft frosted glass (`backdrop-blur-xl`).
- **Accent Identity**: A vibrant **Electric Indigo (`#6366F1`)** paired with soft violet undertones, symbolizing speed, clarity, and modern SaaS capability.
- **Cognitive Ergonomics**: High information contrast without visual clutter. Outgoing messages are unmistakably distinguished by the brand Indigo fill, while incoming messages rest on subdued neutral surfaces. Group participant messages feature deterministic HSL-hashed sender name colors for instant visual identification.
- **Physical Depth**: Subtle 1px translucent borders (`border-white/10` in dark, `border-slate-200/80` in light) combined with multi-stop ambient drop shadows to establish natural visual hierarchy.

### 2.2 Design Tokens & Color Matrix

All color tokens are verified against **WCAG 2.1 AA/AAA** standards for contrast and legibility.

| Token | Light Mode Hex | Dark Mode Hex | Tailwind Token | Semantic Usage |
| :--- | :--- | :--- | :--- | :--- |
| **`--primary`** | `#4F46E5` (Indigo-600) | `#6366F1` (Indigo-500) | `bg-primary text-primary-foreground` | Sent bubbles, Primary CTA, Active nav pills |
| **`--primary-hover`** | `#4338CA` (Indigo-700) | `#4F46E5` (Indigo-600) | `hover:bg-primary-hover` | Button hover states, focused borders |
| **`--primary-subtle`** | `#EEF2FF` (Indigo-50) | `#1E1B4B` (Indigo-950/60) | `bg-indigo-500/10 text-indigo-400` | Active chat item background, user badges |
| **`--surface-base`** | `#FFFFFF` (White) | `#0B0F19` (Deep Charcoal) | `bg-surface-base` | Root application background canvas |
| **`--surface-raised`** | `#F8FAFC` (Slate-50) | `#111827` (Slate-900) | `bg-surface-raised` | Sidebar container, message list background |
| **`--surface-overlay`** | `#F1F5F9` (Slate-100) | `#1E293B` (Slate-800) | `bg-surface-overlay` | Received message bubbles, popovers, drawers |
| **`--surface-card`** | `#FFFFFF` (White) | `#161F30` (Slate-850) | `bg-surface-card` | Modal dialogs, user cards, input containers |
| **`--border-subtle`** | `#E2E8F0` (Slate-200) | `#1F2937` (Slate-800) | `border-border-subtle` | Dividers, message list borders, sidebar separator |
| **`--border-moderate`** | `#CBD5E1` (Slate-300) | `#374151` (Slate-700) | `border-border-moderate` | Card outlines, input borders |
| **`--text-primary`** | `#0F172A` (Slate-900) | `#F8FAFC` (Slate-50) | `text-text-primary` | Headings, active conversation titles, body text |
| **`--text-secondary`** | `#475569` (Slate-600) | `#94A3B8` (Slate-400) | `text-text-secondary` | Last message snippets, subtitle labels |
| **`--text-muted`** | `#94A3B8` (Slate-400) | `#64748B` (Slate-500) | `text-text-muted` | Timestamps, placeholder text, character count |
| **`--status-online`** | `#10B981` (Emerald-500) | `#34D399` (Emerald-400) | `bg-emerald-500 text-emerald-400` | Online indicator, connected WebSocket pill |
| **`--status-reconnecting`**| `#F59E0B` (Amber-500) | `#FBBF24` (Amber-400) | `bg-amber-500 text-amber-400` | Socket reconnecting, network retry badge |
| **`--status-error`** | `#EF4444` (Rose-500) | `#F87171` (Rose-400) | `bg-rose-500 text-rose-400` | Destructive actions, failed send retry, error toast |
| **`--status-admin`** | `#8B5CF6` (Violet-500) | `#A78BFA` (Violet-400) | `bg-violet-500/10 text-violet-400` | Group Administrator badge |

### 2.3 Typography System

We utilize `Geist Sans` as our primary typographic engine for exceptional UI clarity and legibility, paired with `Geist Mono` for payload data, timestamps, and technical metrics.

| Level | Font Family | Size | Weight | Tracking | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `Geist Sans` | `3.5rem` (56px) | `800` (ExtraBold) | `-0.03em` | `1.1` | Landing page main headline |
| **Heading 1** | `Geist Sans` | `2.25rem` (36px) | `700` (Bold) | `-0.025em` | `1.2` | Major section headers, Auth modal title |
| **Heading 2** | `Geist Sans` | `1.5rem` (24px) | `600` (SemiBold) | `-0.02em` | `1.3` | Conversation title, Drawer headers |
| **Heading 3** | `Geist Sans` | `1.125rem` (18px) | `600` (SemiBold) | `-0.01em` | `1.4` | Modal titles, Sidebar user name |
| **Body Large** | `Geist Sans` | `1rem` (16px) | `400` / `500` | `normal` | `1.5` | Hero subtitles, Input fields |
| **Body Base** | `Geist Sans` | `0.875rem` (14px) | `400` / `500` | `normal` | `1.5` | Message bubbles, Search results, Nav items |
| **Body Small** | `Geist Sans` | `0.8125rem` (13px)| `400` / `500` | `normal` | `1.4` | Last message preview in sidebar |
| **Caption / Meta** | `Geist Sans` | `0.75rem` (12px) | `500` (Medium) | `+0.01em` | `1.3` | Date badges, Member roles, Status subtitles |
| **Micro Time** | `Geist Mono` | `0.6875rem` (11px)| `400` (Regular) | `normal` | `1.2` | Message bubble timestamps, Latency HUD |
| **Code / JSON** | `Geist Mono` | `0.8125rem` (13px)| `400` (Regular) | `normal` | `1.6` | API payload inspector, cURL snippets |

### 2.4 Spacing, Grid & Elevation Scale

- **Grid Baseline**: Strict 4px/8px modular spacing scale (`p-1` = 4px, `p-2` = 8px, `p-3` = 12px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px).
- **Elevation Layers**:
  - **Level 0 (Canvas)**: `bg-surface-base`, no shadow.
  - **Level 1 (Sidebar & Cards)**: `bg-surface-raised border border-border-subtle shadow-sm`.
  - **Level 2 (Dropdowns & Floating Actions)**: `bg-surface-overlay border border-border-moderate shadow-lg shadow-black/10`.
  - **Level 3 (Modal Dialogs & Drawers)**: `bg-surface-card border border-border-moderate shadow-2xl shadow-black/25 backdrop-blur-xl`.
  - **Level 4 (Toasts & Tooltips)**: `bg-slate-900 text-white shadow-xl border border-white/10`.
- **Corner Radii Tokens**:
  - Full / Pills: `rounded-full` (Avatars, unread badges, status chips, floating action buttons).
  - Cards & Containers: `rounded-2xl` (16px) (Modals, cards, landing bento items).
  - Inputs & Buttons: `rounded-xl` (12px) (Action buttons, form fields).
  - Outgoing Message Bubble: `rounded-2xl rounded-br-xs` (16px top-left, top-right, bottom-left; 4px bottom-right).
  - Incoming Message Bubble: `rounded-2xl rounded-bl-xs` (16px top-left, top-right, bottom-right; 4px bottom-left).

### 2.5 Micro-Interactions & Animation Dynamics

We use **Framer Motion** for physics-based layout transitions and spring micro-interactions:
- **Message Bubble Entrance**: Spring scale + slide up (`initial: { opacity: 0, y: 12, scale: 0.96 }`, `animate: { opacity: 1, y: 0, scale: 1 }`, `transition: { type: "spring", stiffness: 450, damping: 30 }`).
- **Sidebar Active Selection Pill**: Framer Motion `layoutId="activeIndicator"` with continuous smooth morphing between conversation items.
- **Button Feedback**: `whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }}` for instant tactile feedback.
- **Scroll-to-Bottom Floating Badge**: Animated bounce entrance with spring physics when new messages arrive out-of-viewport.
- **Drawer Slide Transition**: Smooth spring slide from right (`initial: { x: "100%" }`, `animate: { x: 0 }`, `exit: { x: "100%" }`).

---

## 3. Information Architecture & Route Hierarchy

```
/ (Public Creative Landing Page)
├── Sticky Glassmorphic Navbar (Brand logo, Live Status, Navigation Links, "Launch App" CTA)
├── Hero Section with Live Interactive Mini-Chat Simulator (instant interactive chat sandbox)
├── Bento Grid Feature Showcase (Real-time engine, Group governance, Smart scroll, Passwordless auth)
├── Interactive Architecture & API Inspector (Live REST/WebSocket tabbed code explorer with payload copy)
├── Tech Stack Matrix & Performance Benchmarks
└── Conversion Footer & Links

/login (Authentication Shell)
├── Ambient Glow Canvas Background
├── Card Container (Elevated glassmorphism)
├── Passwordless Form (Country code + Phone Input, Name Input, Form validation)
├── Auto-Registration Welcome Banner (Clear UX feedback for first-time visitors)
└── Status Banner / Error Toast

/chat (Protected Main Application Shell)
├── Responsive 3-Pane Adaptive Layout:
│   ├── Left Pane: Navigation & Conversation Hub (Width: 360px on desktop, 100% on mobile)
│   │   ├── User Profile Header (Avatar, Name, Connection Status HUD, Theme Toggle, Logout)
│   │   ├── Search & Filter Toolbar (Instant filter + "New Direct Message" & "New Group" buttons)
│   │   └── Conversation List (Direct vs Group avatars, Active highlight pill, Unread badges, Timestamps)
│   │
│   ├── Center Pane: Main Chat Panel (Flex-1 Main Viewport)
│   │   ├── Active Conversation Header (Title, Presence Subtitle, Socket Health Pill, Search, Drawer Toggle)
│   │   ├── Message Stream Engine:
│   │   │   ├── Sticky Date Separator Pills ("Today", "Yesterday", "August 21, 2026")
│   │   │   ├── Infinite Cursor History Stream (Scroll-up pagination with scroll retention)
│   │   │   ├── Sender vs Receiver Bubble Stream with HSL Group Sender Identification
│   │   │   ├── System Event Badges ("Sarah Connor created group", "Alex joined")
│   │   │   └── Floating "New Messages ↓" Pill Button (Bounces on unread message while scrolled up)
│   │   └── Message Composer:
│   │       ├── Auto-expanding multiline textarea (min 44px, max 160px)
│   │       ├── Character / whitespace validation (Empty send prevention)
│   │       ├── Emoji Picker Trigger & Quick Reactions
│   │       └── Send Button (Active Indigo pulse when text is entered)
│   │
│   └── Right Pane / Slide-over Drawer: Group Governance & Conversation Details
│       ├── Group Metadata (Group Avatar, Member Count, Created Date)
│       ├── Group Title Inline Editor (Admins only)
│       ├── Add Participants Button & Selector (Admins only)
│       ├── Participant List with "Admin" Badges & Action Dropdowns (Promote, Remove)
│       └── "Leave Group" Destructive Action (Confirmation Modal)
```

---

## 4. Component-by-Component UI/UX Blueprint

### 4.1 Authentication Screen (`/login`)

#### Detailed UX Design Choices for Auth:
1. **Passwordless Unified Entry**: Eliminates friction of passwords or separate sign-up tabs. If the phone is new, the server registers it instantly; if existing, logs in.
2. **First-Time User Assurance**: A subtle badge explicitly notes: *"No password required. New phone numbers are automatically registered."* to eliminate confusion about where to "register".
3. **Phone Sanitization & Formatting**: Formats input smoothly while retaining the E.164 standard `+` international prefix required by the backend.
4. **Validation UX (Zod + React Hook Form)**:
   - Phone: Must contain valid country prefix and at least 7 digits.
   - Name: Must be between 2 and 50 characters, trimmed of leading/trailing whitespace.
   - Submissions show animated spinner inside the primary button and disable fields to prevent double-submissions.
5. **Post-Login State Transition**: Upon receiving JWT, token and user profile are saved to `localStorage` and `AuthContext`, immediately triggering a smooth slide transition to `/chat`.

### 4.2 Left Sidebar & Conversation Hub

#### Detailed UX Design Choices for Sidebar:
1. **User Profile Bar (Top)**:
   - **Avatar Component**: Displays user's initials over an algorithmically generated HSL background color (`hashToHsl(user._id)`).
   - **Live Presence Indicator**: Emerald dot = Connected to WebSocket; Amber dot = Reconnecting; Slate dot = Offline.
   - **User Info**: Displays name (`font-semibold text-sm`) and formatted phone number (`text-xs text-muted-foreground`).
   - **Action Bar**: Direct theme switch button (Dark/Light) and Logout button with a confirmation popover.
2. **Search & Action Bar**:
   - Integrated search input with instantaneous client-side filtering across active conversation names and last message snippets.
   - Quick action button: Gradient `+ New Chat` button that opens the New Conversation Modal.
3. **Conversation List Items**:
   - **Direct vs Group Visual Distinction**:
     - Direct chats: Single 44px circular avatar with online status badge.
     - Group chats: Stacked dual-avatar or distinct group icon badge with member count badge.
   - **Active State**: Highlighted with an Indigo accent border on the left (`border-l-4 border-indigo-500`), subtle tinted background (`bg-indigo-500/10 dark:bg-indigo-500/15`), and smooth `layoutId` pill animation.
   - **Last Message Snippet**: Formatted with intelligent prefixing:
     - Sent by self: `"You: See you tomorrow"`
     - Sent by other in group: `"Alex: Sounds like a plan"`
   - **Timestamp Display**: Smart relative formatting (`"Just now"`, `"4m"`, `"11:30 AM"`, `"Yesterday"`, `"Aug 12"`).
   - **Unread Badge**: Pill badge in high-visibility Indigo (`bg-indigo-500 text-white font-bold text-xs px-2 py-0.5 rounded-full`) with a soft glow.
4. **Empty & Loading States**:
   - Shimmer skeleton loaders matching exact conversation item dimensions during initial fetch.
   - Empty state: Clean illustration with message *"No conversations yet. Start a new chat to begin messaging."* and a direct CTA button.

### 4.3 User Search & New Conversation Modal

#### Detailed UX Design Choices for User Search:
1. **API Quirk Shielding & Sanitization**:
   - The backend `/api/users/search?q={query}` endpoint uses a MongoDB RegExp that crashes with HTTP 500 if special regex characters (`+`, `*`, `?`, `^`, `$`, `[`, `]`, `(`, `)`) are sent raw.
   - The frontend automatically escapes all regex metacharacters and strips leading `+` before dispatching debounced requests.
2. **Debounced Search Dispatch**: Dispatches 300ms after user stops typing to minimize unnecessary server requests.
3. **Query Match Highlighting**: Characters matching the user's search query are highlighted with bold accent text.
4. **Multi-Participant Tokenizer for Groups**:
   - In "Create Group" mode, clicking users adds them as dismissible chips (`[ Alex Mercer ✕ ] [ Maya Lin ✕ ]`).
   - Group name input with 30-character limit and emoji helper.
   - "Create Group" button activates once group name is entered and at least 2 participants are selected.

### 4.4 Main Chat Panel & Message Stream (The Core Focus)

#### Detailed UX Design Choices for Chat Panel:
1. **Visual Bubble Differentiation**:
   - **Outgoing (User's Messages)**:
     - Placed on the right margin.
     - Styled in Vibrant Indigo gradient (`bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-sm`).
     - Asymmetric corner radius: Top-left `16px`, Top-right `16px`, Bottom-left `16px`, Bottom-right `4px` (forming an organic message tail).
     - Timestamp in subtle translucent white (`text-indigo-200 text-[11px]`) with sent/delivered status checkmarks.
   - **Incoming (Counterpart Messages)**:
     - Placed on the left margin.
     - Styled in Subdued Surface Overlay (`bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/50`).
     - Asymmetric corner radius: Top-left `16px`, Top-right `16px`, Bottom-left `4px`, Bottom-right `16px`.
     - In group conversations, the sender's display name is prominently displayed above the bubble in a unique deterministic HSL color.
2. **Consecutive Message Stacking**:
   - When the same user sends consecutive messages within 2 minutes:
     - The sender avatar and name are omitted on subsequent messages to reduce visual noise.
     - Vertical spacing is tightened from `mb-4` to `mb-1`.
     - Corner radii adapt into a stacked pill format.
3. **Smart Auto-Scroll Engine (`useSmartScroll`)**:
   - **Initial Mount / Conversation Switch**: Automatically scrolls smoothly to the newest message.
   - **User Sends a Message**: Instantly scrolls to bottom to show the outgoing message.
   - **Incoming Message While At Bottom**: Automatically scrolls to bottom to show the new message.
   - **Incoming Message While Scrolled Up (Reading History)**:
     - **Does NOT** force-scroll or disrupt the user's reading position.
     - Triggers an animated floating pill button: `[ ↓ 2 New Messages ]` at the bottom of the chat view.
     - Clicking the floating pill smoothly animates the viewport down to the latest message.
4. **Infinite Cursor History Loading**:
   - When the user scrolls near the top (< 100px from top), TanStack `useInfiniteQuery` fetches the previous page using `GET /api/conversations/:id/messages?before={oldestMessageCreatedAt}&limit=50`.
   - The scroll manager computes `newScrollHeight - previousScrollHeight` and instantly offsets the scroll container so older messages appear without any visual jumping.
5. **Message Composer & Keyboard Ergonomics**:
   - Auto-growing multiline `textarea` that expands from 44px up to 160px with internal scrolling thereafter.
   - `Enter` submits the message; `Shift + Enter` creates a newline.
   - Send button is visually disabled and greyed out when text is empty or contains only whitespace (`!text.trim()`).
   - Typing instantly triggers optimistic UI update: the message bubble appears with a clock icon, which transitions to checkmarks upon server confirmation.

### 4.5 Group Governance & Details Drawer

#### Detailed UX Design Choices for Group Governance:
1. **Role-Based Action Visibility**:
   - Group Admin actions (Rename Group, Add Members, Promote Member to Admin, Remove Member) are displayed only if `currentUserId` is present in `group.admins`.
   - Non-admin members see read-only metadata and the member roster.
2. **Inline Group Renaming**: Admins can edit the group name directly with inline save and cancel controls, issuing `PATCH /api/conversations/:id`.
3. **Member Context Menu**:
   - Three-dot menu (`⋮`) on member rows presents:
     - **Make Group Admin** (`POST /api/conversations/:id/admins`)
     - **Remove from Group** (`DELETE /api/conversations/:id/participants/:userId`) with safety confirmation dialog.
4. **"Leave Group" Action**:
   - Available to all members (`DELETE /api/conversations/:id/participants/{myUserId}`).
   - Triggers an alert modal: *"Are you sure you want to leave this group? You will no longer receive new messages."*
5. **Real-Time Group State Propagation**:
   - Backend broadcasts `conversation:updated` on all group mutations.
   - All participants receive the updated title, member roster, and admin badges instantaneously without page reload.

---

## 5. Bonus & Original "One-Step-Ahead" UX Enhancements

To satisfy and exceed the assignment's bonus criteria for original, thoughtful additions:

1. **Real-Time Connection Health HUD & Latency Meter**:
   - Floating/header status pill that measures real-time round-trip latency to the WebSocket server (e.g. `● 32ms`) and presents a visual reconnecting countdown when network drops.
2. **Search Query String Highlighter**:
   - Highlights matching substrings with a luminous accent tag when searching through users and conversations.
3. **Optimistic Send Failure Recovery & Retry Queue**:
   - If an outgoing message fails to send (e.g. temporary network offline), the message bubble remains in the stream with a red warning badge and a single-click "Retry" button.
4. **Subtle Audio & Haptic Feedback Cues (with User Mute Toggle)**:
   - Plays an elegant, low-frequency audio pop when sending and receiving messages (implemented via Web Audio API, zero external asset dependencies, with persistent mute toggle).
5. **Quick Message Action Menu**:
   - Hover action bar on message bubbles allowing one-click copy of message text or viewing exact ISO timestamp tooltips.

---

## 6. Multi-Phase Implementation Plan

### Phase 1: Foundation, Design Tokens, Core Utils, Auth & Route Protection

#### Objectives:
- Install dependencies: `@tanstack/react-query`, `socket.io-client`, `lucide-react`, `react-hook-form`, `@hookform/resolvers`, `zod`, `clsx`, `tailwind-merge`, `date-fns`, `framer-motion`.
- Setup API client wrapper (`lib/api/client.ts`) with automatic `Authorization: Bearer <token>` injection and error normalization.
- Setup `AuthContext` with JWT storage in `localStorage` and `useAuth` hook.
- Implement Route Guard: redirect unauthenticated visits to `/chat` -> `/login`, and authenticated visits to `/login` -> `/chat`.
- Build the **Login Screen (`/login`)** with phone formatting, Zod validation, loading states, and auto-registration guidance.

### Phase 2: Chat Sidebar, Conversation Management & User Search

#### Objectives:
- Build the persistent chat shell layout (`/chat`).
- Build the **Sidebar**:
  - User header profile with status indicator, user name, phone number, and logout button.
  - Conversation search input (client-side filtering).
  - "New Chat" button opening the User Search modal.
  - Conversation list rendering both direct and group chats with avatars, active highlight pill, last message snippet, relative timestamp, and unread badges.
  - Shimmer loading skeleton and empty states.
- Build the **User Search Modal**:
  - Debounced input querying `GET /api/users/search?q={query}`.
  - Regex sanitization to prevent MongoDB 500 error on `+` or special characters.
  - User search results with match highlighter and direct conversation creation.

### Phase 3: Message Stream, Sending, Auto-Scroll & Real-Time Sync

#### Objectives:
- Build the **Active Conversation Header**:
  - Displays conversation title (user name or group name), presence status, and Socket connection health indicator.
- Build the **Message Stream**:
  - Chronological message list with distinct Outgoing (Indigo gradient) vs Incoming (Slate overlay) bubble designs.
  - Distinct sender name colors for group chats.
  - Date group divider badges ("Today", "Yesterday", "Aug 21").
- Build the **Smart Auto-Scroll Engine (`useSmartScroll`)**:
  - Auto-scrolls on new messages if at bottom or when user sends.
  - Pauses auto-scroll if user has scrolled up to read history.
  - Displays floating "New Messages ↓" pill button when new messages arrive while scrolled up.
- Build the **Infinite Cursor History Stream**:
  - Fetches older messages when scrolling to top (`before` query parameter) with seamless scroll position retention.
- Build the **Message Input Composer**:
  - Auto-expanding textarea with character validation, empty send prevention, and `Enter` / `Shift+Enter` key handling.
  - Optimistic UI updates with instant bubble rendering and delivery checkmarks.
- Integrate **Socket.io Real-Time Pipeline**:
  - Connect socket with auth token on login.
  - Listen for `message:new`: update active message cache and update conversation list's `lastMessage`.

### Phase 4: Group Conversations, Admin Controls & Member Management

#### Objectives:
- Build **Create Group Modal**:
  - Multi-user participant selector chips, group name input, and creation submission via `POST /api/conversations/group`.
- Build **Group Details Drawer**:
  - Displays group metadata, member count, and creation date.
  - **Admin Actions** (Visible only if current user is in `group.admins`):
    - Inline edit / rename group (`PATCH /api/conversations/:id`).
    - Add new members (`POST /api/conversations/:id/participants`).
    - Promote existing member to admin (`POST /api/conversations/:id/admins`).
    - Remove member from group (`DELETE /api/conversations/:id/participants/:userId`).
  - **Member Actions**:
    - "Leave Group" button (`DELETE /api/conversations/:id/participants/{myUserId}`) with confirmation dialog.
- Real-Time Synchronization:
  - Socket event `conversation:updated` updates group title, member list, and admin status across all participants in real time.

### Phase 5: Creative Showcase Landing Page (`/`)

#### Objectives:
- Build the **Creative Showcase Landing Page**:
  - Luxury dark glassmorphism aesthetic with ambient animated glow and crisp typography.
  - **Sticky Navbar**: Brand logo, live status indicator, navigation anchors, "Launch App" CTA.
  - **Hero Section**: Value proposition, primary CTA, and **Interactive Live Chat Simulator** (interactive browser sandbox).
  - **Bento Grid Feature Showcase**: Visual breakdown of real-time sync, group collaboration, smart auto-scroll, and passwordless auth.
  - **Interactive Architecture & Live API Inspector**: Tabbed code explorer showing REST endpoints, WebSocket protocol, and data models.
  - **Conversion Footer**: Repository, documentation, and live app links.

### Phase 6: Polish, Bonus Features, Error Handling & Thought Process Documentation

#### Objectives:
- Implement Bonus UX additions:
  - Connection Health HUD & Latency Meter.
  - Search query string highlighter.
  - Optimistic message retry on failure.
  - Audio/haptic feedback cues with mute toggle.
- Comprehensive Error Boundaries & Toast notifications.
- Complete Thought Process Write-up (`docs/thought-process.md` & `README.md`).

---

## 7. Verification & Test Matrix

| Component / Feature | Test Scenario | Expected Outcome | Pass Criteria |
| :--- | :--- | :--- | :--- |
| **Authentication** | Login with valid phone & name | JWT stored, user profile loaded, redirected to `/chat` | ✅ Pass |
| **Route Guard** | Access `/chat` without token | Automatically redirected to `/login` | ✅ Pass |
| **User Search** | Search with special characters (`+`, `#`, `[`) | Sanitized query dispatched without 500 error | ✅ Pass |
| **Direct Chat** | Select user from search | Direct conversation created/opened in main view | ✅ Pass |
| **Message Sending** | Send text message | Instant optimistic render + WebSocket broadcast | ✅ Pass |
| **Empty Message** | Attempt to send `""` or `" "` | Send button disabled, Enter key ignored | ✅ Pass |
| **Real-Time Sync** | 2 browser sessions open | Message sent in Window A appears in Window B instantly | ✅ Pass |
| **Auto-Scroll** | Receive message while scrolled up | Scroll position maintained + "New Messages ↓" button shown | ✅ Pass |
| **Infinite History**| Scroll to top of message list | Older messages prepended without layout jumping | ✅ Pass |
| **Group Creation** | Create group with 2+ members | Group created with Creator as Admin, appears in all sidebars | ✅ Pass |
| **Admin Governance**| Promote admin, rename, remove user | Real-time `conversation:updated` updates UI for all members | ✅ Pass |
| **Landing Simulator**| Type & send in landing mini-chat | Interactive simulation updates bubbles & auto-scrolls | ✅ Pass |

---

## 8. Milestone Execution Roadmap

1. **Checkpoint 1 (Phase 1):** Auth, API client, Providers & Login page working.
2. **Checkpoint 2 (Phase 2):** Sidebar, conversation listing, and user search modal working.
3. **Checkpoint 3 (Phase 3):** Real-time chat stream, auto-scroll, message sending, and Socket.io working.
4. **Checkpoint 4 (Phase 4):** Group chats, admin management, member drawer working.
5. **Checkpoint 5 (Phase 5):** Creative landing page and interactive simulator working.
6. **Checkpoint 6 (Phase 6):** Thought process write-up, README, and final build check.

