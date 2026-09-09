import http, { type IncomingMessage } from "node:http";
import https from "node:https";
import type { Readable } from "node:stream";
import { createBrotliDecompress, createUnzip } from "node:zlib";
import { TargetValidationError } from "./errors";
import { createPinnedLookup } from "./pinned-lookup";
import type { PublicUrl } from "./target";

export interface PublicHttpOptions {
  method?: "GET" | "HEAD";
  headers?: HeadersInit;
  signal?: AbortSignal | null;
  timeoutMs: number;
  maxContentLengthBytes: number;
}

/**
 * Transport for an already-validated URL. A private agent and pinned lookup
 * prevent a fresh DNS answer or pooled socket from escaping that validation.
 * Keeping the URL hostname preserves Host, TLS SNI, and certificate checking.
 * Callers must consume or cancel the returned body.
 */
export async function requestPublicHttp(target: PublicUrl, options: PublicHttpOptions): Promise<Response> {
  options.signal?.throwIfAborted();
  const url = new URL(target.url);
  const lookup = createPinnedLookup(target.addresses);

  return new Promise((resolve, reject) => {
    const headers = new Headers(options.headers);
    // These checkers inspect headers or bounded text; request identity bytes
    // so the stream's byte limit measures exactly what consumers receive.
    headers.set("accept-encoding", "identity");
    headers.delete("host");
    const transport = url.protocol === "https:" ? https : http;
    let incoming: IncomingMessage | undefined;
    let source: Readable | undefined;
    let bodyController: ReadableStreamDefaultController<Uint8Array> | undefined;
    let finished = false;

    const request = transport.request(url, {
      method: options.method ?? "GET",
      headers: Object.fromEntries(headers),
      lookup,
      agent: false,
    });

    const cleanup = () => {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", onAbort);
    };
    const fail = (error: Error) => {
      if (finished) return;
      finished = true;
      cleanup();
      incoming?.destroy();
      source?.destroy();
      request.destroy();
      if (bodyController) bodyController.error(error);
      else reject(error);
    };
    const onAbort = () => fail(new DOMException("The request was aborted.", "AbortError"));
    const timer = setTimeout(() => fail(new TargetValidationError(
      "timeout", "The target request timed out.", 408,
    )), options.timeoutMs);
    timer.unref?.();

    request.on("error", (error) => fail(error));
    request.on("upgrade", (_message, socket) => {
      socket.destroy();
      fail(new TargetValidationError("network_error", "Protocol upgrades are not supported by this checker.", 502));
    });
    request.on("response", (message) => {
      incoming = message;
      if (finished) {
        message.destroy();
        return;
      }

      const responseHeaders = new Headers();
      for (let index = 0; index < message.rawHeaders.length; index += 2) {
        responseHeaders.append(message.rawHeaders[index], message.rawHeaders[index + 1]);
      }
      const tooLarge = (contentLength: number) => new TargetValidationError(
        "target_blocked", "The target response is too large for this public checker.", 413,
        { contentLength, maxContentLengthBytes: options.maxContentLengthBytes },
      );
      const declaredLength = Number(responseHeaders.get("content-length") || 0);
      if (declaredLength > options.maxContentLengthBytes) {
        fail(tooLarge(declaredLength));
        return;
      }

      const status = message.statusCode ?? 502;
      if (status < 200 || status > 599) {
        fail(new TargetValidationError("network_error", "The target returned an invalid HTTP status.", 502));
        return;
      }
      if (options.method === "HEAD" || [204, 205, 304].includes(status)) {
        finished = true;
        cleanup();
        message.destroy();
        resolve(new Response(null, { status, headers: responseHeaders }));
        return;
      }

      let received = 0;
      let wireBytes = 0;
      const encoding = responseHeaders.get("content-encoding")?.toLowerCase().trim();
      const decoder = encoding === "br" ? createBrotliDecompress()
        : ["gzip", "x-gzip", "deflate"].includes(encoding ?? "") ? createUnzip() : null;
      const stream = decoder ?? message;
      source = stream;
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          bodyController = controller;
          // Bound wire and expanded bytes if a server compresses despite our
          // identity request. A small gzip must not expand freely.
          if (decoder) {
            message.on("data", (chunk: Buffer) => {
              wireBytes += chunk.byteLength;
              if (wireBytes > options.maxContentLengthBytes) fail(tooLarge(wireBytes));
            });
          }
          stream.on("data", (chunk: Buffer) => {
            if (finished) return;
            received += chunk.byteLength;
            if (received > options.maxContentLengthBytes) {
              fail(tooLarge(received));
              return;
            }
            controller.enqueue(new Uint8Array(chunk));
            if ((controller.desiredSize ?? 0) <= 0) stream.pause();
          });
          stream.on("end", () => {
            if (finished) return;
            finished = true;
            cleanup();
            controller.close();
          });
          message.on("error", (error) => fail(error));
          if (decoder) decoder.on("error", (error) => fail(error));
          message.on("aborted", () => fail(new TargetValidationError(
            "network_error", "The target response ended unexpectedly.", 502,
          )));
          stream.pause();
          if (decoder) message.pipe(decoder);
        },
        pull() {
          stream.resume();
        },
        cancel() {
          if (finished) return;
          finished = true;
          cleanup();
          message.destroy();
          stream.destroy();
          request.destroy();
        },
      });
      resolve(new Response(body, { status, headers: responseHeaders }));
    });

    if (options.signal?.aborted) onAbort();
    else {
      options.signal?.addEventListener("abort", onAbort, { once: true });
      request.end();
    }
  });
}
