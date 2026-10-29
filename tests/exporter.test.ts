import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
  realpath,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { unzipSync, strFromU8 } from "fflate";
import {
  collect,
  exportArchive,
  serialize,
  validateRequest,
} from "../src/main/exporter";
import { DemoClient, demoMessages } from "../src/shared/demo";
import {
  defaultOptions,
  type ExportRequest,
  type Message,
  type Selection,
} from "../src/shared/types";
import { channelSelection } from "../src/shared/utils";
import {
  browse,
  createDirectory,
  validName,
  exists,
} from "../src/main/filesystem";
let folder: string;
const ac = () => new AbortController();
const noop = () => {};
const msgSelection = (m = demoMessages[0]): Selection => ({
  key: "message:" + m.id,
  kind: "message",
  id: m.id,
  label: "Test message",
  data: m,
  channelId: m.channel_id,
});
const options = () => ({ ...defaultOptions });
beforeEach(async () => {
  folder = await mkdtemp(path.join(tmpdir(), "disdown-test-"));
});
afterEach(async () => {
  await rm(folder, { recursive: true, force: true });
});
function request(overrides: Partial<ExportRequest> = {}): ExportRequest {
  return {
    selections: [msgSelection()],
    options: { ...options(), format: "json", packaging: "file" },
    directory: folder,
    filename: "archive.json",
    overwrite: false,
    ...overrides,
  };
}
describe("selection expansion and export scope", () => {
  it("does not widen an individual message, reaction, profile or attachment selection", async () => {
    const client = new DemoClient();
    const reaction: Selection = {
      key: "reaction:1",
      kind: "reaction",
      id: "1",
      label: "Heart",
      channelId: "30004",
      messageId: "50001",
      data: demoMessages[0].reactions![0],
    };
    const attachment: Selection = {
      key: "attachment:1",
      kind: "attachment",
      id: "60001",
      label: "Attachment",
      data: demoMessages[2].attachments[0],
    };
    const user: Selection = {
      key: "user:1",
      kind: "user",
      id: "10002",
      label: "Jules",
    };
    const result = await collect(
      client,
      [msgSelection(), reaction, attachment, user],
      options(),
      ac().signal,
      noop,
    );
    expect(result.messages).toHaveLength(1);
    expect(result.channels).toHaveLength(0);
    expect(result.items.map((i) => i.kind)).toEqual([
      "reaction",
      "attachment",
      "user",
    ]);
    expect((result.items[0].data as any).users.length).toBe(3);
    expect(result.users.some((u) => u.id === "10002")).toBe(true);
  });
  it("expands servers and categories, includes active and archived threads, deduplicates overlapping selections", async () => {
    const c = new DemoClient();
    const v = await c.guild("20001");
    const all = await collect(
      c,
      [
        { key: "guild:20001", kind: "guild", id: "20001", label: "Server" },
        channelSelection(v.channels.find((c) => c.id === "30004")!),
      ],
      options(),
      ac().signal,
      noop,
    );
    expect(all.guilds).toHaveLength(1);
    expect(all.channels.some((c) => c.id === "30009")).toBe(true);
    expect(new Set(all.messages.map((m) => m.id)).size).toBe(
      all.messages.length,
    );
    const category = await collect(
      c,
      [channelSelection(v.channels.find((c) => c.id === "30000")!)],
      { ...options(), threads: false },
      ac().signal,
      noop,
    );
    expect(category.channels.map((c) => c.id)).toEqual([
      "30000",
      "30001",
      "30002",
    ]);
  });
  it("applies UTC dates, phrase and author filters to full history", async () => {
    const c = new DemoClient();
    const v = await c.guild("20001");
    const selected = channelSelection(
      v.channels.find((c) => c.id === "30004")!,
    );
    const result = await collect(
      c,
      [selected],
      {
        ...options(),
        threads: false,
        after: "2026-10-28",
        before: "2026-10-28",
        contains: "moodboard",
        authors: "10003",
      },
      ac().signal,
      noop,
    );
    expect(result.messages.map((m) => m.id)).toEqual(["50003"]);
    const empty = await collect(
      c,
      [selected],
      { ...options(), threads: false, before: "2026-10-27" },
      ac().signal,
      noop,
    );
    expect(empty.messages).toHaveLength(0);
  });
  it("enforces per-channel matching limits and records truncation", async () => {
    const c = new DemoClient();
    const v = await c.guild("20001");
    const result = await collect(
      c,
      [channelSelection(v.channels.find((c) => c.id === "30004")!)],
      { ...options(), threads: false, maxMessages: 2 },
      ac().signal,
      noop,
    );
    expect(result.messages).toHaveLength(2);
    expect(result.truncated).toBe(true);
  });
  it("paginates history beyond 100 and sorts chronologically", async () => {
    const c = new DemoClient();
    c.messages = async (_id: string, before?: string) =>
      before
        ? [{ ...demoMessages[0], id: "99" }]
        : Array.from({ length: 100 }, (_, i) => ({
            ...demoMessages[0],
            id: String(100 + i),
          }));
    const a = await collect(
      c,
      [channelSelection({ id: "30004", type: 0, name: "General" })],
      { ...options(), threads: false, profiles: false },
      ac().signal,
      noop,
    );
    expect(a.messages).toHaveLength(101);
  });
  it("reports permission failures without fabricating content", async () => {
    const c = new DemoClient();
    c.messages = async () => {
      throw new Error("Access denied");
    };
    const a = await collect(
      c,
      [channelSelection({ id: "30004", type: 0, name: "Private" })],
      options(),
      ac().signal,
      noop,
    );
    expect(a.messages).toHaveLength(0);
    expect(a.warnings.join(" ")).toContain("Access denied");
  });
  it("strips secrets, omits optional metadata and warns about partial pseudonymization", async () => {
    const m = {
      ...demoMessages[0],
      author: {
        ...demoMessages[0].author,
        email: "private@example.com",
        token: "SECRET",
      },
    };
    const a = await collect(
      new DemoClient(),
      [msgSelection(m)],
      { ...options(), profiles: false, reactions: false, redact: true },
      ac().signal,
      noop,
    );
    expect(a.messages[0].author.username).toBe("Person 1");
    expect(a.messages[0].reactions).toBeUndefined();
    expect(a.users).toHaveLength(0);
    expect(JSON.stringify(a)).not.toContain("SECRET");
    expect(JSON.stringify(a)).not.toContain("private@example.com");
    expect(a.warnings.join(" ")).toContain("Message text");
  });
  it("exports every leaf entity without needing its enclosing conversation", async () => {
    for (const kind of [
      "embed",
      "sticker",
      "poll",
      "component",
      "role",
      "emoji",
      "event",
      "field",
    ] as const) {
      const a = await collect(
        new DemoClient(),
        [{ key: kind, kind, id: "1", label: kind, data: { value: kind } }],
        options(),
        ac().signal,
        noop,
      );
      expect(a.messages).toHaveLength(0);
      expect(a.items[0].kind).toBe(kind);
    }
  });
});
describe("archive formats, files and cancellation", () => {
  it.each(["html", "json", "csv", "md", "txt"] as const)(
    "writes a real %s file with selected content",
    async (format) => {
      const r = request({
        options: { ...options(), format, packaging: "file" },
        filename: `archive.${format}`,
      });
      const result = await exportArchive(
        new DemoClient(),
        r,
        ac().signal,
        noop,
      );
      const content = await readFile(result.path, "utf8");
      expect(result.bytes).toBeGreaterThan(0);
      expect(content).toContain(format === "json" ? "50001" : "little things");
      expect((await readdir(folder)).some((n) => n.endsWith(".part"))).toBe(
        false,
      );
    },
  );
  it("creates a ZIP with manifest, structured data and downloaded sample media", async () => {
    const r = request({
      selections: [msgSelection(demoMessages[2])],
      options: { ...options(), media: true },
      filename: "bundle.zip",
    });
    const result = await exportArchive(new DemoClient(), r, ac().signal, noop);
    const zip = unzipSync(await readFile(result.path));
    expect(Object.keys(zip)).toContain("archive.html");
    expect(Object.keys(zip)).toContain("data.json");
    expect(Object.keys(zip)).toContain("manifest.json");
    expect(Object.keys(zip)).toContain("media/60001-weekend-moodboard.txt");
    expect(strFromU8(zip["archive.html"])).toContain(
      "media/60001-weekend-moodboard.txt",
    );
    expect(JSON.parse(strFromU8(zip["manifest.json"])).messages).toBe(1);
  });
  it("never overwrites unless explicitly requested", async () => {
    await writeFile(path.join(folder, "archive.json"), "original");
    await expect(
      exportArchive(new DemoClient(), request(), ac().signal, noop),
    ).rejects.toThrow("already exists");
    expect(await readFile(path.join(folder, "archive.json"), "utf8")).toBe(
      "original",
    );
    await exportArchive(
      new DemoClient(),
      request({ overwrite: true }),
      ac().signal,
      noop,
    );
    expect(
      JSON.parse(await readFile(path.join(folder, "archive.json"), "utf8")).app,
    ).toBe("DisDown");
  });
  it("removes partial files after cancellation", async () => {
    const control = ac();
    const r = request();
    await expect(
      exportArchive(new DemoClient(), r, control.signal, (p) => {
        if (p.phase === "writing") control.abort();
      }),
    ).rejects.toThrow("Cancelled");
    expect(await readdir(folder)).toEqual([]);
  });
  it("blocks remote attachment hosts and never forwards account credentials", async () => {
    const c = new DemoClient();
    c.info.mode = "user";
    const m = {
      ...demoMessages[2],
      attachments: [
        { ...demoMessages[2].attachments[0], url: "http://127.0.0.1/secrets" },
      ],
    };
    let fetched = false;
    const result = await exportArchive(
      c,
      request({
        selections: [msgSelection(m)],
        options: { ...options(), media: true },
        filename: "safe.zip",
      }),
      ac().signal,
      noop,
      async () => {
        fetched = true;
        return new Response("secret");
      },
    );
    expect(fetched).toBe(false);
    expect(result.warnings.join(" ")).toContain("Only Discord-hosted");
  });
  it("escapes HTML and neutralizes spreadsheet formula injection", async () => {
    const m = {
      ...demoMessages[0],
      content: '=HYPERLINK("evil") <script>alert(1)</script>',
    };
    const a = await collect(
      new DemoClient(),
      [msgSelection(m)],
      options(),
      ac().signal,
      noop,
    );
    const output = serialize(a, "html");
    expect(output).not.toContain("<script>");
    expect(output).toContain("&lt;script&gt;");
    expect(serialize(a, "csv")).toContain("\"'=HYPERLINK");
  });
  it("rejects invalid formats, media packages, dates, limits and selection size", () => {
    expect(() =>
      validateRequest(
        request({ options: { ...options(), media: true, packaging: "file" } }),
      ),
    ).toThrow();
    expect(() =>
      validateRequest(
        request({
          options: { ...options(), after: "2026-10-29", before: "2026-10-28" },
        }),
      ),
    ).toThrow();
    expect(() =>
      validateRequest(request({ options: { ...options(), maxMessages: -1 } })),
    ).toThrow();
    expect(() => validateRequest(request({ selections: [] }))).toThrow();
  });
});
describe("themed filesystem browser", () => {
  it("lists, navigates and creates directories without native dialogs", async () => {
    await writeFile(path.join(folder, "test.txt"), "test");
    await createDirectory(folder, "New archive");
    const listing = await browse(folder);
    expect(listing.path).toBe(await realpath(folder));
    expect(listing.entries[0]).toMatchObject({
      name: "New archive",
      directory: true,
    });
    expect(listing.parent).toBe(path.dirname(await realpath(folder)));
    expect(await exists(folder, "test.txt")).toBe(true);
    expect(await exists(folder, "missing.json")).toBe(false);
  });
  it.each(["../escape", "a/b", "a\\b", "", "..", "CON.txt", "x.", " bad "])(
    "rejects unsafe or nonportable filename %s",
    (name) => {
      expect(() => validName(name)).toThrow();
    },
  );
});
