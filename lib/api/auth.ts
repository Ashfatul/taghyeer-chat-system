import { apiClient } from "./client";
import { LoginPayload, LoginResponse, MeResponse, User } from "@/lib/types";
import { registerUsers } from "./users";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (response?.user) {
    registerUsers([response.user]);
  }
  return response;
}

export async function getMe(token?: string): Promise<MeResponse> {
  const response = await apiClient<MeResponse | User>("/auth/me", {
    method: "GET",
    token,
  });
  const user = (response as MeResponse)?.user || (response as User);
  if (user && user._id) {
    registerUsers([user]);
  }
  return (response as MeResponse)?.user ? (response as MeResponse) : { user: response as User };
}
