import { createClient } from "@/lib/supabase-server";

/**
 * Per-user rate limits. Enforced server-side via the `record_user_action`
 * SECURITY DEFINER function, which keys off the caller's auth.uid() — the
 * client can never spoof identity or counts.
 */
export const RATE_LIMITS = {
  vote: {
    action: "vote",
    max: 50,
    windowSeconds: 60 * 60, // 50 votes / hour
    message: "You're voting too fast. Try again in a little while.",
  },
  review: {
    action: "review",
    max: 5,
    windowSeconds: 60 * 60 * 24, // 5 reviews / day
    message: "You've hit the daily review limit (5). Try again tomorrow.",
  },
  product_submission: {
    action: "product_submission",
    max: 10,
    windowSeconds: 60 * 60 * 24, // 10 submissions / day
    message:
      "You've hit the daily product-submission limit (10). Try again tomorrow.",
  },
} as const;

export type RateLimitKey = keyof typeof RATE_LIMITS;

export type RateLimitResult = { ok: true } | { ok: false; message: string };

/**
 * Check (and record) a rate-limited action for the current user.
 * Must be called from a server context with a valid session.
 */
export async function enforceRateLimit(
  key: RateLimitKey,
): Promise<RateLimitResult> {
  const cfg = RATE_LIMITS[key];
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("record_user_action", {
    p_action_type: cfg.action,
    p_max_count: cfg.max,
    p_window_seconds: cfg.windowSeconds,
  });

  if (error) {
    return {
      ok: false,
      message: "Could not verify your rate limit. Please try again.",
    };
  }
  if (data === false) {
    return { ok: false, message: cfg.message };
  }
  return { ok: true };
}
