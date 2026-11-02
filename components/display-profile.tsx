"use client";

import { useEffect } from "react";

import {
  DISPLAY_PROFILE_MEDIA_QUERIES,
  readDisplayProfile,
} from "@/lib/display-profile";

/**
 * Publishes the current display capabilities as data attributes on <html>:
 *
 * - data-display-shape="round" | "rect" | "unknown"
 * - data-device-posture="folded" | "continuous" | "unknown"
 * - data-viewport-segments="<horizontal>x<vertical>"
 * - data-watch / data-foldable (presence)
 *
 * The CSS keeps a width-based fallback, so the first paint is already usable;
 * these attributes only refine it (for example circular safe areas on a round
 * Wear OS watch, whose browser does not implement the CSS `shape` feature).
 */
export function DisplayProfile() {
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    let frame = 0;
    const queries = DISPLAY_PROFILE_MEDIA_QUERIES.map((query) =>
      window.matchMedia(query),
    );
    const apply = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const profile = readDisplayProfile();
        const root = document.documentElement;
        root.dataset.displayShape = profile.shape;
        root.dataset.devicePosture = profile.posture;
        root.dataset.viewportSegments = `${profile.horizontalSegments}x${profile.verticalSegments}`;
        root.toggleAttribute("data-watch", profile.isWatch);
        root.toggleAttribute("data-foldable", profile.isFoldable);
      });
    };

    const detach = queries.map((query) => {
      const listener = () => apply();
      if (typeof query.addEventListener === "function") {
        query.addEventListener("change", listener);
        return () => query.removeEventListener("change", listener);
      }
      query.addListener(listener);
      return () => query.removeListener(listener);
    });

    apply();
    window.addEventListener("resize", apply, { passive: true });
    window.addEventListener("orientationchange", apply);

    return () => {
      cancelAnimationFrame(frame);
      for (const remove of detach) remove();
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, []);

  return null;
}
