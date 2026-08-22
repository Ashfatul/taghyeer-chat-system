import { User, Conversation } from "@/lib/types";
import { formatPhoneNumber } from "@/lib/utils/colors";

/**
 * Escapes regex metacharacters so strings can be safely interpolated into MongoDB / RegExp queries.
 */
export function escapeRegex(str: string): string {
  if (!str) return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Extracts only digits from a phone string.
 */
export function normalizePhoneDigits(phone?: string | null): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

/**
 * Calculates a match score (0-100) for a user against a search query.
 * Supports:
 * - Case-insensitive partial name matching
 * - Multi-word / token search (e.g. "sar con" matches "Sarah Connor")
 * - International and local phone numbers
 * - Partial phone numbers (area code, middle, last 4 digits)
 * - Formatted phone numbers (e.g. "+1 (202) 555-0102", "202-555-0102")
 */
export function matchUserScore(user: User, query: string): number {
  if (!user || !query) return 0;
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const qDigits = normalizePhoneDigits(query);
  const name = (user.name || "").toLowerCase().trim();
  const rawPhone = (user.phone || "").trim();
  const formattedPhone = formatPhoneNumber(rawPhone).toLowerCase();
  const phoneDigits = normalizePhoneDigits(rawPhone);
  const nameWords = name.split(/\s+/).filter(Boolean);

  let score = 0;

  // 1. Exact matches (Highest Priority)
  if (name === q) return 100;
  if (qDigits.length >= 3 && phoneDigits === qDigits) return 100;

  // 2. Name Prefix & Word Matching
  if (name.startsWith(q)) {
    score = Math.max(score, 90);
  } else if (nameWords.some((w) => w.startsWith(q))) {
    score = Math.max(score, 80);
  } else if (name.includes(q)) {
    score = Math.max(score, 70);
  }

  // 3. Multi-word Name Matching (e.g. "sar con" -> "Sarah Connor")
  const queryTokens = q.split(/\s+/).filter(Boolean);
  if (queryTokens.length > 1) {
    const allTokensMatch = queryTokens.every((token) =>
      name.includes(token) || nameWords.some((w) => w.startsWith(token))
    );
    if (allTokensMatch) {
      score = Math.max(score, 85);
    }
  }

  // 4. Initials Matching (e.g. "jc" -> "John Connor")
  if (nameWords.length >= 2 && q.length <= 4 && !qDigits) {
    const initials = nameWords.map((w) => w[0]).join("");
    if (initials.startsWith(q)) {
      score = Math.max(score, 65);
    }
  }

  // 5. Phone Matching (Full, Prefix, Suffix, Substring, Formatted)
  if (qDigits.length >= 2) {
    if (phoneDigits === qDigits) {
      score = Math.max(score, 95);
    } else if (phoneDigits.startsWith(qDigits)) {
      // User typed prefix digits e.g. "+10000" or "10000" for "+100000000000"
      score = Math.max(score, 90);
    } else if (phoneDigits.endsWith(qDigits)) {
      // User typed the last digits of phone (e.g. "0102" or "5550102")
      score = Math.max(score, 85);
    } else if (phoneDigits.includes(qDigits)) {
      // Area code or middle segment match (e.g. "202" or "555")
      score = Math.max(score, 75);
    }
  }

  // Formatted string or raw string search
  if (rawPhone.toLowerCase().includes(q) || formattedPhone.includes(q)) {
    score = Math.max(score, 75);
  }

  return score;
}

/**
 * Deduplicates, filters by query match score, and sorts users by relevance.
 */
export function filterAndRankUsers(users: User[], query: string): User[] {
  if (!query || !query.trim()) return [];
  
  // Deduplicate users by _id
  const userMap = new Map<string, User>();
  for (const user of users) {
    if (user && user._id && !userMap.has(user._id)) {
      userMap.set(user._id, user);
    }
  }

  return Array.from(userMap.values())
    .map((user) => ({
      user,
      score: matchUserScore(user, query),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.user);
}

/**
 * Builds safe server query strings for MongoDB RegExp matching.
 * Prevents 500 crashes from unescaped "+" / metacharacters while supporting
 * case-insensitive wildcard searches and capitalizations.
 */
export function buildSafeServerSearchQueries(query: string): string[] {
  const trimmed = (query || "").trim();
  if (!trimmed) return [];

  const queries: string[] = [];
  const tokens = trimmed.split(/\s+/).filter(Boolean);

  // 1. Case-insensitive regex name query: (?i).*token1.*token2
  if (tokens.length > 0) {
    const escapedPattern = tokens.map(escapeRegex).join(".*");
    queries.push(`(?i).*${escapedPattern}`);

    // Also include Capitalized initial query for case-sensitive backend matching
    const firstToken = tokens[0];
    const capitalized = firstToken.charAt(0).toUpperCase() + firstToken.slice(1);
    queries.push(capitalized);
  }

  // 2. Pure numeric phone query (without leading + to prevent regex 500 error)
  const digits = normalizePhoneDigits(trimmed);
  if (digits && digits.length >= 3) {
    queries.push(digits);
  }

  return Array.from(new Set(queries));
}

/**
 * Filters a conversation against a search query across:
 * - Group conversation title
 * - Direct participant name
 * - Direct participant phone (raw, formatted, or partial digits)
 * - Group participants names and phones
 * - Last message text snippet
 */
export function matchConversation(conversation: Conversation, query: string): boolean {
  if (!query || !query.trim()) return true;
  const q = query.toLowerCase().trim();
  const qDigits = normalizePhoneDigits(query);

  // 1. Title / Group Name Match
  if (conversation.type === "group") {
    if (conversation.name && conversation.name.toLowerCase().includes(q)) {
      return true;
    }
    // Check group participants
    if (conversation.participants && Array.isArray(conversation.participants)) {
      const matchInParticipants = conversation.participants.some((p) => {
        if (!p) return false;
        const nameMatch = p.name?.toLowerCase().includes(q);
        const rawPhone = p.phone || "";
        const phoneDigits = normalizePhoneDigits(rawPhone);
        const phoneMatch =
          rawPhone.toLowerCase().includes(q) ||
          formatPhoneNumber(rawPhone).toLowerCase().includes(q) ||
          (qDigits.length >= 3 && phoneDigits.includes(qDigits));
        return nameMatch || phoneMatch;
      });
      if (matchInParticipants) return true;
    }
  } else if (conversation.type === "direct") {
    const p = conversation.participant;
    if (p) {
      if (p.name && p.name.toLowerCase().includes(q)) return true;
      const rawPhone = p.phone || "";
      const phoneDigits = normalizePhoneDigits(rawPhone);
      if (
        rawPhone.toLowerCase().includes(q) ||
        formatPhoneNumber(rawPhone).toLowerCase().includes(q) ||
        (qDigits.length >= 3 && phoneDigits.includes(qDigits))
      ) {
        return true;
      }
    }
  }

  // 2. Last Message Match
  if (conversation.lastMessage?.text) {
    if (conversation.lastMessage.text.toLowerCase().includes(q)) {
      return true;
    }
  }

  return false;
}
