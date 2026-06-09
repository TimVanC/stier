import { createHash } from "node:crypto";

/**
 * Deterministic UUID v4-style ids from a slug so seed data, SQL migrations,
 * and runtime lookups always agree without a mapping table.
 */
export function uuidFromSlug(kind: "category" | "product", slug: string): string {
  const hash = createHash("sha256").update(`stier:${kind}:${slug}`).digest("hex");
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    `${((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0")}${hash.slice(18, 20)}`,
    hash.slice(20, 32),
  ].join("-");
}
