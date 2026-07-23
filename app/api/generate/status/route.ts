import { kieBase, kieKey } from "@/lib/kieServer";
import type { Track } from "@/lib/types";

const FAILED_STATES = [
  "CREATE_TASK_FAILED",
  "GENERATE_AUDIO_FAILED",
  "SENSITIVE_WORD_ERROR",
];

interface SunoItem {
  id: string;
  audioUrl?: string;
  streamAudioUrl?: string;
  imageUrl?: string;
  title?: string;
  tags?: string;
  duration?: number;
  prompt?: string;
}

export async function GET(request: Request) {
  const apiKey = kieKey();
  if (!apiKey) {
    return Response.json(
      { error: "Server is missing SUNO_API_KEY." },
      { status: 500 },
    );
  }

  const taskId = new URL(request.url).searchParams.get("taskId");
  if (!taskId) {
    return Response.json({ error: "Missing taskId." }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(
      `${kieBase()}/api/v1/generate/record-info?taskId=${encodeURIComponent(taskId)}`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );
  } catch {
    return Response.json(
      { error: "Could not reach the music service." },
      { status: 502 },
    );
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    return Response.json(
      { error: `Music service error (${res.status}).` },
      { status: res.ok ? 502 : res.status },
    );
  }

  const d = data.data ?? {};
  const status: string = d.status ?? "PENDING";
  const items: SunoItem[] = d.response?.sunoData ?? [];

  const tracks: Track[] = items
    .filter((it) => it.audioUrl)
    .map((it) => ({
      id: it.id,
      audioUrl: it.audioUrl as string,
      streamAudioUrl: it.streamAudioUrl,
      imageUrl: it.imageUrl,
      title: it.title ?? "",
      tags: it.tags,
      duration: it.duration,
      lyrics: it.prompt ?? "",
    }));

  return Response.json({
    status,
    done: status === "SUCCESS",
    failed: FAILED_STATES.includes(status),
    errorMessage: d.errorMessage ?? null,
    tracks,
  });
}
