/**
 * No-op webhook receiver for lyrics generation. Sadlily polls the status
 * route instead, so this just acknowledges Kie's callbacks.
 */
export async function POST() {
  return Response.json({ ok: true });
}
