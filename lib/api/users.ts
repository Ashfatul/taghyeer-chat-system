import { apiClient } from "./client";
import { User } from "@/lib/types";
import { sanitizeSearchQuery } from "@/lib/utils/colors";

export async function searchUsers(query: string): Promise<User[]> {
  const sanitized = sanitizeSearchQuery(query);
  if (!sanitized) return [];

  const response = await apiClient<{ users?: User[]; data?: User[] } | User[]>("/users/search", {
    method: "GET",
    params: { q: sanitized },
  });

  if (Array.isArray(response)) {
    return response;
  }
  return response.users || response.data || [];
}
