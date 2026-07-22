import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-surface/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-nude-400 text-lg shadow-sm">
            🌧️
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Sadlily
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium text-muted">
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 transition-colors hover:bg-surface-soft hover:text-foreground"
          >
            Create
          </Link>
          <Link
            href="/#library"
            className="rounded-full px-3 py-1.5 transition-colors hover:bg-surface-soft hover:text-foreground"
          >
            Library
          </Link>
        </nav>
      </div>
    </header>
  );
}
