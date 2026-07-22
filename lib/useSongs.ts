"use client";

import { useSyncExternalStore } from "react";
import type { Song } from "./types";
import { subscribe, getSnapshot, getServerSnapshot } from "./songs";

/** Live list of saved songs; re-renders when the store changes. */
export function useSongs(): Song[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** A single song by id, kept in sync with the store. */
export function useSong(id: string): Song | undefined {
  const songs = useSongs();
  return songs.find((s) => s.id === id);
}

/** False during SSR and the first hydration render, true thereafter. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
