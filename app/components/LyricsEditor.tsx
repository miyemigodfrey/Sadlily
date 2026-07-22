"use client";

import { useState } from "react";

interface LyricsEditorProps {
  value: string;
  onSave: (next: string) => void;
}

export default function LyricsEditor({ value, onSave }: LyricsEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [justSaved, setJustSaved] = useState(false);

  function startEdit() {
    setDraft(value);
    setEditing(true);
    setJustSaved(false);
  }

  function save() {
    onSave(draft);
    setEditing(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Lyrics</h2>
        {editing ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-soft"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-hover"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            {justSaved ? "Saved ✓" : "Edit"}
          </button>
        )}
      </div>

      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={16}
          className="w-full resize-y rounded-xl border border-border bg-surface-soft p-4 font-mono text-sm leading-relaxed text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
        />
      ) : (
        <pre className="whitespace-pre-wrap font-sans text-[0.95rem] leading-relaxed text-foreground/90">
          {value}
        </pre>
      )}
    </section>
  );
}
