# Chat Application API Documentation & Integration Specification

> **Deliverable:** Part 1 — API Documentation  
> **Target Base URL (REST):** `https://frontend-task-chatapp.onrender.com/api`  
> **Root Origin (Health & WebSocket):** `https://frontend-task-chatapp.onrender.com`  
> **Protocol:** RESTful HTTPS + WebSocket (Socket.io v4)  
> **Authentication:** Bearer JWT (JSON Web Token)

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Core Data Models & Schemas](#3-core-data-models--schemas)
4. [REST API Endpoints](#4-rest-api-endpoints)
   - [System](#system)
     - [`GET /health`](#get-health)
   - [Auth](#auth)
     - [`POST /api/auth/login`](#post-apiauthlogin)
     - [`GET /api/auth/me`](#get-apiauthme)
   - [Users](#users)
     - [`GET /api/users/search`](#get-apiuserssearch)
   - [Conversations](#conversations)
     - [`GET /api/conversations`](#get-apiconversations)
     - [`POST /api/conversations`](#post-apiconversations)
     - [`GET /api/conversations/:id/messages`](#get-apiconversationsidmessages)
   - [Messages](#messages)
     - [`POST /api/messages`](#post-apimessages)
   - [Group Management](#group-management)
     - [`POST /api/conversations/group`](#post-apiconversationsgroup)
     - [`PATCH /api/conversations/:id`](#patch-apiconversationsid)
     - [`POST /api/conversations/:id/participants`](#post-apiconversationsidparticipants)
     - [`DELETE /api/conversations/:id/participants/:userId`](#delete-apiconversationsidparticipantsuserid)
     - [`POST /api/conversations/:id/admins`](#post-apiconversationsidadmins)
5. [Real-Time WebSocket Protocol (Socket.io)](#5-real-time-websocket-protocol-socketio)
   - [Connection & Handshake](#connection--handshake)
   - [Client-to-Server Events](#client-to-server-events)
   - [Server-to-Client Events](#server-to-client-events)
6. [Live API Edge Cases, Quirks & Workarounds](#6-live-api-edge-cases-quirks--workarounds)
7. [TypeScript Type Definitions](#7-typescript-type-definitions)

---

## 1. Overview & Architecture

The Chat Application API is a hybrid service combining **RESTful HTTP JSON endpoints** for stateless persistence, queries, and mutations with **Socket.io (WebSockets)** for bidirectional, low-latency, real-time message delivery and conversation status synchronization.

```
┌────────────────────────────────────────────────────────┐
│                   Next.js Client App                   │
└───────────────┬────────────────────────┬───────────────┘
                │ HTTP REST              │ Socket.io
                │ (JSON over HTTPS)      │ (WSS / Long-polling)
                ▼                        ▼
┌────────────────────────────────────────────────────────┐
│             Chat Application Backend Server            │
│       https://frontend-task-chatapp.onrender.com       │
├────────────────────────────────────────────────────────┤
│  REST API Base: /api           Socket Gateway: /       │
└────────────────────────────────────────────────────────┘
```

### Key Conventions
- **Request Format:** All REST POST/PATCH request bodies must have `Content-Type: application/json`.
- **Response Format:** All JSON responses are UTF-8 encoded.
- **Timestamps:** All dates and timestamps are formatted as ISO 8601 strings (e.g. `2026-08-21T11:17:45.354Z`).
- **Identifiers:** MongoDB ObjectIDs formatted as 24-character hexadecimal strings (e.g. `6a8833d9e5d6aac97521f00d`).

---

## 2. Authentication & Authorization

### 2.1 Passwordless Unified Authentication Flow
The backend uses a frictionless passwordless authentication model where `POST /api/auth/login` serves as both registration and login:
1. The user inputs their phone number (e.g. `+12025550101`) and display name (e.g. `Sarah Connor`).
2. **First-Time User**: The backend provisions a new MongoDB user document and generates a signed JWT.
3. **Returning User**: The backend matches the phone number, retrieves the existing user document, and generates a signed JWT.
4. **Token Structure**: The server returns `{ token: string, user: User }`. The JWT contains the user's encoded `id` and claims.

---

### 2.2 Client-Side Session Lifecycle & Persistence Strategy

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                 SESSION LIFECYCLE                                     │
│                                                                                       │
│  [ Login / Provision ]                                                                │
│        │                                                                              │
│        ▼                                                                              │
│  POST /api/auth/login ──► Receive { token, user }                                     │
│        │                                                                              │
│        ├──► 1. Persist JWT in localStorage ("chat_auth_token")                         │
│        ├──► 2. Store user in React AuthContext state                                  │
│        ├──► 3. Attach Bearer token to all REST apiClient headers                      │
│        └──► 4. Establish Socket.io connection with auth: { token }                    │
│                                                                                       │
│  [ Page Refresh / Revisit ]                                                           │
│        │                                                                              │
│        ▼                                                                              │
│  Read token from localStorage ──► GET /api/auth/me                                    │
│        │                                                                              │
│        ├── [ 200 OK ] ────────► Hydrate User + Connect Socket ──► Render /chat        │
│        └── [ 401 Unauthorized ] ► Clear localStorage + Disconnect Socket ──► /login    │
│                                                                                       │
│  [ Logout ]                                                                           │
│        │                                                                              │
│        ▼                                                                              │
│  Clear localStorage + Reset Auth State + socket.disconnect() ──► Redirect /login      │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Storage Mechanism**: The JWT token is securely stored in `localStorage` under the key `chat_auth_token`.
2. **Session Bootstrapping (`initializeAuth`)**:
   - When the client loads, `AuthProvider` reads the token from `localStorage`.
   - If present, it dispatches `GET /api/auth/me` with `Authorization: Bearer <token>`.
   - Upon a `200 OK` response, it hydrates user state, initializes the real-time Socket.io gateway, and kicks off background directory caching.
3. **Session Invalidation**:
   - If `GET /api/auth/me` returns `401 Unauthorized` (token expired or revoked), the client cleans up `localStorage`, clears the user context, disconnects the WebSocket, and redirects the user to `/login`.
4. **REST Request Interceptor**:
   - All protected requests pass through the centralized `apiClient` wrapper, which dynamically injects the `Authorization: Bearer <token>` header:
   ```typescript
   const headers: HeadersInit = {
     "Content-Type": "application/json",
     ...(token ? { Authorization: `Bearer ${token}` } : {}),
   };
   ```
5. **WebSocket Handshake Auth**:
   - When establishing the real-time Socket.io connection, the token is passed in the handshake payload:
   ```typescript
   import { io } from "socket.io-client";

   const socket = io("https://frontend-task-chatapp.onrender.com", {
     auth: { token: "<your_jwt_token>" },
     transports: ["websocket", "polling"],
     reconnection: true,
   });
   ```

---

### 2.3 Error Response Schema
When a request fails authentication, validation, or authorization, the server returns a structured error object:
```json
{
  "error": {
    "message": "Human-readable error description",
    "code": "ERROR_CODE_STRING",
    "details": [
      {
        "path": "fieldName",
        "message": "Field specific failure explanation"
      }
    ]
  }
}
```

| Error Code | HTTP Status | Meaning |
| :--- | :--- | :--- |
| `NO_TOKEN` | `400 Bad Request` | Missing `Authorization` header on a protected route |
| `INVALID_TOKEN` | `401 Unauthorized` | JWT is expired, malformed, or has an invalid signature |
| `FORBIDDEN` | `403 Forbidden` | Authenticated user lacks admin permission for the action |
| `VALIDATION_ERROR` | `400 Bad Request` | Request payload failed schema validation |
| `NOT_FOUND` | `404 Not Found` | Requested conversation or user resource does not exist |

---

## 3. Core Data Models & Schemas

### User Entity
Represents an authenticated registered user account.
```typescript
interface User {
  _id: string;          // e.g. "6a8833d9e5d6aac97521f00d"
  name: string;         // e.g. "Sarah Connor"
  phone: string;        // e.g. "+12025550101"
  createdAt?: string;   // ISO 8601 timestamp
}
```

### Message Entity
Represents a single chat message sent within a direct or group conversation.
```typescript
interface Message {
  _id: string;              // Message ID
  conversation: string;     // Conversation ID reference
  sender: string | User;    // Sender User ID (or populated User object in some contexts)
  text: string;             // Text content of the message
  createdAt: string;        // ISO 8601 timestamp
}
```

### Conversation Entity (Direct vs Group)
A conversation can be either `direct` (1-to-1) or `group` (multi-participant).

#### Direct Conversation (`type === "direct"`)
```typescript
interface DirectConversation {
  _id: string;
  type: "direct";
  participant: User;         // The other participant in the conversation
  lastMessage?: {
    text: string;
    sender: string;
    createdAt: string;
  };
  updatedAt: string;
  createdAt?: string;
}
```

#### Group Conversation (`type === "group"`)
```typescript
interface GroupConversation {
  _id: string;
  type: "group";
  name: string;              // Name of the group
  createdBy: string;         // User ID of group creator
  admins: string[];          // Array of User IDs with admin privileges
  participants: User[];      // Array of populated User objects
  lastMessage?: {
    text?: string;
    sender?: string;
    createdAt?: string;
  };
  updatedAt: string;
  createdAt: string;
}
```

---

## 4. REST API Endpoints

### System

#### `GET /health`
*Note: Located at the server root, NOT under `/api`.*

- **Auth:** None (Public)
- **Description:** Verifies server availability and uptime status.

##### Request
```http
GET /health HTTP/1.1
Host: frontend-task-chatapp.onrender.com
```

##### Response `200 OK`
```json
{
  "status": "ok"
}
```

---

### Auth

#### `POST /api/auth/login`
- **Auth:** None (Public)
- **Description:** Logs in an existing user or creates a new account if the phone number is not yet registered.

##### Request Headers
```http
Content-Type: application/json
```

##### Request Body
```json
{
  "phone": "+12025550101",
  "name": "Sarah Connor"
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `phone` | `string` | **Yes** | Phone number including country code (e.g. `+12025550101`) |
| `name` | `string` | **Yes** | Display name of the user |

##### Response `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6a8833d9e5d6aac97521f00d",
    "name": "Sarah Connor",
    "phone": "+12025550101",
    "createdAt": "2026-08-21T11:17:45.354Z"
  }
}
```

##### Error Responses
- **`400 Bad Request` (Missing fields):**
  ```json
  {
    "error": {
      "message": "Validation failed",
      "code": "VALIDATION_ERROR",
      "details": [
        {
          "path": "phone",
          "message": "Required"
        }
      ]
    }
  }
  ```

---

#### `GET /api/auth/me`
- **Auth:** Bearer Token (Protected)
- **Description:** Retrieves the authenticated user profile based on the supplied JWT. Used for session persistence and validation.

##### Request Headers
```http
Authorization: Bearer <token>
```

##### Response `200 OK`
```json
{
  "_id": "6a8833d9e5d6aac97521f00d",
  "name": "Sarah Connor",
  "phone": "+12025550101",
  "createdAt": "2026-08-21T11:17:45.354Z"
}
```

##### Error Responses
- **`400 Bad Request` (No Token):**
  ```json
  {
    "error": {
      "message": "No token provided",
      "code": "NO_TOKEN"
    }
  }
  ```
- **`401 Unauthorized` (Invalid/Expired Token):**
  ```json
  {
    "error": {
      "message": "Invalid token",
      "code": "INVALID_TOKEN"
    }
  }
  ```

---

### Users

#### `GET /api/users/search`
- **Auth:** Bearer Token (Protected)
- **Description:** Search for registered users by name or phone number.

##### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `q` | `string` | **Yes** | Search keyword (User's name or phone number) |

##### Request Example
```http
GET /api/users/search?q=Sarah HTTP/1.1
Authorization: Bearer <token>
```

##### Response `200 OK`
```json
[
  {
    "_id": "6a8833d9e5d6aac97521f00d",
    "name": "Sarah Connor",
    "phone": "+12025550101"
  }
]
```

> **Warning (Backend Regex & Query Caveats):**  
> 1. **Regex Crash on `+`**: Special regex characters like a leading `+` (e.g. `q=+1202...`) are passed directly into MongoDB `new RegExp(...)` without sanitization on the server, triggering error code `51091` (`500 Internal Server Error: quantifier does not follow a repeatable item`).  
> 2. **Exact String Match on `phone`**: The backend executes `{ phone: req.query.q }` as a strict equality check. Partial phone searches on the API (such as `10000` for `+100000000000`) will return `0` results from the server.  
> 3. **Case Sensitivity on `name`**: Name regex searches are case-sensitive (e.g. searching lowercase `w` does not match names starting with uppercase `W` like `Whatever`).  
> 4. **Client Workaround**: The frontend implements a background directory index across uppercase alphabet chunks (`A-Z`, `0-9`) combined with sanitized multi-variant server queries and client-side scoring for 100% accurate recall on partial names and phone numbers.

---

### Conversations

#### `GET /api/conversations`
- **Auth:** Bearer Token (Protected)
- **Description:** Returns all direct and group conversations the authenticated user is a participant of, sorted by recent activity.

##### Request Headers
```http
Authorization: Bearer <token>
```

##### Response `200 OK`
```json
{
  "data": [
    {
      "_id": "6a8833e3e5d6aac97521f03a",
      "type": "group",
      "name": "Resistance Alpha Squad",
      "createdBy": "6a8833d9e5d6aac97521f00d",
      "admins": [
        "6a8833d9e5d6aac97521f00d",
        "6a8833dae5d6aac97521f010"
      ],
      "participants": [
        {
          "_id": "6a8833d9e5d6aac97521f00d",
          "name": "Sarah Connor",
          "phone": "+12025550101"
        },
        {
          "_id": "6a8833dae5d6aac97521f010",
          "name": "John Connor",
          "phone": "+12025550102"
        }
      ],
      "lastMessage": {
        "text": "Meeting at safehouse 09:00",
        "sender": "6a8833d9e5d6aac97521f00d",
        "createdAt": "2026-08-21T11:18:22.366Z"
      },
      "updatedAt": "2026-08-21T11:18:22.500Z"
    },
    {
      "_id": "6a8833dee5d6aac97521f024",
      "type": "direct",
      "participant": {
        "_id": "6a8833dae5d6aac97521f010",
        "name": "John Connor",
        "phone": "+12025550102"
      },
      "lastMessage": {
        "text": "Understood, Sarah.",
        "sender": "6a8833dae5d6aac97521f010",
        "createdAt": "2026-08-21T11:17:53.187Z"
      },
      "updatedAt": "2026-08-21T11:17:53.421Z"
    }
  ]
}
```

---

#### `POST /api/conversations`
- **Auth:** Bearer Token (Protected)
- **Description:** Starts a new 1-to-1 conversation with a target user (or opens the existing one).

##### Request Body
```json
{
  "userId": "6a8833dae5d6aac97521f010"
}
```

##### Response `200 OK`
```json
{
  "_id": "6a8833dee5d6aac97521f024",
  "participants": [
    "6a8833d9e5d6aac97521f00d",
    "6a8833dae5d6aac97521f010"
  ],
  "createdAt": "2026-08-21T11:17:50.908Z"
}
```

---

#### `GET /api/conversations/:id/messages`
- **Auth:** Bearer Token (Protected)
- **Description:** Retrieves paginated historical messages for the specified conversation.

##### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | Conversation ID |

##### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `limit` | `integer` | No | `20` | Max messages per page |
| `before` | `string` | No | None | Message ID cursor for loading older messages |

##### Response `200 OK`
```json
{
  "messages": [
    {
      "_id": "6a883413e5d6aac97521f0d4",
      "conversation": "6a8833dee5d6aac97521f024",
      "sender": "6a8833d9e5d6aac97521f00d",
      "text": "Message #5",
      "createdAt": "2026-08-21T11:18:43.339Z"
    },
    {
      "_id": "6a883412e5d6aac97521f0ce",
      "conversation": "6a8833dee5d6aac97521f024",
      "sender": "6a8833d9e5d6aac97521f00d",
      "text": "Message #4",
      "createdAt": "2026-08-21T11:18:42.045Z"
    }
  ],
  "hasMore": true
}
```

> **Cursor Pagination Note:** The `messages` array is returned in **descending chronological order** (newest message first). When fetching with `before=<message_id>`, the server includes the cursor message at index 0; client deduplication by `_id` is required.

---

### Messages

#### `POST /api/messages`
- **Auth:** Bearer Token (Protected)
- **Description:** Sends a new text message to a conversation. Broadcasts `message:new` over WebSocket to all participants.

##### Request Body
```json
{
  "conversationId": "6a8833dee5d6aac97521f024",
  "text": "Hello John, stay alive!"
}
```

##### Response `200 OK`
```json
{
  "_id": "6a8833dfe5d6aac97521f02a",
  "conversation": "6a8833dee5d6aac97521f024",
  "sender": "6a8833d9e5d6aac97521f00d",
  "text": "Hello John, stay alive!",
  "createdAt": "2026-08-21T11:17:51.919Z"
}
```

> **Client Notes & Backend Schema Limitations:**  
> 1. **Empty Message Validation:** Empty strings and whitespace-only messages must be rejected on the client before dispatch (`text.trim().length > 0`).  
> 2. **No Message Reply/Quote Support:** The backend MongoDB `Message` schema strictly stores `{ _id, conversation, sender, text, createdAt }`. Any reply fields (`replyTo`, `parentMessageId`, etc.) passed to `POST /api/messages` are ignored and discarded by the server.

---

### Group Management

#### `POST /api/conversations/group`
- **Auth:** Bearer Token (Protected)
- **Description:** Creates a new group conversation. The creator is automatically assigned as an admin.

##### Request Body
```json
{
  "name": "Resistance Alpha Squad",
  "participantIds": [
    "6a8833dae5d6aac97521f010",
    "6a8833dae5d6aac97521f016"
  ]
}
```

##### Response `201 Created`
```json
{
  "_id": "6a8833e3e5d6aac97521f03a",
  "type": "group",
  "name": "Resistance Alpha Squad",
  "createdBy": "6a8833d9e5d6aac97521f00d",
  "admins": [
    "6a8833d9e5d6aac97521f00d"
  ],
  "participants": [
    {
      "_id": "6a8833d9e5d6aac97521f00d",
      "name": "Sarah Connor",
      "phone": "+12025550101"
    },
    {
      "_id": "6a8833dae5d6aac97521f010",
      "name": "John Connor",
      "phone": "+12025550102"
    },
    {
      "_id": "6a8833dae5d6aac97521f016",
      "name": "Kyle Reese",
      "phone": "+12025550103"
    }
  ],
  "createdAt": "2026-08-21T11:17:55.543Z",
  "updatedAt": "2026-08-21T11:17:55.543Z"
}
```

---

#### `PATCH /api/conversations/:id`
- **Auth:** Bearer Token (Admin only)
- **Description:** Renames an existing group conversation.

##### Request Body
```json
{
  "name": "Resistance Special Operations"
}
```

##### Response `200 OK`
Returns the updated `GroupConversation` object.

##### Error Responses
- **`403 Forbidden`:** If requested by a non-admin.

---

#### `POST /api/conversations/:id/participants`
- **Auth:** Bearer Token (Admin only)
- **Description:** Adds new members to an existing group.

##### Request Body
```json
{
  "userIds": [
    "6a8833e7e5d6aac97521f055"
  ]
}
```

##### Response `200 OK`
Returns the updated `GroupConversation` object with the new participants populated.

---

#### `DELETE /api/conversations/:id/participants/:userId`
- **Auth:** Bearer Token (Admin or Self)
- **Description:** Removes a participant from the group (admin action), or allows the current user to leave the group by supplying their own `userId`.

##### Response `200 OK`
Returns the updated `GroupConversation` object.

---

#### `POST /api/conversations/:id/admins`
- **Auth:** Bearer Token (Admin only)
- **Description:** Promotes an existing group participant to admin status.

##### Request Body
```json
{
  "userId": "6a8833dae5d6aac97521f010"
}
```

##### Response `200 OK`
Returns the updated `GroupConversation` object reflecting the updated `admins` array.

##### Error Responses
- **`403 Forbidden` (Non-Admin Attempt):**
  ```json
  {
    "error": {
      "message": "Only admins can promote members",
      "code": "FORBIDDEN"
    }
  }
  ```

---

## 5. Real-Time WebSocket Protocol (Socket.io)

The backend provides a Socket.io v4 server for bidirectional real-time communication.

### Connection & Handshake

- **Endpoint:** `https://frontend-task-chatapp.onrender.com` (Root domain, Socket.io path `/socket.io/`)
- **Transport:** WebSocket with HTTP long-polling fallback.
- **Handshake Auth:** Token passed in `auth: { token: "<JWT>" }`.

```typescript
import { io, Socket } from "socket.io-client";

export function createChatSocket(token: string): Socket {
  return io("https://frontend-task-chatapp.onrender.com", {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
}
```

### Client-to-Server Events

#### `message:send`
Sends a message to a conversation over the socket.

```typescript
socket.emit(
  "message:send",
  {
    conversationId: "6a8833dee5d6aac97521f024",
    text: "Status report, please.",
  },
  (ack?: { status: string; data?: Message; error?: string }) => {
    // Optional acknowledgement callback
  }
);
```

### Server-to-Client Events

#### `message:new`
Fires whenever a message is sent to any direct or group conversation the connected user is a participant of.

```typescript
socket.on("message:new", (message: Message) => {
  // 1. Append message to active conversation thread if matching activeConversationId
  // 2. Update conversation list preview & lastMessage
  // 3. Increment unread counter if conversation is not active
});
```

#### `conversation:updated`
Fires whenever a group conversation the user is part of is created, renamed, or has member/admin modifications.

```typescript
socket.on("conversation:updated", (conversation: GroupConversation | DirectConversation) => {
  // Update state in conversation list and active conversation headers
});
```

---

## 6. Live API Edge Cases, Quirks & Workarounds

During end-to-end testing against the live deployment, several critical API behaviors were verified and documented:

| Behavior / Quirk | Observed Server Behavior | Client-Side Workaround / Handling |
| :--- | :--- | :--- |
| **Health Check Route** | `GET /api/health` returns `404 Not Found`. `GET /health` at root returns `200 OK`. | Route health checks to root `/health` rather than the `/api` prefix. |
| **User Search Regex Vulnerability** | Searching with `+` in `q` (e.g. `+1202...`) crashes MongoDB with error code `51091` (`500 Internal Server Error: quantifier does not follow a repeatable item`). | Sanitize query string on client by removing `+` and regex escape characters before querying. |
| **User Search Exact Phone & Case Sensitivity** | `GET /api/users/search` uses exact equality for `phone` and case-sensitive prefix matching for `name`. Lowercase queries or partial phone searches return `0` results from the server. | The client implements a parallel directory warmup across uppercase alphabet chunks (`A-Z`, `0-9`), combined with in-memory fuzzy/prefix scoring and debounced multi-token queries. |
| **Message Replies & Quotes** | `POST /messages` ignores any reply or parent message ID properties; MongoDB only stores `{ _id, conversation, sender, text, createdAt }`. | Quoted message replies cannot be natively stored on the backend; UI gracefully displays messages in chronological stream without reply nesting. |
| **Conversation & Message Deletion** | The API does not expose endpoints to delete conversations or messages (`DELETE /api/conversations/:id` and `DELETE /api/messages/:id` return `404 Not Found`). Only group participant removal is supported. | Restrict destructive actions to group membership removal (`DELETE /api/conversations/:id/participants/:userId`). |
| **Empty Message Validation** | `POST /messages` accepts empty string `""` and whitespace `"   "` with `200 OK`. | Client enforces strict trim validation (`text.trim().length > 0`) on send buttons and key handlers. |
| **Cursor Pagination Inclusivity** | `GET /conversations/:id/messages?before=<id>` returns the cursor item itself as the first element of the next page. | Deduplicate messages when prepending older pages into local state by checking `message._id`. |
| **Message Ordering** | `GET /conversations/:id/messages` returns messages in descending order (latest first). | Reverse message array or sort ascending by `createdAt` before rendering in chronological chat stream. |
| **Group vs Direct Format Discrepancy** | Direct conversations return a single `participant` object; Group conversations return a `participants` array. | Normalize conversation entities with type guards (`type === "group"` vs `type === "direct"`). |
| **WebSocket `message:new` Key & Timestamp Discrepancy** | REST API returns `_id` and ISO 8601 string timestamps, while Socket.io emits `id` (without `_`) and numeric millisecond timestamps. | Normalize incoming socket payloads on receipt (`_id: msg._id || msg.id` and ISO `createdAt`) and enforce strict non-empty ID comparisons to avoid `undefined === undefined` message replacements. |

---

## 7. TypeScript Type Definitions

```typescript
// ==========================================
// Core Entities
// ==========================================

export interface User {
  _id: string;
  name: string;
  phone: string;
  createdAt?: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: string | User;
  text: string;
  createdAt: string;
}

export interface DirectConversation {
  _id: string;
  type: "direct";
  participant: User;
  lastMessage?: {
    text: string;
    sender: string;
    createdAt: string;
  };
  updatedAt: string;
  createdAt?: string;
}

export interface GroupConversation {
  _id: string;
  type: "group";
  name: string;
  createdBy: string;
  admins: string[];
  participants: User[];
  lastMessage?: {
    text?: string;
    sender?: string;
    createdAt?: string;
  };
  updatedAt: string;
  createdAt: string;
}

export type Conversation = DirectConversation | GroupConversation;

// ==========================================
// Request Payloads
// ==========================================

export interface LoginPayload {
  phone: string;
  name: string;
}

export interface StartDirectPayload {
  userId: string;
}

export interface CreateGroupPayload {
  name: string;
  participantIds: string[];
}

export interface SendMessagePayload {
  conversationId: string;
  text: string;
}

export interface AddParticipantsPayload {
  userIds: string[];
}

export interface PromoteAdminPayload {
  userId: string;
}

export interface RenameGroupPayload {
  name: string;
}

// ==========================================
// Response Payloads
// ==========================================

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ConversationsListResponse {
  data: Conversation[];
}

export interface MessagesListResponse {
  messages: Message[];
  hasMore: boolean;
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    details?: Array<{
      path: string;
      message: string;
    }>;
  };
}

// ==========================================
// Socket Events
// ==========================================

export interface SocketMessageSend {
  conversationId: string;
  text: string;
}

export interface SocketEvents {
  "message:send": (payload: SocketMessageSend, ack?: (res: any) => void) => void;
  "message:new": (message: Message) => void;
  "conversation:updated": (conversation: Conversation) => void;
}
```
