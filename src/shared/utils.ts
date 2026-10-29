import type { Channel, Selection } from "./types";
export const nameOf = (c: Channel) =>
  c.name ||
  c.recipients?.map((u) => u.global_name || u.username).join(", ") ||
  "Conversation";
export const entityKey = (
  kind: string,
  id: string,
  channelId?: string,
  index?: number,
) => [kind, channelId, id, index].filter((x) => x !== undefined).join(":");
export const channelSelection = (c: Channel): Selection => ({
  key: entityKey(
    c.type === 4
      ? "category"
      : c.type === 10 || c.type === 11 || c.type === 12
        ? "thread"
        : "channel",
    c.id,
  ),
  kind:
    c.type === 4
      ? "category"
      : c.type === 10 || c.type === 11 || c.type === 12
        ? "thread"
        : "channel",
  id: c.id,
  label: nameOf(c),
  channelId: c.id,
  guildId: c.guild_id,
  data: c,
});
export function safeImage(url: unknown): string | undefined {
  if (typeof url !== "string") return;
  try {
    const u = new URL(url);
    if (
      u.protocol === "https:" &&
      ["cdn.discordapp.com", "media.discordapp.net"].includes(u.hostname)
    )
      return u.href;
  } catch {}
}
export const avatarUrl = (u: { id: string; avatar?: string | null }) =>
  u.avatar
    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=128`
    : undefined;
export const prettyBytes = (n: number) =>
  n < 1024
    ? `${n} B`
    : n < 1048576
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1048576).toFixed(1)} MB`;
export const extension = (options: { format: string; packaging: string }) =>
  options.packaging === "zip" ? "zip" : options.format;
export const isTextChannel = (c: Channel) =>
  [0, 1, 2, 3, 5, 10, 11, 12, 13].includes(c.type);
