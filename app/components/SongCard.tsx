import Link from "next/link";
import { activeTrack, formatDuration, type Song } from "@/lib/types";
import CoverArt from "./CoverArt";

export default function SongCard({ song }: { song: Song }) {
  const track = activeTrack(song);
  const pending = song.status === "pending";
  const failed = song.status === "failed";

  return (
    <Link
      href={`/song/${song.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-surface/70 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <CoverArt hue={song.coverHue} title={song.title} imageUrl={track?.imageUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-lg font-semibold text-foreground">
          {song.title}
        </h3>
        <p className="truncate text-sm text-muted">
          {song.mood} · {song.genres.join(", ") || "—"}
        </p>
      </div>
      {pending ? (
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500" />
          Generating
        </span>
      ) : failed ? (
        <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600">
          Failed
        </span>
      ) : (
        <span className="shrink-0 text-xs tabular-nums text-muted">
          {formatDuration(track?.duration)}
        </span>
      )}
    </Link>
  );
}
