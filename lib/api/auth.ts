import { apiClient } from "./client";
import { LoginPayload, LoginResponse, MeResponse } from "@/lib/types";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMe(token?: string): Promise<MeResponse> {
  return apiClient<MeResponse>("/auth/me", {
    method: "GET",
    token,
  });
}
