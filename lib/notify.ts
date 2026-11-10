/**
 * Client-side toast notifications without shipping `sonner` in every page's
 * critical JavaScript. The toaster is mounted after the page is idle (see
 * components/deferred-toaster.tsx) or immediately when the first notification
 * is requested, and `notify` waits for it: sonner's <Toaster> starts with an
 * empty list, so a toast published before it subscribed would be lost.
 */

type ToastKind = "success" | "error";

const mountRequests = new Set<() => void>();
let resolveMounted: (() => void) | null = null;
let mounted = createMountedPromise();

function createMountedPromise() {
  return new Promise<void>((resolve) => {
    resolveMounted = resolve;
  });
}

/** Registers the deferred toaster's "mount now" callback. */
export function onToasterRequested(callback: () => void): () => void {
  mountRequests.add(callback);
  return () => mountRequests.delete(callback);
}

/** Called once the toaster has subscribed to the toast store. */
export function markToasterMounted() {
  resolveMounted?.();
}

/** Called when the toaster unmounts, so later toasts wait for a remount. */
export function markToasterUnmounted() {
  mounted = createMountedPromise();
}

export async function notify(kind: ToastKind, message: string): Promise<void> {
  for (const request of mountRequests) request();
  const [{ toast }] = await Promise.all([import("sonner"), mounted]);
  toast[kind](message);
}
