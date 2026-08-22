import { apiClient } from "./client";
import {
  Conversation,
  DirectConversation,
  GroupConversation,
  CreateGroupPayload,
  MessagesListResponse,
  RenameGroupPayload,
  AddParticipantsPayload,
  PromoteAdminPayload,
  Message,
} from "@/lib/types";

import { registerConversationUsers } from "./users";

export async function getConversations(): Promise<Conversation[]> {
  const response = await apiClient<Conversation[] | { data?: Conversation[]; conversations?: Conversation[] }>(
    "/conversations",
    { method: "GET" }
  );

  const list = Array.isArray(response)
    ? response
    : response.data || response.conversations || [];

  registerConversationUsers(list);
  return list;
}

export async function startDirectConversation(userId: string): Promise<DirectConversation> {
  return apiClient<DirectConversation>("/conversations", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function createGroupConversation(payload: CreateGroupPayload): Promise<GroupConversation> {
  return apiClient<GroupConversation>("/conversations/group", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getConversationMessages(
  conversationId: string,
  params?: { before?: string; limit?: number }
): Promise<MessagesListResponse> {
  const response = await apiClient<MessagesListResponse | Message[] | { messages: Message[]; hasMore?: boolean }>(
    `/conversations/${conversationId}/messages`,
    {
      method: "GET",
      params: {
        before: params?.before,
        limit: params?.limit || 50,
      },
    }
  );

  if (Array.isArray(response)) {
    return {
      messages: response,
      hasMore: response.length >= (params?.limit || 50),
    };
  }

  return {
    messages: response.messages || [],
    hasMore: response.hasMore ?? (response.messages?.length >= (params?.limit || 50)),
  };
}

export async function renameGroup(conversationId: string, payload: RenameGroupPayload): Promise<GroupConversation> {
  return apiClient<GroupConversation>(`/conversations/${conversationId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function addParticipants(
  conversationId: string,
  payload: AddParticipantsPayload
): Promise<GroupConversation> {
  return apiClient<GroupConversation>(`/conversations/${conversationId}/participants`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function removeParticipant(
  conversationId: string,
  userId: string
): Promise<GroupConversation | { success: boolean }> {
  return apiClient<GroupConversation | { success: boolean }>(
    `/conversations/${conversationId}/participants/${userId}`,
    {
      method: "DELETE",
    }
  );
}

export async function promoteAdmin(
  conversationId: string,
  payload: PromoteAdminPayload
): Promise<GroupConversation> {
  return apiClient<GroupConversation>(`/conversations/${conversationId}/admins`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
