"use client";

interface GeneratingOverlayProps {
  label?: string;
  sublabel?: string;
}

export default function GeneratingOverlay({
  label = "Composing your sad song…",
  sublabel = "tuning the melancholy just right",
}: GeneratingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
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
      <p className="mt-6 font-display text-xl text-foreground">{label}</p>
      <p className="mt-1 text-sm text-muted">{sublabel}</p>

      <style>{`
        @keyframes sadlily-bar {
          0%, 100% { transform: scaleY(0.35); opacity: 0.6; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
