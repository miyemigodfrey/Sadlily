import type { Song } from "@/lib/types";
import { VOCALS } from "@/lib/options";

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-surface-soft px-3 py-1 text-xs font-medium text-foreground/80">
      {children}
    </span>
  );
}

export default function SongMeta({ song }: { song: Song }) {
  const vocalLabel = VOCALS.find((v) => v.value === song.vocal)?.label ?? song.vocal;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tag>{song.mood}</Tag>
      {song.genres.map((g) => (
        <Tag key={g}>{g}</Tag>
      ))}
      <Tag>{song.tempo} tempo</Tag>
      <Tag>{song.instrumental ? "Instrumental" : vocalLabel}</Tag>
    </div>
  );
}
