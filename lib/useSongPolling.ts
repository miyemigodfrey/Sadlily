"use client";

import { useEffect } from "react";
import type { Song } from "./types";
import { fetchStatus } from "./generate";
import { updateSong } from "./songs";

const INTERVAL_MS = 8000;
const FIRST_DELAY_MS = 1500;

/**
 * While a song is pending, polls the status route and writes the result back
 * to the store when generation completes or fails. Store writes happen inside
 * the async timer callback (not synchronously in the effect body).
 */
export function useSongPolling(song: Song | undefined): void {
  const id = song?.id;
  const taskId = song?.status === "pending" ? song.taskId : undefined;

  useEffect(() => {
    if (!id || !taskId) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    async function tick() {
      try {
        const result = await fetchStatus(taskId!);
        if (stopped) return;

        if (result.failed) {
          updateSong(id!, {
            status: "failed",
            errorMessage: result.errorMessage || "Generation failed.",
          });
          return;
        }
        if (result.done && result.tracks.length) {
          updateSong(id!, {
            status: "complete",
            variants: result.tracks,
            activeVariant: 0,
            errorMessage: undefined,
          });
          return;
        }
      } catch {
        // Transient error — keep polling.
      }
      if (!stopped) timer = setTimeout(tick, INTERVAL_MS);
    }

    timer = setTimeout(tick, FIRST_DELAY_MS);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [id, taskId]);
}
