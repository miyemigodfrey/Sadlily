"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateSong, deleteSong } from "@/lib/songs";
import { useSong, useHydrated } from "@/lib/useSongs";
import { useSongPolling } from "@/lib/useSongPolling";
import { startGeneration } from "@/lib/generate";
import { activeTrack } from "@/lib/types";
import CoverArt from "@/app/components/CoverArt";
import SongMeta from "@/app/components/SongMeta";
import AudioPlayer from "@/app/components/AudioPlayer";
import LyricsEditor from "@/app/components/LyricsEditor";

function BackLink() {
  return (
    <Link
      href="/"
      className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
      </svg>
      Back
    </Link>
  );
}

export default function SongDetail({ id }: { id: string }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const song = useSong(id);
  useSongPolling(song);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function commitTitle() {
    const next = titleDraft.trim();
    if (next) updateSong(id, { title: next });
    setEditingTitle(false);
  }

  function saveLyrics(newLyrics: string) {
    if (!song) return;
    const variants = song.variants.map((t, i) =>
      i === song.activeVariant ? { ...t, lyrics: newLyrics } : t,
    );
    updateSong(id, { variants });
  }

  function setActive(index: number) {
    updateSong(id, { activeVariant: index });
  }

  async function regenerate() {
    if (!song) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const taskId = await startGeneration({
        prompt: song.prompt,
        title: song.title,
        genres: song.genres,
        mood: song.mood,
        tempo: song.tempo,
        vocal: song.vocal,
        instrumental: song.instrumental,
        mode: song.mode,
        lyrics: song.lyrics,
        model: song.model,
      });
      updateSong(id, {
        taskId,
        status: "pending",
        variants: [],
        activeVariant: 0,
        errorMessage: undefined,
      });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not regenerate.");
    } finally {
      setSubmitting(false);
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

  const track = activeTrack(song);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:py-12">
      <BackLink />

      {/* Header: cover + title + prompt + meta */}
      <section className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="h-40 w-40 shrink-0 shadow-lg shadow-nude-300/30">
          <CoverArt hue={song.coverHue} title={song.title} imageUrl={track?.imageUrl} />
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

      {/* Status-dependent body */}
      {song.status === "pending" && <PendingPanel />}

      {song.status === "failed" && (
        <FailedPanel
          message={song.errorMessage}
          onRetry={regenerate}
          onDelete={handleDelete}
          submitting={submitting}
        />
      )}

      {song.status === "complete" && track && (
        <>
          {song.variants.length > 1 && (
            <div className="mt-6 flex gap-2">
              {song.variants.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    i === song.activeVariant
                      ? "border-primary bg-primary text-on-primary"
                      : "border-border bg-surface text-foreground/80 hover:border-primary/50"
                  }`}
                >
                  Version {String.fromCharCode(65 + i)}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4">
            <AudioPlayer src={track.audioUrl} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={regenerate}
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-50"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              {submitting ? "Starting…" : "Regenerate"}
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

          {actionError && (
            <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {actionError}
            </p>
          )}

          <div className="mt-8">
            <LyricsEditor value={track.lyrics} onSave={saveLyrics} />
          </div>
        </>
      )}
    </main>
  );
}

function PendingPanel() {
  return (
    <section className="mt-8 flex flex-col items-center gap-5 rounded-3xl border border-border bg-surface/70 px-6 py-14 text-center">
      <div className="flex items-end gap-1.5" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="w-2 rounded-full bg-gradient-to-t from-nude-400 to-sky-400"
            style={{
              height: "2.5rem",
              animation: `sadlily-bar 1.1s ease-in-out ${i * 0.12}s infinite`,
            }}
          />
        ))}
      </div>
      <div>
        <p className="font-display text-2xl text-foreground">Sadlily is composing…</p>
        <p className="mt-1 text-sm text-muted">
          Suno usually takes about 1–2 minutes. This page updates automatically.
        </p>
      </div>
      <style>{`
        @keyframes sadlily-bar {
          0%, 100% { transform: scaleY(0.35); opacity: 0.6; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </section>
  );
}

function FailedPanel({
  message,
  onRetry,
  onDelete,
  submitting,
}: {
  message?: string;
  onRetry: () => void;
  onDelete: () => void;
  submitting: boolean;
}) {
  return (
    <section className="mt-8 rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <p className="font-display text-xl text-red-700">Generation failed</p>
      <p className="mt-2 text-sm text-red-600">
        {message || "Suno couldn't finish this one."}
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <button
          type="button"
          onClick={onRetry}
          disabled={submitting}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {submitting ? "Starting…" : "Try again"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          Delete
        </button>
      </div>
    </section>
  );
}
