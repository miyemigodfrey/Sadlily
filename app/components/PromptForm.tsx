"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ChipSelect from "./ChipSelect";
import GeneratingOverlay from "./GeneratingOverlay";
import { GENRES, MOODS, TEMPOS, VOCALS, DEFAULT_OPTIONS } from "@/lib/options";
import type { VocalType } from "@/lib/types";
import { generateSong } from "@/lib/generate";
import { saveSong } from "@/lib/songs";

const EXAMPLE_PROMPTS = [
  "a rainy goodbye at a train station",
  "missing someone who moved on",
  "the empty side of the bed",
  "growing apart from an old friend",
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      {children}
    </div>
  );
}

export default function PromptForm() {
  const router = useRouter();
  const [prompt, setPrompt] = useState(DEFAULT_OPTIONS.prompt);
  const [title, setTitle] = useState(DEFAULT_OPTIONS.title);
  const [genres, setGenres] = useState<string[]>(DEFAULT_OPTIONS.genres);
  const [mood, setMood] = useState(DEFAULT_OPTIONS.mood);
  const [tempo, setTempo] = useState<string>(DEFAULT_OPTIONS.tempo);
  const [vocal, setVocal] = useState<VocalType>(DEFAULT_OPTIONS.vocal);
  const [instrumental, setInstrumental] = useState(DEFAULT_OPTIONS.instrumental);
  const [generating, setGenerating] = useState(false);

  const canGenerate = prompt.trim().length > 0 && !generating;

  async function handleGenerate() {
    if (!canGenerate) return;
    setGenerating(true);
    try {
      const song = await generateSong({
        prompt,
        title,
        genres,
        mood,
        tempo,
        vocal: instrumental ? "instrumental" : vocal,
        instrumental,
      });
      saveSong(song);
      router.push(`/song/${song.id}`);
    } catch {
      setGenerating(false);
    }
  }

  return (
    <>
      {generating && <GeneratingOverlay />}
      <div className="rounded-3xl border border-border bg-surface/80 p-6 shadow-lg shadow-nude-300/20 backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-6">
          <Field label="What's the song about?">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Describe the feeling, the story, the person…"
              className="w-full resize-none rounded-2xl border border-border bg-surface-soft p-4 text-[0.95rem] leading-relaxed text-foreground outline-none placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setPrompt(ex)}
                  className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {ex}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Song title (optional)">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Leave blank and we'll name it for you"
              className="w-full rounded-2xl border border-border bg-surface-soft px-4 py-3 text-[0.95rem] text-foreground outline-none placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Genres">
              <ChipSelect options={GENRES} selected={genres} onChange={setGenres} multi />
            </Field>
            <Field label="Mood">
              <ChipSelect
                options={MOODS}
                selected={[mood]}
                onChange={(next) => setMood(next[0] ?? mood)}
              />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Tempo">
              <ChipSelect
                options={TEMPOS}
                selected={[tempo]}
                onChange={(next) => setTempo(next[0] ?? tempo)}
              />
            </Field>
            <Field label="Vocals">
              <ChipSelect
                options={VOCALS.filter((v) => v.value !== "instrumental").map((v) => v.label)}
                selected={[VOCALS.find((v) => v.value === vocal)?.label ?? "Female"]}
                onChange={(next) => {
                  const found = VOCALS.find((v) => v.label === next[0]);
                  if (found) setVocal(found.value);
                }}
              />
            </Field>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-surface-soft px-4 py-3">
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Instrumental</span>
              <span className="text-xs text-muted">No vocals — just the music</span>
            </span>
            <input
              type="checkbox"
              checked={instrumental}
              onChange={(e) => setInstrumental(e.target.checked)}
              className="peer sr-only"
            />
            <span className="relative h-6 w-11 rounded-full bg-border transition-colors peer-checked:bg-primary">
              <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            </span>
          </label>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="mt-1 flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 text-base font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:from-sky-600 hover:to-sky-500 hover:shadow-sky-500/35 disabled:cursor-not-allowed disabled:from-nude-400 disabled:to-nude-400 disabled:shadow-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            Generate sad song
          </button>
        </div>
      </div>
    </>
  );
}
