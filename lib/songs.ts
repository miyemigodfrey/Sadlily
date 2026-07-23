import type { Song, Track } from "./types";

const KEY = "sadlily.songs";
const EMPTY: Song[] = [];

/** Cached, referentially-stable snapshot for useSyncExternalStore. */
let cache: Song[] | null = null;
const listeners = new Set<() => void>();
let storageBound = false;

/** Legacy songs (pre-variants schema) stored audio/lyrics on the song itself. */
type LegacySong = Song & {
  audioUrl?: string;
  lyrics?: string;
  durationLabel?: string;
};

/** Upgrades an old-schema song to the current `variants` shape. */
function normalize(s: LegacySong): Song {
  if (Array.isArray(s.variants)) return s;
  const variants: Track[] = s.audioUrl
    ? [
        {
          id: s.id,
          audioUrl: s.audioUrl,
          title: s.title,
          lyrics: s.lyrics ?? "",
        },
      ]
    : [];
  return {
    ...s,
    variants,
    activeVariant: 0,
    status: variants.length ? "complete" : "failed",
    mode: s.mode ?? "simple",
  };
}

function readRaw(): Song[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return (parsed as LegacySong[])
      .map(normalize)
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return EMPTY;
  }
}

function writeAll(songs: Song[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(songs));
  cache = [...songs].sort((a, b) => b.createdAt - a.createdAt);
  listeners.forEach((l) => l());
}

/* ---- Plain accessors ---- */

export function listSongs(): Song[] {
  return readRaw();
}

export function getSong(id: string): Song | undefined {
  return readRaw().find((s) => s.id === id);
}

export function saveSong(song: Song): void {
  const songs = readRaw().filter((s) => s.id !== song.id);
  songs.push(song);
  writeAll(songs);
}

export function updateSong(id: string, patch: Partial<Song>): Song | undefined {
  const songs = readRaw();
  const idx = songs.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  const updated = { ...songs[idx], ...patch, id };
  songs[idx] = updated;
  writeAll(songs);
  return updated;
}

export function deleteSong(id: string): void {
  writeAll(readRaw().filter((s) => s.id !== id));
}

/* ---- useSyncExternalStore plumbing ---- */

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (!storageBound && typeof window !== "undefined") {
    storageBound = true;
    window.addEventListener("storage", () => {
      cache = null; // invalidate so next getSnapshot re-reads
      listeners.forEach((l) => l());
    });
  }
  return () => {
    listeners.delete(cb);
  };
}

export function getSnapshot(): Song[] {
  if (cache === null) cache = readRaw();
  return cache;
}

export function getServerSnapshot(): Song[] {
  return EMPTY;
}
