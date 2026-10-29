import { pngOrigin } from "./png-origin.mjs";
import sharp from "sharp";
import { mkdir, readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
const svg = await readFile("public/logo.svg");
const origin =
  "Origin: original DisDown geometric vector monogram in public/logo.svg, rasterized by scripts/icons.mjs using Sharp. Discord blurple rounded square, white D and inset download arrow. No generated or stock artwork.";
const png = async (size) =>
  pngOrigin(await sharp(svg).resize(size, size).png().toBuffer(), origin);
await mkdir("build/icons", { recursive: true });
for (const size of [16, 32, 48, 64, 128, 256, 512, 1024])
  await writeFile(`build/icons/${size}x${size}.png`, await png(size));
await writeFile("public/logo.png", await png(512));
const sizes = [16, 32, 48, 64, 128, 256];
const buffers = await Promise.all(
  sizes.map((size) => sharp(svg).resize(size, size).png().toBuffer()),
);
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
for (let i = 0; i < sizes.length; i++) {
  const pos = 6 + i * 16;
  header[pos] = sizes[i] === 256 ? 0 : sizes[i];
  header[pos + 1] = header[pos];
  header.writeUInt16LE(1, pos + 4);
  header.writeUInt16LE(32, pos + 6);
  header.writeUInt32LE(buffers[i].length, pos + 8);
  header.writeUInt32LE(offset, pos + 12);
  offset += buffers[i].length;
}
await writeFile("build/icon.ico", Buffer.concat([header, ...buffers]));
if (process.platform === "darwin") {
  const dir = await mkdtemp(join(tmpdir(), "disdown-icons-"));
  const set = join(dir, "DisDown.iconset");
  await mkdir(set);
  for (const size of [16, 32, 128, 256, 512])
    for (const scale of [1, 2])
      await sharp(svg)
        .resize(size * scale, size * scale)
        .png()
        .toFile(
          join(set, `icon_${size}x${size}${scale === 2 ? "@2x" : ""}.png`),
        );
  execFileSync("iconutil", ["-c", "icns", set, "-o", "build/icon.icns"]);
  await rm(dir, { recursive: true, force: true });
}
console.log("Generated DisDown desktop icons from public/logo.svg");
