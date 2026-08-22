# Taghyeer Chat System — Master Execution & UI/UX Plan

> **Assignment:** Frontend Developer Take-Home Task  
> **Master Blueprint:** [`docs/implementation-plan.md`](file:///mnt/01DAAF995C961E10/personal_projects/Job%20Assignments/taghyeer-chat-system/docs/implementation-plan.md)  
> **API Specifications:** [`docs/api-documentation.md`](file:///mnt/01DAAF995C961E10/personal_projects/Job%20Assignments/taghyeer-chat-system/docs/api-documentation.md)  
> **Requirements & Prompt:** [`docs/requirements.md`](file:///mnt/01DAAF995C961E10/personal_projects/Job%20Assignments/taghyeer-chat-system/docs/requirements.md)

---

## 1. Executive Master Plan & UI/UX Strategy

This master plan establishes the core architecture, design system, component hierarchy, interaction physics, and implementation roadmap for the **Taghyeer Chat System**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                     Taghyeer Chat Application                          │
├──────────────────────────────────┬─────────────────────────────────────┤
│  Part 1: Chat Application        │  Part 2: Creative Landing Page      │
│  - Passwordless Phone Auth       │  - Dark Neo-Glassmorphism Hero      │
│  - Real-Time WebSocket Engine    │  - Interactive Live Chat Simulator  │
│  - 1-on-1 & Multi-User Groups    │  - Bento Grid Feature Architecture  │
│  - Admin Role Governance         │  - Interactive API & Socket Viewer  │
│  - Intelligent Auto-Scroll       │  - Tech Stack & Dev Highlights      │
└──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 2. Core Design Choices & Ergonomics

| Area | Key Design Choice | Rationale & UX Benefit |
| :--- | :--- | :--- |
| **Aesthetic Identity** | Dark Neo-Glassmorphism (`#0B0F19` base) with Electric Indigo accents (`#6366F1`) | Premium, modern SaaS look with maximum visual contrast and minimal ocular fatigue during prolonged chatting sessions. |
| **Authentication Flow** | Unified Passwordless Login (`POST /api/auth/login`) with auto-registration | Zero-friction onboarding; first-time visitors are automatically provisioned without needing a separate register form. |
| **Message Bubbles** | Asymmetric corner radii (`rounded-2xl` with `rounded-br-xs` / `rounded-bl-xs`) + distinct sender palette | Instantly signals directionality: Sent messages pop in Electric Indigo; Received messages rest comfortably on slate surfaces. |
| **Group Identification**| Deterministic HSL avatar and sender name color hashing (`hashToHsl(userId)`) | Distinguishes multiple group participants effortlessly without cognitive overhead. |
| **Auto-Scroll Engine** | Non-disruptive scroll threshold (>150px locks scroll) + Floating "New Messages ↓" pill | Prevents the jarring UX problem of jumping down while reading history, while still offering single-click jump to latest. |
| **Group Governance** | Contextual Admin Dropdowns & Slide-over Management Drawer | Enforces strict role separation (Admins can rename, invite, promote, remove; members can leave) with real-time sync. |
| **API Resilience** | Input sanitization for search + Cursor deduplication for message history | Eliminates MongoDB RegExp 500 crashes and avoids key collisions during infinite scroll. |
| **Landing Sandbox** | Interactive In-Hero Chat Simulator | Allows visitors to test real-time physics and UI animations directly on the landing page before logging in. |

---

## 3. Phased Implementation Roadmap

1. **Phase 1: Foundation, Tokens, Auth & Route Protection**
   - Package setup (`@tanstack/react-query`, `socket.io-client`, `framer-motion`, `lucide-react`, `zod`).
   - Authenticated API client wrapper, `AuthContext`, and `/login` screen with phone validation.
2. **Phase 2: Chat Sidebar, Conversation Hub & User Search**
   - 3-pane responsive layout shell, conversation list with unread badges, debounced user search modal.
3. **Phase 3: Real-Time Chat Panel, Message Stream & Auto-Scroll**
   - Outgoing vs incoming bubble styling, Socket.io `message:new` event integration, smart scroll engine.
4. **Phase 4: Multi-User Groups, Admin Controls & Member Management**
   - Create group modal, slide-over drawer, promote admin, remove member, real-time `conversation:updated`.
5. **Phase 5: Creative Showcase Landing Page (`/`)**
   - Luxury hero section, interactive live chat simulator, bento feature grid, interactive API inspector.
6. **Phase 6: Polish, Bonus Features & Thought Process Write-up**
   - Latency HUD, search string highlighter, audio blip cue, failure retry, and `docs/thought-process.md`.

---

## 4. Documentation Index

- 📘 [**Comprehensive Implementation & UI/UX Plan (`docs/implementation-plan.md`)**](file:///mnt/01DAAF995C961E10/personal_projects/Job%20Assignments/taghyeer-chat-system/docs/implementation-plan.md) — Exhaustive specification of all tokens, typography, component hierarchies, state machines, and testing matrix.
- 📗 [**API Specification & Integration Guide (`docs/api-documentation.md`)**](file:///mnt/01DAAF995C961E10/personal_projects/Job%20Assignments/taghyeer-chat-system/docs/api-documentation.md) — Live-tested REST endpoints, WebSocket protocol, schemas, and edge case solutions.
- 📙 [**Assignment Requirements (`docs/requirements.md`)**](file:///mnt/01DAAF995C961E10/personal_projects/Job%20Assignments/taghyeer-chat-system/docs/requirements.md) — Original task briefing, deliverables, and evaluation criteria.

