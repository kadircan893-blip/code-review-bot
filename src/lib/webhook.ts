import { createHmac, timingSafeEqual } from "crypto";
import type {
  GitHubPRWebhookPayload,
  WebhookPayload,
  REVIEWABLE_PR_ACTIONS,
} from "@/types/github";

const REVIEWABLE_ACTIONS: string[] = ["opened", "synchronize", "reopened"];

/**
 * Verifies the HMAC-SHA256 signature from GitHub.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyWebhookSignature(
  secret: string,
  body: string,
  signature: string | null
): boolean {
  if (!signature || !signature.startsWith("sha256=")) {
    return false;
  }

  const sig = signature.slice(7);
  const expected = createHmac("sha256", secret).update(body).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

/**
 * Parses and validates an incoming GitHub webhook payload.
 * Returns the typed payload or null for irrelevant events.
 */
export function parseWebhookPayload(
  event: string,
  body: unknown
): WebhookPayload | null {
  if (event === "ping") {
    return { event: "ping", data: body as { zen: string; hook_id: number } };
  }

  if (event === "pull_request") {
    const payload = body as GitHubPRWebhookPayload;

    if (!REVIEWABLE_ACTIONS.includes(payload.action)) {
      return null;
    }

    if (!payload.pull_request || !payload.repository) {
      return null;
    }

    return { event: "pull_request", data: payload };
  }

  return null;
}

/**
 * Type guard for reviewable PR actions.
 */
export function isReviewablePRAction(
  action: string
): action is (typeof REVIEWABLE_PR_ACTIONS)[number] {
  return REVIEWABLE_ACTIONS.includes(action);
}
