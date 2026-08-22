import { apiClient } from "./client";
import { User, Conversation } from "@/lib/types";
import {
  buildSafeServerSearchQueries,
  filterAndRankUsers,
} from "@/lib/utils/search";

// Global in-memory user registry / cache for fast, resilient searches
const globalUserCache = new Map<string, User>();
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
 * Warms up the user cache by prefetching users from the server in the background.
 * Runs non-blocking and deduplicates concurrent runs.
 */
export async function warmupUserCache(): Promise<void> {
  if (isWarmupRunning || isWarmupComplete) return;
  isWarmupRunning = true;

  try {
    const prefixes = ["a", "e", "i", "o", "u", "s", "m", "t", "0", "1"];
    const promises = prefixes.map(async (char) => {
      try {
        const response = await apiClient<{ users?: User[]; data?: User[] } | User[]>(
          "/users/search",
          {
            method: "GET",
            params: { q: `(?i).*${char}` },
          }
        );
        const users = Array.isArray(response)
          ? response
          : response.users || response.data || [];
        registerUsers(users);
      } catch {
        // Silently continue if single prefix fails
      }
    });

    await Promise.all(promises);
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

  // 1. If cache is small or unprimed, trigger background warmup
  if (globalUserCache.size < 20 && !isWarmupRunning && !isWarmupComplete) {
    warmupUserCache().catch(() => {});
  }

  // 2. Build safe server queries (prevents MongoDB unescaped regex 500 crashes)
  const serverQueries = buildSafeServerSearchQueries(trimmed);

  // If local cache is very small, also include a general wildcard
  if (globalUserCache.size < 30) {
    serverQueries.push("(?i).*");
  }

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
