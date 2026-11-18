export type BoundedJsonBody =
  | { ok: true; value: unknown }
  | { ok: false; reason: "too_large" | "invalid_json" };

/**
 * Reads a JSON request body with a hard byte cap. Route handlers impose no
 * body-size limit of their own, so `request.json()` alone would buffer an
 * arbitrarily large upload into memory; the rate limiter is the only other
 * throttle and must not be the only one.
 *
 * Two layers: a `content-length` pre-check rejects oversized bodies before
 * reading anything, and the stream itself is capped while reading, so a
 * missing or lying content-length cannot force a large body into memory.
 */
export async function readBoundedJsonBody(
  request: Pick<Request, "headers" | "body">,
  maxBytes: number,
): Promise<BoundedJsonBody> {
  const contentLengthRaw = request.headers.get("content-length");
  const contentLength = contentLengthRaw === null ? Number.NaN : Number(contentLengthRaw);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return { ok: false, reason: "too_large" };
  }

  if (!request.body) return { ok: false, reason: "invalid_json" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      receivedBytes += value.byteLength;
      if (receivedBytes > maxBytes) {
        void reader.cancel().catch(() => {});
        return { ok: false, reason: "too_large" };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const text = new TextDecoder().decode(
    chunks.length === 1 ? chunks[0] : Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))),
  );

  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
}
