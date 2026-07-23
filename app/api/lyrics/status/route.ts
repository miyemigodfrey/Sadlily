import { kieBase, kieKey } from "@/lib/kieServer";

interface LyricItem {
  text?: string;
  title?: string;
  status?: string;
  errorMessage?: string;
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
      `${kieBase()}/api/v1/lyrics/record-info?taskId=${encodeURIComponent(taskId)}`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );
  } catch {
    return Response.json(
      { error: "Could not reach the lyrics service." },
      { status: 502 },
    );
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    return Response.json(
      { error: `Lyrics service error (${res.status}).` },
      { status: res.ok ? 502 : res.status },
    );
  }

  const d = data.data ?? {};
  const status: string = d.status ?? "PENDING";
  const items: LyricItem[] = d.response?.data ?? [];

  const options = items
    .filter((it) => it.text)
    .map((it) => ({ title: it.title ?? "Untitled", text: it.text as string }));

  const failed =
    status.endsWith("FAILED") ||
    status === "SENSITIVE_WORD_ERROR" ||
    Boolean(d.errorMessage);

  return Response.json({
    status,
    done: status === "SUCCESS",
    failed,
    errorMessage: d.errorMessage ?? null,
    options,
  });
}
