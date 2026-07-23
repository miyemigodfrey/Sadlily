/**
 * Server-only helpers for talking to Kie.ai. Never import this from a
 * "use client" module — it reads secret env vars.
 */

/** Kie host base, tolerant of a trailing slash or an included /api/v1. */
export function kieBase(): string {
  const raw = (process.env.SUNO_API_URL || "https://api.kie.ai").trim();
  return raw.replace(/\/+$/, "").replace(/\/api\/v1$/, "");
}

export function kieKey(): string | undefined {
  return process.env.SUNO_API_KEY;
}

export function kieCallbackUrl(): string | undefined {
  return process.env.SUNO_CALLBACK_URL || undefined;
}
