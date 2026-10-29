// PNG tEXt metadata only; the original pixel data is preserved.
export function pngOrigin(png, origin) {
  const type = Buffer.from("tEXt");
  const payload = Buffer.from("impeccable:prompt\0" + origin, "utf8");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(payload.length);
  let checksum = 0xffffffff;
  for (const byte of Buffer.concat([type, payload])) {
    checksum ^= byte;
    for (let bit = 0; bit < 8; bit++)
      checksum = (checksum >>> 1) ^ (checksum & 1 ? 0xedb88320 : 0);
  }
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE((checksum ^ 0xffffffff) >>> 0);
  return Buffer.concat([
    png.subarray(0, -12),
    length,
    type,
    payload,
    crc,
    png.subarray(-12),
  ]);
}
