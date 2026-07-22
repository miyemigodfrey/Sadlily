import type { GenerationOptions, Song } from "./types";

/**
 * Simulated song generation.
 *
 * This is the single seam where a real Suno provider would be wired in later
 * (e.g. POST to /api/generate, then poll for completion). For now it fabricates
 * a title, sad lyrics, a soft audio tone, and cover art metadata after a delay,
 * so the whole UI is demonstrable without any backend or API key.
 */
export async function generateSong(options: GenerationOptions): Promise<Song> {
  await delay(2600 + Math.random() * 1200);

  const id = makeId();
  const title = options.title?.trim() || inventTitle(options);
  const lyrics = options.instrumental ? instrumentalNote(options) : writeLyrics(options);

  return {
    ...options,
    id,
    title,
    lyrics,
    audioUrl: buildTone(options),
    coverHue: hueFor(options.mood),
    durationLabel: randomDuration(),
    createdAt: Date.now(),
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const TITLE_OPENERS = [
  "Paper", "Hollow", "Quiet", "Amber", "Winter", "Faded", "Softly", "Distant",
  "The Last", "Empty", "Ghost of", "Rain on",
];
const TITLE_NOUNS = [
  "Rooms", "Letters", "Streetlights", "Goodbyes", "Photographs", "Harbors",
  "September", "the Static", "Your Name", "Passing Cars", "Snow", "Sundays",
];

function inventTitle(o: GenerationOptions): string {
  const seed = o.prompt.trim();
  if (seed) {
    const words = seed.split(/\s+/).filter((w) => w.length > 3);
    if (words.length) {
      const w = pick(words).replace(/[^a-zA-Z]/g, "");
      if (w) return `${capitalize(w)} & ${pick(TITLE_NOUNS)}`;
    }
  }
  return `${pick(TITLE_OPENERS)} ${pick(TITLE_NOUNS)}`;
}

function capitalize(w: string) {
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

function writeLyrics(o: GenerationOptions): string {
  const subject = o.prompt.trim().replace(/[.!?]+$/, "") || "the quiet after you left";
  const mood = o.mood.toLowerCase();

  const verse1 = [
    `I keep the light on for ${subject},`,
    `even the walls have learned your name.`,
    `Every ${mood} morning tastes the same —`,
    `coffee gone cold, and no one to blame.`,
  ];
  const chorus = [
    `So I'm singing to the ceiling,`,
    `to the parts of you I'm still holding,`,
    `and the ${mood} keeps unfolding`,
    `like a letter I never sent.`,
  ];
  const verse2 = [
    `The city hums a lonelier tune,`,
    `streetlights bleed into the afternoon.`,
    `I traced our shadow on the floor —`,
    `it doesn't reach the door anymore.`,
  ];
  const outro = [`(and the ${mood} keeps unfolding...)`, `oh, ${subject}...`];

  return [
    "[Verse 1]",
    ...verse1,
    "",
    "[Chorus]",
    ...chorus,
    "",
    "[Verse 2]",
    ...verse2,
    "",
    "[Chorus]",
    ...chorus,
    "",
    "[Outro]",
    ...outro,
  ].join("\n");
}

function instrumentalNote(o: GenerationOptions): string {
  return [
    "[Instrumental]",
    "",
    `A ${o.mood.toLowerCase()} ${o.genres.join(" / ").toLowerCase() || "ambient"} piece,`,
    `${o.tempo.toLowerCase()} tempo, no vocals.`,
    "",
    o.prompt.trim() ? `Inspired by: ${o.prompt.trim()}` : "Let the silence do the talking.",
  ].join("\n");
}

const MOOD_HUES: Record<string, number> = {
  Melancholy: 205,
  Heartbreak: 340,
  Longing: 260,
  Nostalgic: 30,
  Lonely: 220,
  Bittersweet: 285,
};

function hueFor(mood: string): number {
  return MOOD_HUES[mood] ?? 205;
}

function randomDuration(): string {
  const secs = 150 + Math.floor(Math.random() * 90);
  const m = Math.floor(secs / 60);
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Synthesizes a short, soft minor-chord WAV as a data URI so the audio player
 * actually plays something. Placeholder only — swapped for the real track later.
 */
function buildTone(o: GenerationOptions): string {
  const sampleRate = 8000;
  const duration = 6; // seconds
  const n = sampleRate * duration;

  // A soft minor triad, dropped an octave for slow/sad feel.
  const base = o.tempo === "Upbeat" ? 261.63 : o.tempo === "Mid" ? 220.0 : 174.61;
  const freqs = [base, base * 1.2, base * 1.5]; // ~minor chord ratios

  const bytes = new Uint8Array(44 + n);

  // WAV header (8-bit PCM, mono)
  const view = new DataView(bytes.buffer);
  writeStr(view, 0, "RIFF");
  view.setUint32(4, 36 + n, true);
  writeStr(view, 8, "WAVE");
  writeStr(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true); // byte rate (1 byte/sample)
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // bits per sample
  writeStr(view, 36, "data");
  view.setUint32(40, n, true);

  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    // Gentle fade in/out envelope.
    const env = Math.min(1, t / 1.2) * Math.min(1, (duration - t) / 1.5);
    let s = 0;
    for (const f of freqs) s += Math.sin(2 * Math.PI * f * t);
    s = (s / freqs.length) * env * 0.5;
    bytes[44 + i] = Math.max(0, Math.min(255, Math.round((s + 1) * 127.5)));
  }

  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = typeof btoa !== "undefined" ? btoa(binary) : "";
  return `data:audio/wav;base64,${b64}`;
}

function writeStr(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}
