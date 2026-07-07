// Regenerates src/lib/productImageDims.ts from the real product photos.
// Reads WebP intrinsic dimensions straight from the file headers (no deps),
// so each AssetFrame can adopt its photo's exact aspect ratio.
//   node scripts/gen-image-dims.mjs
import fs from "node:fs";
import path from "node:path";

function webpSize(buf) {
  if (buf.toString("ascii", 0, 4) !== "RIFF") return null;
  const fmt = buf.toString("ascii", 12, 16);
  if (fmt === "VP8 ")
    return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  if (fmt === "VP8L") {
    const b = buf.readUInt32LE(21);
    return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
  }
  if (fmt === "VP8X") return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
  return null;
}

const dir = "public/products";
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".webp"))
  .sort();

let out =
  "// AUTO-GENERATED from public/products/*.webp — do not edit by hand.\n" +
  "// Real intrinsic pixel dimensions of each client product photo, so a frame\n" +
  "// can adopt its photo’s exact aspect ratio (fills edge-to-edge, never crops).\n" +
  "// Regenerate: node scripts/gen-image-dims.mjs\n\n" +
  "export const PRODUCT_IMAGE_DIMS: Record<string, { w: number; h: number }> = {\n";
for (const f of files) {
  const s = webpSize(fs.readFileSync(path.join(dir, f)));
  if (s) out += `  "/products/${f}": { w: ${s.w}, h: ${s.h} },\n`;
}
out +=
  "};\n\n" +
  "/** Natural aspect ratio (w/h) for a local product photo path, or null. */\n" +
  "export function productAspect(src?: string | null): number | null {\n" +
  "  if (!src) return null;\n" +
  "  const d = PRODUCT_IMAGE_DIMS[src];\n" +
  "  return d ? d.w / d.h : null;\n" +
  "}\n";

fs.writeFileSync("src/lib/productImageDims.ts", out);
console.log(`wrote src/lib/productImageDims.ts with ${files.length} entries`);
