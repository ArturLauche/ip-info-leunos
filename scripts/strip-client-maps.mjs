// Turbopack currently always emits a client source map for the nomodule
// polyfill, even with `productionBrowserSourceMaps: false` (Next.js #89894).
// Strip client maps after `next build` so they are not deployed or served.
import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
        return;
      }
      if (entry.name.endsWith(".map")) {
        await unlink(path);
      }
    }),
  );
}

await walk(join(process.cwd(), ".next/static"));
