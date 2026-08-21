import { apiClient } from "./client";
import { Message, SendMessagePayload } from "@/lib/types";

export async function sendMessage(payload: SendMessagePayload): Promise<Message> {
  return apiClient<Message>("/messages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
