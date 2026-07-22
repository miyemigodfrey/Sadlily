import type { VocalType } from "./types";

export const GENRES = [
  "Acoustic",
  "Piano ballad",
  "Indie",
  "Lo-fi",
  "R&B",
  "Ambient",
  "Folk",
  "Orchestral",
] as const;

export const MOODS = [
  "Melancholy",
  "Heartbreak",
  "Longing",
  "Nostalgic",
  "Lonely",
  "Bittersweet",
] as const;

export const TEMPOS = ["Slow", "Mid", "Upbeat"] as const;

export const VOCALS: { value: VocalType; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "duet", label: "Duet" },
  { value: "instrumental", label: "Instrumental" },
];

export const DEFAULT_OPTIONS = {
  prompt: "",
  title: "",
  genres: ["Piano ballad"] as string[],
  mood: "Melancholy",
  tempo: "Slow" as (typeof TEMPOS)[number],
  vocal: "female" as VocalType,
  instrumental: false,
};
