import { ApiErrorResponse, ApiErrorDetail } from "@/lib/types";

export class ApiError extends Error {
  code: string;
  statusCode: number;
  details?: ApiErrorDetail[];

  constructor(message: string, code: string = "UNKNOWN_ERROR", statusCode: number = 500, details?: ApiErrorDetail[]) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "https://frontend-task-chatapp.onrender.com/api";

const TOKEN_KEY = "taghyeer_auth_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore localStorage write issues in restricted environments
  }
}

interface RequestOptions extends RequestInit {
  token?: string | null;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, params, headers, ...customConfig } = options;

  const authToken = token !== undefined ? token : getStoredToken();

  const url = new URL(
    endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    defaultHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
  };

  let response: Response;
  try {
    response = await fetch(url.toString(), config);
  } catch (err: unknown) {
    throw new ApiError(
      err instanceof Error ? err.message : "Network error. Please check your connection.",
      "NETWORK_ERROR",
      0
    );
  }

  let data: unknown;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorPayload = data as ApiErrorResponse | null;
    const errorMessage =
      errorPayload?.error?.message ||
      (typeof data === "string" ? data : `Request failed with status ${response.status}`);
    const errorCode = errorPayload?.error?.code || `HTTP_${response.status}`;
    const details = errorPayload?.error?.details;

    throw new ApiError(errorMessage, errorCode, response.status, details);
  }

  return data as T;
}
