"use client";

import { useSongs, useHydrated } from "@/lib/useSongs";
import SongCard from "./SongCard";

export default function Library() {
  const hydrated = useHydrated();
  const songs = useSongs();

  // Avoid a hydration mismatch: render nothing until the client store is live.
  if (!hydrated) return null;

  return (
    <section id="library" className="scroll-mt-20">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-semibold text-foreground">Your library</h2>
        <span className="text-sm text-muted">
          {songs.length} {songs.length === 1 ? "song" : "songs"}
        </span>
      </div>

      {songs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center">
          <p className="text-muted">
            No songs yet. Write a prompt above and generate your first one. 🌧️
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </section>
  );
}
