/** Measure initial script bytes from a production page; gzip is an estimate. */
import { gzipSync } from "node:zlib";

const page = new URL(process.argv[2] ?? "http://localhost:3001/dns");
const response = await fetch(page);
if (!response.ok) throw new Error(`Page returned HTTP ${response.status}`);
const html = await response.text();
const urls = [...new Set([...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((match) => match[1]))];
const files = await Promise.all(urls.map(async (url) => {
  const script = await fetch(new URL(url, page));
  if (!script.ok) throw new Error(`${url} returned HTTP ${script.status}`);
  const bytes = Buffer.from(await script.arrayBuffer());
  return { url, bytes: bytes.length, gzip: gzipSync(bytes).length };
}));
console.log(JSON.stringify({
  route: page.pathname,
  scriptCount: files.length,
  rawBytes: files.reduce((sum, file) => sum + file.bytes, 0),
  gzipBytes: files.reduce((sum, file) => sum + file.gzip, 0),
  files,
}, null, 2));
