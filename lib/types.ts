export type VocalType = "female" | "male" | "duet" | "instrumental";

export type GenerationMode = "simple" | "custom";

export type SongStatus = "pending" | "complete" | "failed";

export interface GenerationOptions {
  prompt: string;
  title?: string;
  genres: string[];
  mood: string;
  tempo: string;
  vocal: VocalType;
  instrumental: boolean;
  mode: GenerationMode;
  /** Exact lyrics — only used in custom mode for vocal songs. */
  lyrics?: string;
  model?: string;
}

/** One generated audio result from Suno (each generation returns ~2). */
export interface Track {
  id: string;
  audioUrl: string;
  streamAudioUrl?: string;
  imageUrl?: string;
  title: string;
  tags?: string;
  duration?: number;
  lyrics: string;
}

export interface Song extends GenerationOptions {
  id: string;
  taskId?: string;
  status: SongStatus;
  errorMessage?: string;
  title: string;
  variants: Track[];
  activeVariant: number;
  coverHue: number;
  createdAt: number;
}

/** The currently selected track, if the song has finished generating. */
export function activeTrack(song: Song): Track | undefined {
  const variants = song.variants ?? [];
  return variants[song.activeVariant] ?? variants[0];
}

/** Formats a duration in seconds as m:ss. */
export function formatDuration(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds)) return "—";
  const m = Math.floor(seconds / 60);
  const s = String(Math.floor(seconds % 60)).padStart(2, "0");
  return `${m}:${s}`;
}
