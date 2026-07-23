import type { GenerationOptions, Track } from "./types";

export interface StatusResult {
  status: string;
  done: boolean;
  failed: boolean;
  errorMessage: string | null;
  tracks: Track[];
}

/** Kicks off a Suno generation via our server route. Returns the taskId. */
export async function startGeneration(opts: GenerationOptions): Promise<string> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.taskId) {
    throw new Error(data?.error || "Generation failed to start.");
  }
  return data.taskId as string;
}

/** Polls generation status via our server route. */
export async function fetchStatus(taskId: string): Promise<StatusResult> {
  const res = await fetch(
    `/api/generate/status?taskId=${encodeURIComponent(taskId)}`,
  );
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    throw new Error(data?.error || "Could not check generation status.");
  }
  return data as StatusResult;
}

/* ---- Placeholder helpers for the pending state (before Suno responds) ---- */

const TITLE_OPENERS = [
  "Paper", "Hollow", "Quiet", "Amber", "Winter", "Faded", "Softly", "Distant",
  "The Last", "Empty", "Ghost of", "Rain on",
];
const TITLE_NOUNS = [
  "Rooms", "Letters", "Streetlights", "Goodbyes", "Photographs", "Harbors",
  "September", "the Static", "Your Name", "Passing Cars", "Snow", "Sundays",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function inventTitle(opts: GenerationOptions): string {
  const seed = opts.title?.trim();
  if (seed) return seed;
  const words = opts.prompt.trim().split(/\s+/).filter((w) => w.length > 3);
  if (words.length) {
    const w = pick(words).replace(/[^a-zA-Z]/g, "");
    if (w) return `${w[0].toUpperCase()}${w.slice(1).toLowerCase()} & ${pick(TITLE_NOUNS)}`;
  }
  return `${pick(TITLE_OPENERS)} ${pick(TITLE_NOUNS)}`;
}

const MOOD_HUES: Record<string, number> = {
  Melancholy: 205,
  Heartbreak: 340,
  Longing: 260,
  Nostalgic: 30,
  Lonely: 220,
  Bittersweet: 285,
};

export function hueFor(mood: string): number {
  return MOOD_HUES[mood] ?? 205;
}
