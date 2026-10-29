import type {
  Channel,
  Guild,
  GuildView,
  Message,
  Role,
  SessionInfo,
  ThreadPage,
  User,
} from "../shared/types";
import { nameOf } from "../shared/utils";
export class DiscordError extends Error {
  constructor(
    message: string,
    public status = 0,
  ) {
    super(message);
    this.name = "DiscordError";
  }
}
export interface DataClient {
  info: SessionInfo;
  guild(id: string, signal?: AbortSignal): Promise<GuildView>;
  messages(
    id: string,
    before?: string,
    signal?: AbortSignal,
  ): Promise<Message[]>;
  threads(channel: Channel, signal?: AbortSignal): Promise<ThreadPage>;
  profile(
    id: string,
    guildId?: string,
    signal?: AbortSignal,
  ): Promise<Record<string, unknown>>;
  reactionUsers(
    channelId: string,
    messageId: string,
    emoji: string,
    signal?: AbortSignal,
  ): Promise<User[]>;
  disconnect(): void;
}
export const id = (value: string) => {
  if (!/^\d{1,22}$/.test(value)) throw new Error("Invalid Discord ID.");
  return value;
};
const pause = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new Error("Cancelled"));
    const aborted = () => {
      clearTimeout(timer);
      reject(new Error("Cancelled"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", aborted);
      resolve();
    }, ms);
    signal?.addEventListener("abort", aborted, { once: true });
  });
export function canView(
  channel: Channel,
  guild: Guild,
  member: { roles: string[] },
  userId: string,
): boolean {
  if (guild.owner_id === userId || guild.owner) return true;
  const roles = guild.roles || [];
  let permissions = BigInt(
    roles.find((r) => r.id === guild.id)?.permissions || 0,
  );
  for (const role of roles)
    if (member.roles.includes(role.id)) permissions |= BigInt(role.permissions);
  if (permissions & 8n) return true;
  const overwrites = channel.permission_overwrites || [];
  const everyone = overwrites.find((o) => o.id === guild.id && o.type === 0);
  if (everyone)
    permissions =
      (permissions & ~BigInt(everyone.deny)) | BigInt(everyone.allow);
  let allow = 0n,
    deny = 0n;
  for (const o of overwrites)
    if (o.type === 0 && member.roles.includes(o.id)) {
      allow |= BigInt(o.allow);
      deny |= BigInt(o.deny);
    }
  permissions = (permissions & ~deny) | allow;
  const own = overwrites.find((o) => o.type === 1 && o.id === userId);
  if (own) permissions = (permissions & ~BigInt(own.deny)) | BigInt(own.allow);
  return (permissions & 1024n) !== 0n;
}
export class DiscordClient implements DataClient {
  info!: SessionInfo;
  private token: string;
  private tail: Promise<unknown> = Promise.resolve();
  private availableAt = 0;
  constructor(
    token: string,
    private mode: "user" | "bot",
    private fetcher: typeof fetch = fetch,
  ) {
    this.token = token.replace(/^(Bot|Bearer)\s+/i, "").trim();
    if (
      !this.token ||
      this.token.length < 10 ||
      this.token.length > 500 ||
      /\s/.test(this.token)
    )
      throw new Error("Enter a valid token without spaces.");
  }
  disconnect() {
    this.token = "";
  }
  private get<T>(path: string, signal?: AbortSignal): Promise<T> {
    const result = this.tail.then(async () => {
      for (let attempt = 0; attempt < 6; attempt++) {
        if (signal?.aborted) throw new Error("Cancelled");
        if (!this.token)
          throw new DiscordError("Your session has ended. Connect again.", 401);
        await pause(Math.max(0, this.availableAt - Date.now()), signal);
        let response: Response;
        try {
          response = await this.fetcher(`https://discord.com/api/v10${path}`, {
            method: "GET",
            headers: {
              Authorization:
                this.mode === "bot" ? `Bot ${this.token}` : this.token,
              "User-Agent": "DisDown (https://github.com/H644b/DisDown, 0.1.0)",
            },
            signal: signal
              ? AbortSignal.any([signal, AbortSignal.timeout(30000)])
              : AbortSignal.timeout(30000),
            redirect: "error",
          });
        } catch {
          if (signal?.aborted) throw new Error("Cancelled");
          if (attempt < 2) {
            await pause(1000 * 2 ** attempt, signal);
            continue;
          }
          throw new DiscordError(
            "Could not reach Discord. Check your connection and try again.",
          );
        }
        const remaining = response.headers.get("x-ratelimit-remaining");
        if (remaining === "0")
          this.availableAt =
            Date.now() +
            Math.max(
              0,
              Number(response.headers.get("x-ratelimit-reset-after") || 1),
            ) *
              1000;
        if (response.status === 429) {
          const body = await response.json().catch(() => ({}));
          const wait = Number(
            body.retry_after || response.headers.get("retry-after") || 1,
          );
          this.availableAt =
            Date.now() +
            Math.max(0.1, Math.min(Number.isFinite(wait) ? wait : 1, 3600)) *
              1000;
          continue;
        }
        if (response.status >= 500 && attempt < 3) {
          await pause(1000 * 2 ** attempt, signal);
          continue;
        }
        if (!response.ok) {
          if (response.status === 401) {
            this.disconnect();
            throw new DiscordError(
              "Discord rejected the token. Reconnect with a valid token.",
              401,
            );
          }
          if (response.status === 403)
            throw new DiscordError(
              "Discord denied access. This account may lack permission, or this endpoint may not support this token.",
              403,
            );
          if (response.status === 404)
            throw new DiscordError(
              "This content is unavailable or no longer exists.",
              404,
            );
          throw new DiscordError(
            `Discord returned HTTP ${response.status}. Try again later.`,
            response.status,
          );
        }
        return (await response.json()) as T;
      }
      throw new DiscordError(
        "Discord is rate limiting requests. Wait a few minutes and try again.",
        429,
      );
    });
    this.tail = result.catch(() => {});
    return result;
  }
  async connect(): Promise<SessionInfo> {
    const user = await this.get<User>("/users/@me");
    const guilds: Guild[] = [];
    let after = "";
    for (;;) {
      const page = await this.get<Guild[]>(
        `/users/@me/guilds?limit=200${after ? `&after=${id(after)}` : ""}`,
      );
      guilds.push(...page);
      if (page.length < 200) break;
      const next = page.at(-1)!.id;
      if (next === after) break;
      after = next;
    }
    const warnings: string[] = [];
    let dms: Channel[] = [];
    if (this.mode === "user") {
      try {
        dms = await this.get<Channel[]>("/users/@me/channels");
      } catch (e) {
        warnings.push(`DM discovery failed: ${(e as Error).message}`);
      }
    } else
      warnings.push(
        "Bot sessions only show servers and content available to the bot. Personal DMs and group chats are not available. Enable Message Content intent for full message bodies.",
      );
    this.info = { user, mode: this.mode, guilds, dms, warnings };
    return this.info;
  }
  async guild(guildId: string, signal?: AbortSignal): Promise<GuildView> {
    id(guildId);
    const warnings: string[] = [];
    const guild = await this.get<Guild>(`/guilds/${guildId}`, signal);
    const all = await this.get<Channel[]>(
      `/guilds/${guildId}/channels`,
      signal,
    );
    let member: { roles: string[] };
    try {
      member = await this.get(
        `/guilds/${guildId}/members/${id(this.info.user.id)}`,
        signal,
      );
    } catch (e) {
      if (signal?.aborted) throw e;
      warnings.push(
        "Your server roles could not be resolved. Channels are limited to those visible to @everyone.",
      );
      member = { roles: [] };
    }
    const channels = all
      .filter((c) => canView(c, guild, member, this.info.user.id))
      .map((c) => ({ ...c, guild_id: guildId }));
    let threads: Channel[] = [];
    try {
      const active = await this.get<{ threads: Channel[] }>(
        `/guilds/${guildId}/threads/active`,
        signal,
      );
      threads = active.threads
        .filter((t) => channels.some((c) => c.id === t.parent_id))
        .map((t) => ({ ...t, guild_id: guildId }));
    } catch (e) {
      if (signal?.aborted) throw e;
      warnings.push(`Active threads: ${(e as Error).message}`);
    }
    const extras: GuildView["extras"] = [
      ...(guild.roles || []).map((r: Role) => ({
        kind: "role" as const,
        id: r.id,
        label: r.name,
        data: r,
      })),
      ...(guild.emojis || []).map((e) => ({
        kind: "emoji" as const,
        id: String(e.id),
        label: String(e.name),
        data: e,
      })),
    ];
    try {
      const events = await this.get<Record<string, unknown>[]>(
        `/guilds/${guildId}/scheduled-events`,
        signal,
      );
      extras.push(
        ...events.map((e) => ({
          kind: "event" as const,
          id: String(e.id),
          label: String(e.name),
          data: e,
        })),
      );
    } catch (e) {
      if (signal?.aborted) throw e;
      warnings.push(`Scheduled events: ${(e as Error).message}`);
    }
    return { guild, channels, threads, members: [], extras, warnings };
  }
  messages(channelId: string, before?: string, signal?: AbortSignal) {
    return this.get<Message[]>(
      `/channels/${id(channelId)}/messages?limit=100${before ? `&before=${id(before)}` : ""}`,
      signal,
    );
  }
  async threads(channel: Channel, signal?: AbortSignal): Promise<ThreadPage> {
    id(channel.id);
    const threads: Channel[] = [];
    const warnings: string[] = [];
    if (channel.guild_id) {
      try {
        const active = await this.get<{ threads: Channel[] }>(
          `/guilds/${id(channel.guild_id)}/threads/active`,
          signal,
        );
        threads.push(
          ...active.threads.filter((t) => t.parent_id === channel.id),
        );
      } catch (e) {
        if (signal?.aborted) throw e;
        warnings.push(`Active threads: ${(e as Error).message}`);
      }
    }
    const routes = [
      "threads/archived/public",
      "threads/archived/private",
      "users/@me/threads/archived/private",
    ];
    for (const route of routes) {
      let before = "";
      const seen = new Set<string>();
      for (;;) {
        try {
          const result = await this.get<{
            threads: Channel[];
            has_more: boolean;
          }>(
            `/channels/${channel.id}/${route}?limit=100${before ? `&before=${encodeURIComponent(before)}` : ""}`,
            signal,
          );
          threads.push(...result.threads);
          if (!result.has_more || !result.threads.length) break;
          const last = result.threads.at(-1)!;
          const cursor = route.startsWith("users")
            ? last.id
            : last.thread_metadata?.archive_timestamp;
          if (!cursor || seen.has(cursor)) {
            warnings.push(
              `Discord did not provide a new thread cursor for ${nameOf(channel)}.`,
            );
            break;
          }
          seen.add(cursor);
          before = cursor;
        } catch (e) {
          if (signal?.aborted) throw e;
          warnings.push(
            `${nameOf(channel)} ${route.includes("public") ? "public" : "private"} archives: ${(e as Error).message}`,
          );
          break;
        }
      }
    }
    return {
      threads: [
        ...new Map(
          threads.map((t) => [t.id, { ...t, guild_id: channel.guild_id }]),
        ).values(),
      ],
      warnings,
    };
  }
  async profile(userId: string, guildId?: string, signal?: AbortSignal) {
    const user = await this.get<User>(`/users/${id(userId)}`, signal);
    let details: Record<string, unknown> = { user };
    if (this.mode === "user")
      try {
        details = {
          ...details,
          ...(await this.get<Record<string, unknown>>(
            `/users/${userId}/profile${guildId ? `?guild_id=${id(guildId)}` : ""}`,
            signal,
          )),
        };
      } catch (e) {
        if (signal?.aborted) throw e;
        details.profile_notice =
          "Extended profile unavailable; basic Discord user data is included.";
      }
    if (guildId)
      try {
        details.member = await this.get(
          `/guilds/${id(guildId)}/members/${userId}`,
          signal,
        );
      } catch (e) {
        if (signal?.aborted) throw e;
      }
    return details;
  }
  async reactionUsers(
    channelId: string,
    messageId: string,
    emoji: string,
    signal?: AbortSignal,
  ) {
    if (emoji.length > 150) throw new Error("Invalid emoji.");
    const users: User[] = [];
    let after = "";
    for (;;) {
      const page = await this.get<User[]>(
        `/channels/${id(channelId)}/messages/${id(messageId)}/reactions/${encodeURIComponent(emoji)}?limit=100${after ? `&after=${id(after)}` : ""}`,
        signal,
      );
      users.push(...page);
      if (page.length < 100) break;
      const next = page.at(-1)!.id;
      if (next === after) break;
      after = next;
    }
    return users;
  }
}
