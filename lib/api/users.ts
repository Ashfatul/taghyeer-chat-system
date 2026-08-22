import { apiClient } from "./client";
import { User, Conversation } from "@/lib/types";
import {
  buildSafeServerSearchQueries,
  filterAndRankUsers,
} from "@/lib/utils/search";

// Global in-memory user registry / cache for fast, resilient searches
export const globalUserCache = new Map<string, User>();
let isWarmupRunning = false;
let isWarmupComplete = false;

/**
 * Registers one or more users into the local user cache.
 */
export function registerUsers(users?: (User | null | undefined)[]): void {
  if (!Array.isArray(users)) return;
  for (const user of users) {
    if (user && user._id && typeof user._id === "string") {
      globalUserCache.set(user._id, user);
    }
  }
}

/**
 * Extracts and registers all users found within a list of conversations.
 */
export function registerConversationUsers(conversations?: (Conversation | null | undefined)[]): void {
  if (!Array.isArray(conversations)) return;
  for (const conv of conversations) {
    if (!conv) continue;
    if (conv.type === "direct" && conv.participant) {
      registerUsers([conv.participant]);
    } else if (conv.type === "group" && Array.isArray(conv.participants)) {
      registerUsers(conv.participants);
    }
  }
}

/**
 * Returns all currently cached users as an array.
 */
export function getCachedUsers(): User[] {
  return Array.from(globalUserCache.values());
}

/**
 * Warms up the user cache by prefetching users across uppercase alphabet and digits.
 * Runs non-blocking in parallel chunks and deduplicates concurrent runs.
 */
export async function warmupUserCache(): Promise<void> {
  if (isWarmupRunning || isWarmupComplete) return;
  isWarmupRunning = true;

  try {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
    const chunkSize = 6;
    for (let i = 0; i < letters.length; i += chunkSize) {
      const chunk = letters.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (char) => {
          try {
            const response = await apiClient<{ users?: User[]; data?: User[] } | User[]>(
              "/users/search",
              {
                method: "GET",
                params: { q: char },
              }
            );
            const users = Array.isArray(response)
              ? response
              : response.users || response.data || [];
            registerUsers(users);
          } catch {}
        })
      );
    }
    isWarmupComplete = true;
  } catch {
    // Ignore warmup errors
  } finally {
    isWarmupRunning = false;
  }
}

/**
 * Searches users by name (case-insensitive partial keyword) or phone number (full, formatted, or partial).
 * Combines local indexed directory with live safe server queries for maximum recall and accuracy.
 */
export async function searchUsers(query: string): Promise<User[]> {
  const trimmed = (query || "").trim();
  if (!trimmed) return [];

  // 1. Trigger background directory warmup if not yet completed
  if (!isWarmupComplete && !isWarmupRunning) {
    warmupUserCache().catch(() => {});
  }

  // 2. Build safe server queries (prevents MongoDB unescaped regex 500 crashes)
  const serverQueries = buildSafeServerSearchQueries(trimmed);

  // 3. Dispatch safe server queries in parallel
  const queryPromises = serverQueries.map(async (q) => {
    try {
      const response = await apiClient<{ users?: User[]; data?: User[] } | User[]>(
        "/users/search",
        {
          method: "GET",
          params: { q },
        }
      );
      return Array.isArray(response)
        ? response
        : response.users || response.data || [];
    } catch {
      return [];
    }
  });

  const serverResults = await Promise.all(queryPromises);

  // 4. Register newly discovered users into the cache
  for (const list of serverResults) {
    registerUsers(list);
  }

  // 5. Apply universal fuzzy / partial score matching across all known users
  const allKnownUsers = Array.from(globalUserCache.values());
  return filterAndRankUsers(allKnownUsers, trimmed);
}
