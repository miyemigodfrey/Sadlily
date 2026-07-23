"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ChipSelect from "./ChipSelect";
import GeneratingOverlay from "./GeneratingOverlay";
import { GENRES, MOODS, TEMPOS, VOCALS, DEFAULT_OPTIONS, DEFAULT_MODEL } from "@/lib/options";
import type { GenerationMode, GenerationOptions, Song, VocalType } from "@/lib/types";
import { startGeneration, inventTitle, hueFor } from "@/lib/generate";
import { startLyrics, fetchLyricsStatus, type LyricsOption } from "@/lib/lyrics";
import { saveSong } from "@/lib/songs";

type LyricsGen =
  | { state: "idle" }
  | { state: "working" }
  | { state: "choosing"; options: LyricsOption[] }
  | { state: "error"; msg: string };

const EXAMPLE_PROMPTS = [
  "a rainy goodbye at a train station",
  "missing someone who moved on",
  "the empty side of the bed",
  "growing apart from an old friend",
  "a bad breakup",
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
  const [mode, setMode] = useState<GenerationMode>(DEFAULT_OPTIONS.mode);
  const [lyrics, setLyrics] = useState(DEFAULT_OPTIONS.lyrics);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lyricsGen, setLyricsGen] = useState<LyricsGen>({ state: "idle" });

  const needsLyrics = mode === "custom" && !instrumental;

  async function generateLyrics() {
    const seed = prompt.trim();
    if (!seed || lyricsGen.state === "working") return;
    setLyricsGen({ state: "working" });
    try {
      const taskId = await startLyrics(seed);
      const startedAt = Date.now();
      for (;;) {
        await new Promise((r) => setTimeout(r, 3000));
        if (Date.now() - startedAt > 90000) {
          setLyricsGen({ state: "error", msg: "Timed out — please try again." });
          return;
        }
        const result = await fetchLyricsStatus(taskId);
        if (result.failed) {
          setLyricsGen({
            state: "error",
            msg: result.errorMessage || "Lyrics generation failed.",
          });
          return;
        }
        if (result.done && result.options.length) {
          setLyricsGen({ state: "choosing", options: result.options });
          return;
        }
      }
    } catch (e) {
      setLyricsGen({
        state: "error",
        msg: e instanceof Error ? e.message : "Something went wrong.",
      });
    }
  }

  function applyLyricsOption(option: LyricsOption) {
    setLyrics(option.text);
    if (!title.trim()) setTitle(option.title);
    setLyricsGen({ state: "idle" });
  }
  const canGenerate =
    prompt.trim().length > 0 &&
    (!needsLyrics || lyrics.trim().length > 0) &&
    !generating;

  async function handleGenerate() {
    if (!canGenerate) return;
    setGenerating(true);
    setError(null);

    const opts: GenerationOptions = {
      prompt,
      title,
      genres,
      mood,
      tempo,
      vocal: instrumental ? "instrumental" : vocal,
      instrumental,
      mode,
      lyrics: mode === "custom" ? lyrics : undefined,
      model: DEFAULT_MODEL,
    };

    try {
      const taskId = await startGeneration(opts);
      const song: Song = {
        ...opts,
        id: Math.random().toString(36).slice(2, 10),
        taskId,
        status: "pending",
        title: inventTitle(opts),
        variants: [],
        activeVariant: 0,
        coverHue: hueFor(mood),
        createdAt: Date.now(),
      };
      saveSong(song);
      router.push(`/song/${song.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setGenerating(false);
    }
  }

  return (
    <>
      {generating && <GeneratingOverlay label="Sending your request…" />}
      <div className="rounded-3xl border border-border bg-surface/80 p-6 shadow-lg shadow-nude-300/20 backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-6">
          {/* Mode toggle */}
          <div className="flex rounded-2xl border border-border bg-surface-soft p-1 text-sm font-medium">
            {(
              [
                ["simple", "Describe a feeling"],
                ["custom", "Write my own lyrics"],
              ] as [GenerationMode, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`flex-1 rounded-xl px-3 py-2 transition-colors ${
                  mode === value
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

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

          {needsLyrics && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-foreground">Lyrics</label>
                <button
                  type="button"
                  onClick={generateLyrics}
                  disabled={lyricsGen.state === "working" || !prompt.trim()}
                  className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {lyricsGen.state === "working" ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
                      Writing…
                    </>
                  ) : (
                    <>✨ Write lyrics for me</>
                  )}
                </button>
              </div>

              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                rows={8}
                placeholder={"[Verse 1]\nWrite the words you want sung…\n\n[Chorus]\n…"}
                className="w-full resize-y rounded-2xl border border-border bg-surface-soft p-4 font-mono text-sm leading-relaxed text-foreground outline-none placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-ring/40"
              />

              {lyricsGen.state === "error" && (
                <p className="text-xs text-red-600">{lyricsGen.msg}</p>
              )}

              {lyricsGen.state === "choosing" && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-muted">
                    Pick a draft to drop into the editor:
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {lyricsGen.options.map((option, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => applyLyricsOption(option)}
                        className="rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:border-primary/50 hover:bg-surface-soft"
                      >
                        <span className="block font-display text-sm font-semibold text-foreground">
                          {option.title}
                        </span>
                        <span className="mt-1 block whitespace-pre-line text-xs leading-relaxed text-muted">
                          {option.text.slice(0, 150).trim()}…
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted">
                These exact words will be sung. Use [Verse], [Chorus] tags to shape the song.
              </p>
            </div>
          )}

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

          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

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
