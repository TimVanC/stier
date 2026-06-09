/**
 * Server-side input sanitization helpers.
 *
 * All user-submitted free text must pass through `sanitizeText` before being
 * stored. We strip HTML tags (XSS defense-in-depth — React already escapes on
 * render), remove control characters, collapse whitespace, and cap length.
 */

const HTML_TAG_RE = /<[^>]*>/g;
// Control chars except tab/newline/carriage-return.
const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Remove all HTML tags from a string. */
export function stripHtml(input: string): string {
  return input.replace(HTML_TAG_RE, "");
}

/**
 * Sanitize an arbitrary user-supplied value into safe plain text.
 * Returns "" for non-strings. Strips tags + leftover angle brackets, removes
 * control chars, trims, and truncates to `maxLength`.
 */
export function sanitizeText(input: unknown, maxLength = 5000): string {
  if (typeof input !== "string") return "";
  let value = stripHtml(input);
  // Remove any leftover angle brackets so partial/broken tags can't survive.
  value = value.replace(/[<>]/g, "");
  value = value.replace(CONTROL_CHARS_RE, "");
  // Collapse runs of whitespace (but keep single newlines as spaces).
  value = value.replace(/\s+/g, " ").trim();
  if (value.length > maxLength) value = value.slice(0, maxLength).trim();
  return value;
}

const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

export type UsernameCheck =
  | { ok: true; value: string }
  | { ok: false; error: string };

/**
 * Validate a username: 3-20 chars, letters/numbers/underscore only, no spaces.
 * Returns the trimmed value on success. (Case-insensitive uniqueness is
 * enforced separately against the database.)
 */
export function validateUsername(raw: unknown): UsernameCheck {
  if (typeof raw !== "string") {
    return { ok: false, error: "Username is required." };
  }
  const value = raw.trim();
  if (!USERNAME_RE.test(value)) {
    return {
      ok: false,
      error:
        "Username must be 3–20 characters: letters, numbers, and underscores only (no spaces).",
    };
  }
  return { ok: true, value };
}

/** True when a string is a syntactically valid UUID (v4-ish). */
export function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}
