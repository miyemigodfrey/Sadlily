"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateSong, deleteSong } from "@/lib/songs";
import { useSong, useHydrated } from "@/lib/useSongs";
import { generateSong } from "@/lib/generate";
import CoverArt from "@/app/components/CoverArt";
import SongMeta from "@/app/components/SongMeta";
import AudioPlayer from "@/app/components/AudioPlayer";
import LyricsEditor from "@/app/components/LyricsEditor";
import GeneratingOverlay from "@/app/components/GeneratingOverlay";

export default function SongDetail({ id }: { id: string }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const song = useSong(id);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  function saveLyrics(lyrics: string) {
    updateSong(id, { lyrics });
  }

  function commitTitle() {
    const next = titleDraft.trim();
    if (next) updateSong(id, { title: next });
    setEditingTitle(false);
  }

  async function regenerate() {
    if (!song) return;
    setRegenerating(true);
    try {
      const fresh = await generateSong({
        prompt: song.prompt,
        title: song.title,
        genres: song.genres,
        mood: song.mood,
        tempo: song.tempo,
        vocal: song.vocal,
        instrumental: song.instrumental,
      });
      updateSong(id, {
        lyrics: fresh.lyrics,
        audioUrl: fresh.audioUrl,
        durationLabel: fresh.durationLabel,
        coverHue: fresh.coverHue,
      });
    } finally {
      setRegenerating(false);
    }
  }

  function handleDelete() {
    deleteSong(id);
    router.push("/");
  }

  if (!hydrated) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-16">
        <div className="h-64 animate-pulse rounded-3xl border border-border bg-surface/50" />
      </main>
    );
  }

  if (!song) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-16 text-center">
        <p className="font-display text-2xl text-foreground">Song not found</p>
        <p className="mt-2 text-muted">
          It may have been deleted, or created on another device.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary"
        >
          Back to studio
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:py-12">
      {regenerating && <GeneratingOverlay />}

      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </Link>

      <section className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="h-40 w-40 shrink-0 shadow-lg shadow-nude-300/30">
          <CoverArt hue={song.coverHue} title={song.title} />
        </div>
        <div className="flex-1">
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => e.key === "Enter" && commitTitle()}
              className="w-full rounded-xl border border-border bg-surface-soft px-3 py-2 font-display text-3xl font-semibold text-foreground outline-none focus:border-primary"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setTitleDraft(song.title);
                setEditingTitle(true);
              }}
              className="group flex items-center gap-2 text-left"
            >
              <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {song.title}
              </h1>
              <svg className="opacity-0 transition-opacity group-hover:opacity-60" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
          )}
          <p className="mt-2 max-w-lg text-sm italic text-muted">“{song.prompt}”</p>
          <div className="mt-4">
            <SongMeta song={song} />
          </div>
        </div>
      </section>

      <div className="mt-6">
        <AudioPlayer src={song.audioUrl} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={regenerate}
          className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-primary/50 hover:text-foreground"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          Regenerate
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-red-300 hover:text-red-500"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          </svg>
          Delete
        </button>
      </div>

      <div className="mt-8">
        <LyricsEditor value={song.lyrics} onSave={saveLyrics} />
      </div>
    </main>
  );
}
