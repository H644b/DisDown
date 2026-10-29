import { describe, it, expect } from "vitest";
import { decodeAppearance } from "../src/main/appearance";
import { appearanceLabel, themeVariables } from "../src/renderer/theme";
const v = (n: number) => {
  let value = BigInt(n);
  const out: number[] = [];
  do {
    let byte = Number(value & 127n);
    value >>= 7n;
    if (value) byte |= 128;
    out.push(byte);
  } while (value);
  return out;
};
const integer = (field: number, value: number) =>
  Buffer.from([...v(field * 8), ...v(value)]);
const bytes = (field: number, data: Uint8Array) =>
  Buffer.concat([
    Buffer.from([...v(field * 8 + 2), ...v(data.length)]),
    Buffer.from(data),
  ]);
const encoded = (appearance: Uint8Array) =>
  bytes(13, appearance).toString("base64");
describe("Discord appearance decoding", () => {
  it.each([
    [1, "dark"],
    [2, "light"],
    [3, "darker"],
    [4, "midnight"],
    [0, "system"],
  ])("decodes base theme %s", (value, expected) => {
    expect(decodeAppearance(encoded(integer(1, Number(value)))).base).toBe(
      expected,
    );
  });
  it("decodes the account Nitro preset without retaining unrelated settings", () => {
    const payload = Buffer.concat([
      bytes(8, Buffer.from("private-not-relevant")),
      bytes(
        13,
        Buffer.concat([integer(1, 3), bytes(3, bytes(2, integer(1, 22)))]),
      ),
    ]);
    const theme = decodeAppearance(payload.toString("base64"));
    expect(theme.presetId).toBe(22);
    expect(theme.base).toBe("darker");
    expect(JSON.stringify(theme)).not.toContain("private-not-relevant");
    expect(appearanceLabel(theme)).toBe("Blurple Twilight");
  });
  it("retains custom colors, packed stops, zero angle and intensity", () => {
    const floats = Buffer.alloc(8);
    floats.writeFloatLE(0, 0);
    floats.writeFloatLE(1, 4);
    const custom = Buffer.concat([
      bytes(1, Buffer.from("#000011")),
      bytes(1, Buffer.from("455566")),
      bytes(2, floats),
    ]);
    const theme = decodeAppearance(
      encoded(
        Buffer.concat([
          integer(1, 4),
          integer(15, 1),
          bytes(3, bytes(4, custom)),
        ]),
      ),
    );
    expect(theme.darkSidebar).toBe(true);
    expect(theme.custom).toEqual({
      colors: ["#000011", "#455566"],
      stops: [0, 1],
      angle: 0,
      intensity: 0,
    });
  });
  it("rejects malformed protobufs and unsafe CSS colors", () => {
    expect(() => decodeAppearance("not!base64")).toThrow();
    expect(() =>
      decodeAppearance(Buffer.from([106, 100, 8]).toString("base64")),
    ).toThrow();
    const custom = bytes(1, Buffer.from("url(https://example.com/track)"));
    expect(
      decodeAppearance(encoded(bytes(3, bytes(4, custom)))).custom,
    ).toBeUndefined();
  });
});
describe("account theme application", () => {
  it("uses the exact observed Blurple Twilight colors and angle", () => {
    const variables = themeVariables({
      source: "discord",
      base: "darker",
      presetId: 22,
    });
    expect(variables["--app-background"]).toContain("47.61deg");
    expect(variables["--app-background"]).toContain("#2c3fe7");
    expect(variables["--app-background"]).toContain("#261d83");
    expect(variables["--base-theme"]).toBe("darker");
  });
  it("keeps light surfaces, readable text, and the optional dark sidebar", () => {
    const light = themeVariables({ source: "discord", base: "light" });
    expect(light["--text"]).toBe("#2e2e34");
    expect(light["--main"]).toBe("#fbfbfb");
    expect(
      themeVariables({ source: "discord", base: "light", darkSidebar: true })[
        "--sidebar"
      ],
    ).toBe("#1a1a1e");
  });
  it("follows system mode and applies custom gradient data", () => {
    expect(
      themeVariables({ source: "discord", base: "system" }, false)[
        "--base-theme"
      ],
    ).toBe("light");
    const variables = themeVariables({
      source: "discord",
      base: "midnight",
      custom: { colors: ["#002244", "#663399"], angle: 120, intensity: 75 },
    });
    expect(variables["--app-background"]).toBe(
      "linear-gradient(120deg, #002244, #663399)",
    );
    expect(variables["--main"]).not.toBe("#000000");
  });
});
