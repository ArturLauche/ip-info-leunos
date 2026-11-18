export function discardResponseBody(response: Response): void {
  // Cancellation can wait on a sibling stream. Initiate cleanup without
  // holding the provider's deadline, retry loop or admission queue open.
  void response.body?.cancel().catch(() => {});
}

type TextReadResult = { kind: "ok"; text: string } | { kind: "missing" | "oversized" };

/** Count decoded response bytes before appending text, including across UTF-8 chunk boundaries. */
export async function readBoundedText(response: Response, maxBytes: number): Promise<TextReadResult> {
  if (!response.body) return { kind: "missing" };
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let receivedBytes = 0;
  let text = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return { kind: "ok", text: text + decoder.decode() };
      receivedBytes += value.byteLength;
      if (receivedBytes > maxBytes) {
        void reader.cancel().catch(() => {});
        return { kind: "oversized" };
      }
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}
