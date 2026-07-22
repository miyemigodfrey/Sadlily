import Link from "next/link";
import type { Song } from "@/lib/types";
import CoverArt from "./CoverArt";

export default function SongCard({ song }: { song: Song }) {
  return (
    <Link
      href={`/song/${song.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-surface/70 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <CoverArt hue={song.coverHue} title={song.title} size="sm" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-lg font-semibold text-foreground">
          {song.title}
        </h3>
        <p className="truncate text-sm text-muted">
          {song.mood} · {song.genres.join(", ") || "—"}
        </p>
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted">{song.durationLabel}</span>
    </Link>
  );
}
