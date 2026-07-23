import { kieBase, kieKey, kieCallbackUrl } from "@/lib/kieServer";

export async function POST(request: Request) {
  const apiKey = kieKey();
  if (!apiKey) {
    return Response.json(
      { error: "Server is missing SUNO_API_KEY." },
      { status: 500 },
    );
  }

  let body: { prompt?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return Response.json(
      { error: "Describe what the lyrics should be about." },
      { status: 400 },
    );
  }

  // Kie requires a callBackUrl; we poll for the result, so fall back to our own.
  const callBackUrl =
    kieCallbackUrl() ||
    new URL("/api/lyrics/callback", request.url).toString();

  let res: Response;
  try {
    res = await fetch(`${kieBase()}/api/v1/lyrics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      // Kie caps the lyrics prompt at 200 characters.
      body: JSON.stringify({ prompt: prompt.slice(0, 200), callBackUrl }),
    });
  } catch {
    return Response.json(
      { error: "Could not reach the lyrics service." },
      { status: 502 },
    );
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.code !== 200 || !data.data?.taskId) {
    const msg = data?.msg || `Lyrics service error (${res.status}).`;
    return Response.json({ error: msg }, { status: res.ok ? 502 : res.status });
  }

  return Response.json({ taskId: data.data.taskId as string });
}
