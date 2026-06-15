// Generates every favicon / app-icon asset from one source of truth so the
// brand mark stays consistent across the browser tab, the PWA manifest and the
// in-app <BrandMark>. Run with: `node scripts/generate-icons.mjs`
//
// Output (all in /public):
//   icon.svg              adaptive (matches light/dark like the in-app tile)
//   favicon.ico           16 / 32 / 48 px, dark tile
//   apple-icon.png        180 px, dark tile, full-bleed (iOS masks corners)
//   icon-light-32x32.png  dark tile  (for light backgrounds)
//   icon-dark-32x32.png   light tile (for dark backgrounds)

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const DARK = { bg: "#0A0A0A", fg: "#FAFAFA", border: "#2E2E2E" };
const LIGHT = { bg: "#FAFAFA", fg: "#0A0A0A", border: "#E5E5E5" };

/** The globe + locator glyph, authored on a 64×64 grid. */
const glyph = (fg) => `
    <g fill="none" stroke="${fg}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="32" cy="32" r="19"/>
      <path d="M13 32H51"/>
      <path d="M32 13A10 19 0 0 1 32 51"/>
      <path d="M32 13A10 19 0 0 0 32 51"/>
    </g>
    <circle cx="32" cy="32" r="5" fill="${fg}"/>`;

/** A solid rounded brand tile carrying the glyph. */
function makeSvg({ bg, fg, border }, { fullBleed = false } = {}) {
  const tile = fullBleed
    ? `<rect width="64" height="64" fill="${bg}"/>`
    : `<rect x="2" y="2" width="60" height="60" rx="15" fill="${bg}"/>
    <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="14.25" fill="none" stroke="${border}" stroke-width="1.5"/>`;

  return `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="IP Auskunft">
    ${tile}${glyph(fg)}
  </svg>`;
}

/** Adaptive SVG favicon that inverts with the OS colour scheme. */
function makeAdaptiveSvg() {
  return `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="IP Auskunft">
  <style>
    .tile { fill: ${DARK.bg}; }
    .bd { stroke: ${DARK.border}; }
    .ink { stroke: ${DARK.fg}; }
    .dot { fill: ${DARK.fg}; }
    @media (prefers-color-scheme: dark) {
      .tile { fill: ${LIGHT.bg}; }
      .bd { stroke: ${LIGHT.border}; }
      .ink { stroke: ${LIGHT.fg}; }
      .dot { fill: ${LIGHT.fg}; }
    }
  </style>
  <rect class="tile" x="2" y="2" width="60" height="60" rx="15"/>
  <rect class="bd" x="2.75" y="2.75" width="58.5" height="58.5" rx="14.25" fill="none" stroke-width="1.5"/>
  <g class="ink" fill="none" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="32" cy="32" r="19"/>
    <path d="M13 32H51"/>
    <path d="M32 13A10 19 0 0 1 32 51"/>
    <path d="M32 13A10 19 0 0 0 32 51"/>
  </g>
  <circle class="dot" cx="32" cy="32" r="5"/>
</svg>
`;
}

const toPng = (svg, size) =>
  sharp(Buffer.from(svg), { density: 512 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

/** Assemble a (PNG-backed) .ico container from several rendered sizes. */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = header.length + dir.length;
  const bodies = [];

  entries.forEach(({ size, buffer }, i) => {
    const e = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, e + 0); // width
    dir.writeUInt8(size >= 256 ? 0 : size, e + 1); // height
    dir.writeUInt8(0, e + 2); // palette
    dir.writeUInt8(0, e + 3); // reserved
    dir.writeUInt16LE(1, e + 4); // colour planes
    dir.writeUInt16LE(32, e + 6); // bits per pixel
    dir.writeUInt32LE(buffer.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += buffer.length;
    bodies.push(buffer);
  });

  return Buffer.concat([header, dir, ...bodies]);
}

async function main() {
  const darkSvg = makeSvg(DARK);
  const lightSvg = makeSvg(LIGHT);
  const appleSvg = makeSvg(DARK, { fullBleed: true });

  const icoSizes = [16, 32, 48];
  const icoEntries = await Promise.all(
    icoSizes.map(async (size) => ({ size, buffer: await toPng(darkSvg, size) })),
  );

  await writeFile(join(publicDir, "icon.svg"), makeAdaptiveSvg());
  await writeFile(join(publicDir, "favicon.ico"), buildIco(icoEntries));
  await writeFile(join(publicDir, "apple-icon.png"), await toPng(appleSvg, 180));
  await writeFile(join(publicDir, "icon-light-32x32.png"), await toPng(darkSvg, 32));
  await writeFile(join(publicDir, "icon-dark-32x32.png"), await toPng(lightSvg, 32));

  console.log("Generated: icon.svg, favicon.ico, apple-icon.png, icon-light-32x32.png, icon-dark-32x32.png");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
