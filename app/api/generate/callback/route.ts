/**
 * No-op webhook receiver. Sadlily fills results by polling the status route
 * (songs live in the browser's localStorage, which a server webhook can't
 * write to). This endpoint just acknowledges Kie's callbacks so they don't
 * error if SUNO_CALLBACK_URL happens to point here.
 */
export async function POST() {
  return Response.json({ ok: true });
}
