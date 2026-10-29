import { describe, it, expect, vi } from "vitest";
import { canView, DiscordClient, id } from "../src/main/discord";
import type { Channel, Guild } from "../src/shared/types";
const token = "test-token-owned-only";
function transport(
  handler: (path: string, init: RequestInit) => Response | Promise<Response>,
) {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit) =>
    handler(String(input).replace("https://discord.com/api/v10", ""), init!),
  ) as unknown as typeof fetch;
}
const json = (data: unknown, status = 200, headers?: Record<string, string>) =>
  new Response(JSON.stringify(data), { status, headers });
const base = (p: string) =>
  p === "/users/@me"
    ? { id: "1", username: "Test" }
    : p.startsWith("/users/@me/guilds")
      ? []
      : p === "/users/@me/channels"
        ? []
        : undefined;
describe("permission evaluation", () => {
  const guild: Guild = {
    id: "10",
    name: "Private server",
    roles: [
      { id: "10", name: "@everyone", permissions: "1024" },
      { id: "20", name: "Reader", permissions: "1024" },
      { id: "30", name: "Admin", permissions: "8" },
    ],
  };
  const channel: Channel = {
    id: "40",
    type: 0,
    permission_overwrites: [{ id: "10", type: 0, allow: "0", deny: "1024" }],
  };
  it("applies everyone, role and user overrides in the documented order", () => {
    expect(canView(channel, guild, { roles: [] }, "1")).toBe(false);
    expect(
      canView(
        {
          ...channel,
          permission_overwrites: [
            ...channel.permission_overwrites!,
            { id: "20", type: 0, allow: "1024", deny: "0" },
          ],
        },
        guild,
        { roles: ["20"] },
        "1",
      ),
    ).toBe(true);
    expect(
      canView(
        {
          ...channel,
          permission_overwrites: [
            ...channel.permission_overwrites!,
            { id: "20", type: 0, allow: "1024", deny: "0" },
            { id: "1", type: 1, allow: "0", deny: "1024" },
          ],
        },
        guild,
        { roles: ["20"] },
        "1",
      ),
    ).toBe(false);
  });
  it("honors owner and administrator without coercing snowflakes", () => {
    expect(
      canView(channel, { ...guild, owner_id: "1" }, { roles: [] }, "1"),
    ).toBe(true);
    expect(canView(channel, guild, { roles: ["30"] }, "1")).toBe(true);
  });
});
describe("Discord read-only API", () => {
  it("requires a plausible explicitly supplied token and safe IDs", () => {
    expect(() => new DiscordClient("", "user")).toThrow();
    expect(() => new DiscordClient("with whitespace token", "bot")).toThrow();
    expect(() => id("../@me")).toThrow();
    expect(id("1234567890123456789")).toBe("1234567890123456789");
  });
  it("connects, paginates guilds and keeps tokens out of returned session data", async () => {
    const mock = transport((p, init) => {
      expect(init.method).toBe("GET");
      expect((init.headers as Record<string, string>).Authorization).toBe(
        token,
      );
      if (p.startsWith("/users/@me/guilds"))
        return json(
          p.includes("&after=")
            ? [{ id: "201", name: "Last" }]
            : Array.from({ length: 200 }, (_, i) => ({
                id: String(i + 1),
                name: "Server",
              })),
        );
      return json(base(p));
    });
    const client = new DiscordClient(token, "user", mock);
    const info = await client.connect();
    expect(info.guilds).toHaveLength(201);
    expect(JSON.stringify(info)).not.toContain(token);
    client.disconnect();
    await expect(client.messages("1")).rejects.toThrow("session has ended");
  });
  it("supports bot auth and explains DM restrictions", async () => {
    const mock = transport((p, init) => {
      expect((init.headers as Record<string, string>).Authorization).toBe(
        `Bot ${token}`,
      );
      expect(p).not.toBe("/users/@me/channels");
      return json(base(p));
    });
    const c = new DiscordClient(`Bot ${token}`, "bot", mock);
    expect((await c.connect()).warnings[0]).toContain("Personal DMs");
  });
  it("reports unavailable DM discovery without failing server access", async () => {
    const c = new DiscordClient(
      token,
      "user",
      transport((p) =>
        p === "/users/@me/channels" ? json({}, 403) : json(base(p)),
      ),
    );
    expect((await c.connect()).warnings[0]).toContain("DM discovery failed");
  });
  it("retries rate limits and temporary server failures", async () => {
    let attempts = 0;
    const c = new DiscordClient(
      token,
      "user",
      transport((p) =>
        p === "/users/@me" && attempts++ === 0
          ? json({ retry_after: 0.001 }, 429)
          : json(base(p)),
      ),
    );
    await expect(c.connect()).resolves.toHaveProperty("user.username", "Test");
    expect(attempts).toBe(2);
  });
  it("redacts unauthorized response details and clears the token on 401", async () => {
    const c = new DiscordClient(
      token,
      "user",
      transport(() => json({ message: token }, 401)),
    );
    await expect(c.connect()).rejects.toThrow("rejected the token");
    await expect(c.connect()).rejects.not.toThrow(token);
  });
  it("filters inaccessible channels, loads metadata, profiles and history cursors", async () => {
    const mock = transport((p) => {
      const b = base(p);
      if (b) return json(b);
      if (p === "/guilds/10")
        return json({
          id: "10",
          name: "Guild",
          roles: [{ id: "10", name: "@everyone", permissions: "1024" }],
          emojis: [{ id: "7", name: "wave" }],
        });
      if (p === "/guilds/10/channels")
        return json([
          { id: "40", type: 0, name: "open" },
          {
            id: "41",
            type: 0,
            name: "hidden",
            permission_overwrites: [
              { id: "10", type: 0, allow: "0", deny: "1024" },
            ],
          },
        ]);
      if (p === "/guilds/10/members/1") return json({ roles: [] });
      if (p === "/guilds/10/threads/active")
        return json({
          threads: [
            { id: "50", parent_id: "40", type: 11 },
            { id: "51", parent_id: "41", type: 11 },
          ],
        });
      if (p === "/guilds/10/scheduled-events")
        return json([{ id: "70", name: "Event" }]);
      if (p === "/users/2") return json({ id: "2", username: "Reader" });
      if (p.startsWith("/users/2/profile")) return json({ bio: "A biography" });
      if (p === "/guilds/10/members/2") return json({ roles: [] });
      if (p === "/channels/40/messages?limit=100&before=123") return json([]);
      throw new Error(p);
    });
    const c = new DiscordClient(token, "user", mock);
    await c.connect();
    const v = await c.guild("10");
    expect(v.channels.map((x) => x.id)).toEqual(["40"]);
    expect(v.threads.map((x) => x.id)).toEqual(["50"]);
    expect(v.extras.map((x) => x.kind)).toEqual(["role", "emoji", "event"]);
    expect(await c.profile("2", "10")).toHaveProperty("bio", "A biography");
    await c.messages("40", "123");
  });
  it("paginates and deduplicates public and joined archived threads", async () => {
    const paths: string[] = [];
    const c = new DiscordClient(
      token,
      "user",
      transport((p) => {
        paths.push(p);
        const b = base(p);
        if (b) return json(b);
        if (p.includes("threads/active"))
          return json({ threads: [{ id: "50", parent_id: "40", type: 11 }] });
        if (p.includes("archived/public"))
          return json(
            p.includes("&before=")
              ? { threads: [{ id: "52", type: 11 }], has_more: false }
              : {
                  threads: [
                    {
                      id: "51",
                      type: 11,
                      thread_metadata: {
                        archive_timestamp: "2026-10-01T00:00:00Z",
                      },
                    },
                  ],
                  has_more: true,
                },
          );
        if (p.includes("users/@me/threads"))
          return json({ threads: [{ id: "51", type: 12 }], has_more: false });
        return json({}, 403);
      }),
    );
    await c.connect();
    const result = await c.threads({ id: "40", guild_id: "10", type: 0 });
    expect(result.threads.map((t) => t.id)).toEqual(["50", "51", "52"]);
    expect(result.warnings.length).toBe(1);
    expect(
      paths.some((p) => p.includes("before=2026-10-01T00%3A00%3A00Z")),
    ).toBe(true);
  });
  it("paginates reaction users and encodes emoji once", async () => {
    const paths: string[] = [];
    const c = new DiscordClient(
      token,
      "user",
      transport((p) => {
        paths.push(p);
        const b = base(p);
        if (b) return json(b);
        return json(
          p.includes("&after=")
            ? [{ id: "101", username: "Last" }]
            : Array.from({ length: 100 }, (_, i) => ({
                id: String(i + 1),
                username: "User",
              })),
        );
      }),
    );
    await c.connect();
    expect(await c.reactionUsers("40", "50", "wave:12")).toHaveLength(101);
    expect(paths.at(-1)).toContain("wave%3A12?limit=100&after=100");
  });
  it("supports cancellation before a request is made", async () => {
    const c = new DiscordClient(
      token,
      "user",
      transport((p) => json(base(p))),
    );
    await c.connect();
    const ac = new AbortController();
    ac.abort();
    await expect(c.messages("1", undefined, ac.signal)).rejects.toThrow(
      "Cancelled",
    );
  });
});
