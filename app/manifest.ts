import type { MetadataRoute } from "next";
import { getLocaleSchemaLanguage } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";
import { getSiteDescription, siteConfig } from "@/lib/seo";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const locale = await getRequestLocale();
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: getSiteDescription(locale),
    start_url: "/",
    display: "standalone",
    // Mirrors the dark --background from app/globals.css. A single static
    // manifest cannot express both color schemes; dark is correct here
    // because ThemeProvider defaults to dark (see app/layout.tsx).
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    lang: getLocaleSchemaLanguage(locale),
    icons: [
      {
        src: "/icon-light-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
