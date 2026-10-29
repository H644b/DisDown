import type { DiscordAppearance } from "../shared/types";
// Read only appearance (field13). The rest of the settings protobuf is discarded.
// Field source: discord-userdoccers/discord-protos, discord_users/v1/PreloadedUserSettings.proto.
type Field = {
  number: number;
  wire: number;
  value: bigint | Uint8Array | number;
};
function fields(bytes: Uint8Array): Field[] {
  const values: Field[] = [];
  let position = 0;
  const varint = () => {
    let value = 0n;
    for (let shift = 0n; shift < 70n; shift += 7n) {
      if (position >= bytes.length)
        throw new Error("Incomplete appearance settings.");
      const byte = bytes[position++];
      value |= BigInt(byte & 127) << shift;
      if (!(byte & 128)) return value;
    }
    throw new Error("Invalid appearance settings.");
  };
  while (position < bytes.length) {
    const tag = Number(varint()),
      wire = tag & 7,
      number = tag >>> 3;
    if (!number) throw new Error("Invalid settings field.");
    if (wire === 0) values.push({ number, wire, value: varint() });
    else if (wire === 2) {
      const size = Number(varint());
      if (size < 0 || position + size > bytes.length)
        throw new Error("Invalid settings length.");
      values.push({
        number,
        wire,
        value: bytes.subarray(position, position + size),
      });
      position += size;
    } else if (wire === 5) {
      if (position + 4 > bytes.length)
        throw new Error("Incomplete settings number.");
      const value = new DataView(
        bytes.buffer,
        bytes.byteOffset + position,
        4,
      ).getFloat32(0, true);
      values.push({ number, wire, value });
      position += 4;
    } else if (wire === 1) {
      if (position + 8 > bytes.length)
        throw new Error("Incomplete settings value.");
      position += 8;
    } else throw new Error("Unsupported settings field.");
  }
  return values;
}
const nested = (values: Field[], number: number) => {
  const value = values.find((v) => v.number === number && v.wire === 2)?.value;
  return value instanceof Uint8Array ? fields(value) : [];
};
const integer = (values: Field[], number: number) => {
  const value = values.find((v) => v.number === number && v.wire === 0)?.value;
  return typeof value === "bigint"
    ? Number(BigInt.asIntN(32, value))
    : undefined;
};
export function decodeAppearance(encoded: string): DiscordAppearance {
  if (
    typeof encoded !== "string" ||
    encoded.length > 4 * 1024 * 1024 ||
    !/^[A-Za-z0-9+/=]*$/.test(encoded)
  )
    throw new Error("Invalid appearance payload.");
  const appearance = nested(fields(Buffer.from(encoded, "base64")), 13);
  const mode = integer(appearance, 1) ?? 0;
  const result: DiscordAppearance = {
    source: "discord",
    base:
      (
        {
          0: "system",
          1: "dark",
          2: "light",
          3: "darker",
          4: "midnight",
        } as const
      )[mode as 0 | 1 | 2 | 3 | 4] || "dark",
    darkSidebar: integer(appearance, 15) === 1,
  };
  const theme = nested(appearance, 3);
  result.presetId = integer(nested(theme, 2), 1);
  const custom = nested(theme, 4);
  const colors = custom
    .filter((f) => f.number === 1 && f.value instanceof Uint8Array)
    .map((f) => new TextDecoder().decode(f.value as Uint8Array))
    .filter((c) => /^#?[0-9a-f]{6}$/i.test(c))
    .slice(0, 5)
    .map((c) => "#" + c.replace(/^#/, ""));
  if (colors.length) {
    const stops: number[] = [];
    for (const field of custom.filter((f) => f.number === 2)) {
      if (typeof field.value === "number") stops.push(field.value);
      else if (field.value instanceof Uint8Array) {
        const view = new DataView(
          field.value.buffer,
          field.value.byteOffset,
          field.value.byteLength,
        );
        for (let offset = 0; offset + 4 <= view.byteLength; offset += 4)
          stops.push(view.getFloat32(offset, true));
      }
    }
    result.custom = {
      colors,
      stops:
        stops.length === colors.length &&
        stops.every((v) => Number.isFinite(v) && v >= 0 && v <= 1)
          ? stops
          : undefined,
      angle: integer(custom, 3) ?? 0,
      intensity: Math.max(0, Math.min(100, integer(custom, 4) ?? 0)),
    };
  }
  return result;
}
