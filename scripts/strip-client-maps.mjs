// Turbopack currently always emits a client source map for the nomodule
// polyfill, even with `productionBrowserSourceMaps: false` (Next.js #89894).
// Strip client maps after `next build` so they are not deployed or served.
import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";

let removed = 0;

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
        return;
      }
      if (entry.name.endsWith(".map")) {
        await unlink(path);
        removed += 1;
      }
    }),
  );
}

await walk(join(process.cwd(), ".next/static"));
if (removed > 0) console.log(`Stripped ${removed} client source map(s).`);
