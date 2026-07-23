import { buildKiePayload } from "@/lib/kie";
import { kieBase, kieKey, kieCallbackUrl } from "@/lib/kieServer";
import type { GenerationOptions } from "@/lib/types";

export async function POST(request: Request) {
  const apiKey = kieKey();
  if (!apiKey) {
    return Response.json(
      { error: "Server is missing SUNO_API_KEY." },
      { status: 500 },
    );
  }

  let opts: GenerationOptions;
  try {
    opts = (await request.json()) as GenerationOptions;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Minimal validation mirroring Kie's mode requirements.
  if (opts.mode === "custom") {
    if (!opts.instrumental && !opts.lyrics?.trim()) {
      return Response.json(
        { error: "Custom vocal songs need lyrics." },
        { status: 400 },
      );
    }
  } else if (!opts.prompt?.trim()) {
    return Response.json(
      { error: "A prompt is required." },
      { status: 400 },
    );
  }

  // Kie requires a callBackUrl on every request. We fill results by polling,
  // so when SUNO_CALLBACK_URL isn't set we point it at our own no-op receiver.
  const callBackUrl =
    kieCallbackUrl() ||
    new URL("/api/generate/callback", request.url).toString();
  const payload = buildKiePayload(opts, callBackUrl);

  let res: Response;
  try {
    res = await fetch(`${kieBase()}/api/v1/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return Response.json(
      { error: "Could not reach the music service." },
      { status: 502 },
    );
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.code !== 200 || !data.data?.taskId) {
    const msg = data?.msg || `Music service error (${res.status}).`;
    return Response.json({ error: msg }, { status: res.ok ? 502 : res.status });
  }

  return Response.json({ taskId: data.data.taskId as string });
}
