import PromptForm from "./components/PromptForm";
import Library from "./components/Library";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:py-16">
      <section className="mb-10 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs font-medium text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          AI sad-song studio
        </span>
        <h1 className="mt-5 font-display text-5xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">
          Turn a feeling into
          <br />
          <span className="bg-gradient-to-r from-sky-500 to-nude-600 bg-clip-text text-transparent">
            a sad song.
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-muted">
          Describe the ache, pick a mood, and let Sadlily compose something to cry to.
        </p>
      </section>

      <PromptForm />

      <div className="mt-14">
        <Library />
      </div>
    </main>
  );
}
