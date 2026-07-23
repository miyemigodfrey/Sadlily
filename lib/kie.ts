import type { GenerationOptions } from "./types";
import { DEFAULT_MODEL } from "./options";

/** Shape of the request body Kie.ai's POST /api/v1/generate expects. */
export interface KiePayload {
  prompt: string;
  customMode: boolean;
  instrumental: boolean;
  model: string;
  callBackUrl?: string;
  style?: string;
  title?: string;
  vocalGender?: "m" | "f";
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) : text;
}

/** Builds a "style" string from the UI's genre/mood/tempo selections. */
export function buildStyle(opts: GenerationOptions): string {
  return [...opts.genres, opts.mood, `${opts.tempo} tempo`]
    .filter(Boolean)
    .join(", ");
}

function vocalGender(opts: GenerationOptions): "m" | "f" | undefined {
  if (opts.instrumental) return undefined;
  if (opts.vocal === "female") return "f";
  if (opts.vocal === "male") return "m";
  return undefined; // duet — let Suno decide
}

/**
 * Maps Sadlily's generation options onto Kie.ai's request body.
 *
 * Simple mode (customMode:false): only `prompt` is honored by the API, so the
 * style selections are folded into the prompt text (capped at 500 chars).
 *
 * Custom mode (customMode:true): `style` + `title` are sent; for vocal songs
 * `prompt` becomes the exact lyrics, for instrumental it's left empty.
 */
export function buildKiePayload(
  opts: GenerationOptions,
  callBackUrl?: string,
): KiePayload {
  const model = opts.model || DEFAULT_MODEL;
  const style = buildStyle(opts);
  const title = opts.title?.trim();

  if (opts.mode === "custom") {
    return {
      customMode: true,
      instrumental: opts.instrumental,
      model,
      callBackUrl,
      style: truncate(style, 1000),
      title: truncate(title || "Untitled", 80),
      vocalGender: vocalGender(opts),
      // Vocal custom songs use the prompt as literal lyrics; instrumental has none.
      prompt: opts.instrumental ? "" : truncate(opts.lyrics ?? "", 5000),
    };
  }

  // Simple mode: enrich the description with the style hints.
  const enriched = `${opts.prompt.trim()} — style: ${style}${
    opts.instrumental ? ", instrumental" : ""
  }`;
  return {
    customMode: false,
    instrumental: opts.instrumental,
    model,
    callBackUrl,
    prompt: truncate(enriched, 500),
  };
}
