/**
 * Deterministically generates a vibrant, accessible HSL color pair from any string (like a user ID or name).
 */
export function hashToHsl(str: string): { bg: string; text: string; border: string; raw: string } {
  if (!str) {
    return {
      bg: "rgba(99, 102, 241, 0.15)",
      text: "#818cf8",
      border: "rgba(99, 102, 241, 0.3)",
      raw: "hsl(235, 80%, 65%)",
    };
  }

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  // Generate hue between 0 and 360, avoiding overly dull colors
  const hue = Math.abs(hash) % 360;
  const saturation = 75; // 75%
  const lightness = 60; // 60% for crisp text on dark surfaces

  return {
    bg: `hsla(${hue}, ${saturation}%, ${lightness}%, 0.18)`,
    text: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    border: `hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)`,
    raw: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
  };
}

/**
 * Extracts 1-2 uppercase letters representing the initials of a name.
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Formats phone number into international friendly format.
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.trim();
  // If already standard +1 (202) 555-0101 format or raw +12025550101
  if (cleaned.startsWith("+1") && cleaned.length === 12) {
    const area = cleaned.slice(2, 5);
    const mid = cleaned.slice(5, 8);
    const last = cleaned.slice(8, 12);
    return `+1 (${area}) ${mid}-${last}`;
  }
  return cleaned;
}

/**
 * Sanitizes input string to safely pass to MongoDB regex searches without 500 error.
 * Strips or escapes regex metacharacters (+ * ? ^ $ [ ] ( ) { } | \ .)
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return "";
  // Strip leading + and trim whitespace
  const stripped = query.replace(/^\+/, "").trim();
  // Escape regex special characters
  return stripped.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
