/**
 * Incrementally reads a fetch `Response` body as JSON while enforcing a hard
 * byte cap. Unlike `response.text()`/`response.json()`, which buffer the full
 * body first, this cancels the stream as soon as the limit is crossed, so an
 * oversized or unbounded upstream body is never fully downloaded or retained.
 * Bytes are counted as UTF-8 octets (`Uint8Array.byteLength`), not JS string
 * code units.
 */
export async function readBoundedJson(
  response: Response,
  maxBytes: number,
): Promise<unknown> {
  const body = response.body;
  if (!body) {
    throw new Error("Upstream response had no body.");
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    receivedBytes += value.byteLength;
    if (receivedBytes > maxBytes) {
      await reader.cancel().catch(() => {});
      throw new Error(
        `Upstream response exceeded the ${maxBytes} byte limit.`,
      );
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(merged));
}
