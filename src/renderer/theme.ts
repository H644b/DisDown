import facts from "../shared/discord-theme-facts.json" with { type: "json" };
import type { DiscordAppearance } from "../shared/types";
type Palette = typeof facts.bases.dark;
type Preset = {
  name: string;
  base: string;
  colors: string[];
  stops: number[];
  angle: number;
};
const presets = facts.presets as Record<string, Preset>;
const rgb = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
function hsl(hex: string) {
  const [r, g, b] = rgb(hex);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    delta = max - min,
    l = (max + min) / 2;
  if (!delta) return [0, 0, l];
  const hue =
    (max === r
      ? (g - b) / delta + (g < b ? 6 : 0)
      : max === g
        ? (b - r) / delta + 2
        : (r - g) / delta + 4) * 60;
  return [hue, delta / (1 - Math.abs(2 * l - 1)), l];
}
const luminance = (hex: string) =>
  rgb(hex)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((n, v, i) => n + v * [0.2126, 0.7152, 0.0722][i], 0);
export function appearanceLabel(appearance?: DiscordAppearance) {
  if (appearance?.custom) return "Custom Discord theme";
  if (appearance?.presetId !== undefined && presets[appearance.presetId])
    return presets[appearance.presetId].name;
  const base = appearance?.base || "dark";
  return base === "system" ? "System" : base[0].toUpperCase() + base.slice(1);
}
export function themeVariables(
  appearance?: DiscordAppearance,
  systemDark = true,
): Record<string, string> {
  const preset =
    appearance?.presetId === undefined
      ? undefined
      : presets[appearance.presetId];
  let base = appearance?.base || "dark";
  if (base === "system") base = systemDark ? "dark" : "light";
  if (preset && !appearance?.custom) base = preset.base as typeof base;
  const light = base === "light";
  const palette: Palette =
    facts.bases[base as keyof typeof facts.bases] || facts.bases.dark;
  const settings = appearance?.custom || preset;
  const colors = settings?.colors || [];
  let tint = "transparent",
    textTint = "transparent",
    amount = 0,
    gradient = "none";
  if (colors.length) {
    const byLight = [...colors].sort((a, b) => luminance(a) - luminance(b));
    const dark = byLight[0],
      bright = byLight.at(-1)!;
    const hue = hsl(light ? bright : dark)[0];
    const textHue = hsl(light ? dark : bright)[0];
    tint = `hsl(${hue} 100% ${light ? 90 : 5}%)`;
    textTint = `hsl(${textHue} 100% ${light ? (textHue >= 200 && textHue <= 300 ? 25 : 15) : textHue >= 200 && textHue <= 300 ? 80 : 95}%)`;
    amount = appearance?.custom
      ? light
        ? 30 - 0.2 * appearance.custom.intensity
        : 60 + 0.4 * (100 - appearance.custom.intensity)
      : 50;
    const stops = settings?.stops;
    const parts = colors.map(
      (color, i) =>
        `${color}${stops?.length === colors.length ? " " + Math.round(stops[i] * 10000) / 100 + "%" : ""}`,
    );
    if (parts.length === 1) parts.push(parts[0]);
    gradient = `linear-gradient(${settings?.angle ?? 180}deg, ${parts.join(", ")})`;
  }
  const tintBase = (value: string) =>
    amount ? `color-mix(in oklab, ${value} 100%, ${tint} ${amount}%)` : value;
  const tintText = (value: string) =>
    amount ? `color-mix(in oklab, ${value} 100%, ${textTint} 30%)` : value;
  const overlay = (
    value: string,
    role: "chat" | "sidebar" | "rail" | "frame",
  ) => {
    if (gradient === "none") return value;
    const defaults = facts.overlays[light ? "light" : "dark"];
    let opacity = defaults[role];
    if (appearance?.custom) {
      const factor = (30 + 0.7 * (100 - appearance.custom.intensity)) / 100;
      opacity = light
        ? {
            chat: 0.95 * (0.6 + 0.4 * factor),
            sidebar: 0.48 + 0.32 * factor,
            rail: 0.51 + 0.34 * factor,
            frame: 0.325 + 0.325 * factor,
          }[role]
        : {
            chat: 0.48 + 0.32 * factor,
            sidebar: 0.51 + 0.34 * factor,
            rail: 0.54 + 0.36 * factor,
            frame: 0.42 + 0.28 * factor,
          }[role];
    }
    return `rgb(${light ? "255 255 255" : "0 0 0"} / ${Math.max(0, Math.min(1, opacity))})`;
  };
  const darkSidebar = light && appearance?.darkSidebar;
  const main = tintBase(palette.main),
    surface = tintBase(palette.surface);
  const variables: Record<string, string> = {
    "--main": overlay(main, "chat"),
    "--sidebar": darkSidebar
      ? facts.bases.darker.sidebar
      : overlay(tintBase(palette.sidebar), "sidebar"),
    "--panel": overlay(tintBase(palette.sidebar), "sidebar"),
    "--rail": darkSidebar
      ? facts.bases.darker.rail
      : overlay(tintBase(palette.rail), "rail"),
    "--titlebar": overlay(tintBase(palette.rail), "frame"),
    "--input": tintBase(light ? "#eeeeef" : palette.rail),
    "--surface": surface,
    "--raised": tintBase(palette.raised),
    "--text": tintText(palette.text),
    "--heading": tintText(palette.heading),
    "--muted": tintText(light ? "#5d5e66" : palette.muted),
    "--control-border": tintText(
      appearance?.custom
        ? light
          ? "#464651"
          : "#d0d1d8"
        : light
          ? "#767680"
          : "#9da0aa",
    ),
    "--border": light
      ? "#d7d7dc"
      : `color-mix(in srgb, ${tintText(palette.text)} 15%, ${main})`,
    "--hover": `color-mix(in srgb, ${tintText(palette.text)} ${light ? 6 : 7}%, ${main})`,
    "--selected": `color-mix(in srgb, ${tintText(palette.text)} ${light ? 12 : 13}%, ${main})`,
    "--selection-bg": light
      ? "#e5e9ff"
      : `color-mix(in srgb, #5865f2 20%, ${main})`,
    "--link": light ? "#3457c7" : "#a6b9ff",
    "--focus": light ? "#5865f2" : "#9faeff",
    "--accent": "#5865f2",
    "--accent-hover": "#4752c4",
    "--notice-bg": light ? "#fff2d9" : "#343025",
    "--notice-text": light ? "#705214" : "#f1ce8a",
    "--error-bg": light ? "#fce5e5" : "#41292c",
    "--error-text": light ? "#9f292d" : "#ffb9b6",
    "--success": light ? "#247644" : "#7dd3a6",
    "--success-bg": light ? "#e4f1e8" : "#17352a",
    "--app-background": gradient,
    "--base-theme": base,
  };
  return variables;
}
export function applyAppearance(appearance?: DiscordAppearance) {
  const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const vars = themeVariables(appearance, dark);
  for (const [key, value] of Object.entries(vars))
    document.documentElement.style.setProperty(key, value);
  document.documentElement.style.colorScheme =
    vars["--base-theme"] === "light" ? "light" : "dark";
  document.documentElement.dataset.baseTheme = vars["--base-theme"];
  document.documentElement.dataset.darkSidebar = String(
    !!appearance?.darkSidebar,
  );
}
