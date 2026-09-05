/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  // Barrel import (`from "lucide-react"`) used across ~20 client components;
  // let Next rewrite it to per-icon imports so routes only bundle what they use.
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Client maps are also stripped after build (scripts/strip-client-maps.mjs)
  // because Turbopack still emits the nomodule-polyfill map (Next.js #89894).
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        // Baseline hardening for every response (pages and API routes).
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
          },
        ],
      },
    ];
  },
}

export default nextConfig
