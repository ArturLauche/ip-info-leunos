export class BoundedBodyError extends Error {
  readonly maxBytes: number;

  constructor(maxBytes: number) {
    super(`Upstream response exceeded the ${maxBytes} byte limit.`);
    this.name = "BoundedBodyError";
    this.maxBytes = maxBytes;
  }
}

export async function readBoundedBytes(
  source: Response | Request,
  maxBytes: number,
): Promise<Uint8Array> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new RangeError("The body byte limit must be a non-negative safe integer.");
  }

  const body = source.body;
  if (!body) {
    throw new Error("Upstream response had no body.");
  }

  const declaredBytes = Number(source.headers.get("content-length"));
  if (Number.isFinite(declaredBytes) && declaredBytes > maxBytes) {
    await cancelBody(body);
    throw new BoundedBodyError(maxBytes);
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    receivedBytes += value.byteLength;
    if (receivedBytes > maxBytes) {
      await cancelReader(reader);
      throw new BoundedBodyError(maxBytes);
    }

    chunks.push(value);
  }

  const merged = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return merged;
}

export async function readBoundedJson(source: Response | Request, maxBytes: number): Promise<unknown> {
  const bytes = await readBoundedBytes(source, maxBytes);
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function readBoundedText(source: Response | Request, maxBytes: number): Promise<string> {
  const bytes = await readBoundedBytes(source, maxBytes);
  return new TextDecoder().decode(bytes);
}

async function cancelBody(body: ReadableStream<Uint8Array>) {
  try {
    await body.cancel();
  } catch {
    return;
  }
}

async function cancelReader(reader: ReadableStreamDefaultReader<Uint8Array>) {
  try {
    await reader.cancel();
  } catch {
    return;
  }
}
