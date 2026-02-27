import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    environment:
      "Cloudflare Pages isolates runtime DNS configuration, so resolver-level introspection is unavailable in this environment.",
    resolvers: [],
    privacyScore: 0,
    summary:
      "Resolver detection is not supported on this deployment target. Run this app locally in Node.js to inspect local DNS resolvers.",
  });
}
