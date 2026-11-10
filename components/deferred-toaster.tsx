"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentProps } from "react";

import { onToasterRequested } from "@/lib/notify";
import type { Toaster as ToasterComponent } from "@/components/ui/sonner";

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((module) => module.Toaster),
  { ssr: false },
);

type ToasterProps = ComponentProps<typeof ToasterComponent>;

/**
 * Mounts the toast container once the browser is idle after hydration, or as
 * soon as a notification is requested, keeping sonner out of the code every
 * page has to download and execute before it becomes interactive.
 */
export function DeferredToaster(props: ToasterProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    const mount = () => setReady(true);
    const unsubscribe = onToasterRequested(mount);

    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(mount, { timeout: 4_000 });
      return () => {
        unsubscribe();
        window.cancelIdleCallback(handle);
      };
    }
    const timer = window.setTimeout(mount, 2_000);
    return () => {
      unsubscribe();
      window.clearTimeout(timer);
    };
  }, [ready]);

  return ready ? <Toaster {...props} /> : null;
}
