interface CoverArtProps {
  hue: number;
  title: string;
  size?: "sm" | "lg";
}

/** Deterministic gradient "album art" derived from the song's mood hue. */
export default function CoverArt({ hue, title, size = "lg" }: CoverArtProps) {
  const dimension = size === "lg" ? "h-full w-full" : "h-14 w-14";
  const initial = title.trim().charAt(0).toUpperCase() || "♪";
  return (
    <div
      className={`${dimension} relative flex items-center justify-center overflow-hidden rounded-2xl`}
      style={{
        background: `linear-gradient(150deg, hsl(${hue} 70% 72%), hsl(${(hue + 40) % 360} 45% 82%) 55%, hsl(28 40% 84%))`,
      }}
    >
      <span
        className="font-display font-semibold text-white/85 drop-shadow"
        style={{ fontSize: size === "lg" ? "3.5rem" : "1.3rem" }}
      >
        {initial}
      </span>
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_45%)]" />
    </div>
  );
}
