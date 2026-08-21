// ==========================================
// Core Entities
// ==========================================

export interface User {
  _id: string;
  name: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: string | User;
  text: string;
  createdAt: string;
  updatedAt?: string;
  status?: "sending" | "sent" | "delivered" | "failed";
  tempId?: string;
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

export interface MeResponse {
  user: User;
}

export interface ConversationsListResponse {
  data?: Conversation[];
  conversations?: Conversation[];
}

export interface MessagesListResponse {
  messages: Message[];
  hasMore: boolean;
}

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    details?: ApiErrorDetail[];
  };
}

// ==========================================
// Socket Events & Protocols
// ==========================================

export interface SocketMessageSend {
  conversationId: string;
  text: string;
}

export interface SocketEvents {
  "message:send": (payload: SocketMessageSend, ack?: (res: { status: string; message?: Message; error?: string }) => void) => void;
  "message:new": (message: Message) => void;
  "conversation:updated": (conversation: Conversation) => void;
}
