export interface LyricsOption {
  title: string;
  text: string;
}

export interface LyricsStatusResult {
  status: string;
  done: boolean;
  failed: boolean;
  errorMessage: string | null;
  options: LyricsOption[];
}

/** Kicks off AI lyrics generation via our server route. Returns the taskId. */
export async function startLyrics(prompt: string): Promise<string> {
  const res = await fetch("/api/lyrics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.taskId) {
    throw new Error(data?.error || "Could not start lyrics generation.");
  }
  return data.taskId as string;
}

/** Polls lyrics generation status via our server route. */
export async function fetchLyricsStatus(taskId: string): Promise<LyricsStatusResult> {
  const res = await fetch(
    `/api/lyrics/status?taskId=${encodeURIComponent(taskId)}`,
  );
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    throw new Error(data?.error || "Could not check lyrics status.");
  }
  return data as LyricsStatusResult;
}
