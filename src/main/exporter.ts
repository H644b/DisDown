import { createWriteStream, createReadStream } from "node:fs";
import {
  open,
  mkdtemp,
  rm,
  stat,
  link,
  unlink,
  rename,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { once } from "node:events";
import archiver from "archiver";
import type {
  Archive,
  Attachment,
  Channel,
  ExportOptions,
  ExportRequest,
  ExportResult,
  Message,
  Progress,
  Selection,
  User,
} from "../shared/types";
import type { DataClient } from "./discord";
import { destination } from "./filesystem";
import { extension, isTextChannel, nameOf, safeImage } from "../shared/utils";
const check = (signal: AbortSignal) => {
  if (signal.aborted) throw new Error("Cancelled");
};
const html = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const csv = (value: unknown) => {
  let v = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(v) || /^[\t\r]/.test(v)) v = "'" + v;
  return `"${v.replace(/"/g, '""')}"`;
};
export function clean(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([k]) =>
            ![
              "token",
              "access_token",
              "refresh_token",
              "password",
              "email",
              "phone",
              "mfa_codes",
              "session_id",
              "__proto__",
              "constructor",
              "prototype",
            ].includes(k),
        )
        .map(([k, v]) => [k, clean(v)]),
    );
  return value;
}
function match(m: Message, options: ExportOptions) {
  const stamp = Date.parse(m.timestamp);
  if (options.after && stamp < Date.parse(options.after + "T00:00:00Z"))
    return false;
  if (options.before && stamp > Date.parse(options.before + "T23:59:59.999Z"))
    return false;
  if (
    options.contains &&
    !m.content.toLowerCase().includes(options.contains.toLowerCase())
  )
    return false;
  const authors = options.authors
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return !authors.length || authors.includes(m.author.id);
}
export function validateRequest(request: ExportRequest): ExportRequest {
  if (
    !request ||
    !Array.isArray(request.selections) ||
    !request.selections.length ||
    request.selections.length > 10000
  )
    throw new Error("Select between 1 and 10,000 items.");
  if (Buffer.byteLength(JSON.stringify(request)) > 8 * 1024 * 1024)
    throw new Error("The selection is too large. Export in smaller groups.");
  const o = request.options;
  if (
    !o ||
    !["html", "json", "csv", "md", "txt"].includes(o.format) ||
    !["zip", "file"].includes(o.packaging)
  )
    throw new Error("Choose a supported export format.");
  for (const flag of [
    "media",
    "threads",
    "reactions",
    "profiles",
    "redact",
  ] as const)
    if (typeof o[flag] !== "boolean") throw new Error("Invalid export option.");
  for (const key of ["after", "before", "contains", "authors"] as const)
    if (typeof o[key] !== "string" || o[key].length > 2000)
      throw new Error("Invalid export filter.");
  for (const d of [o.after, o.before])
    if (
      d &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !Number.isFinite(Date.parse(d)))
    )
      throw new Error("Choose valid dates.");
  if (o.after && o.before && o.after > o.before)
    throw new Error("The start date must come before the end date.");
  if (
    !Number.isInteger(o.maxMessages) ||
    o.maxMessages < 0 ||
    o.maxMessages > 250000
  )
    throw new Error("Message limit must be between 0 (all) and 250,000.");
  if (o.media && o.packaging !== "zip")
    throw new Error("Downloaded attachments require a ZIP bundle.");
  if (
    typeof request.directory !== "string" ||
    typeof request.filename !== "string" ||
    typeof request.overwrite !== "boolean" ||
    !request.filename.endsWith("." + extension(o))
  )
    throw new Error("The filename must match your export format.");
  for (const s of request.selections) {
    if (
      !s ||
      ![
        "guild",
        "category",
        "channel",
        "thread",
        "message",
        "reaction",
        "user",
        "attachment",
        "embed",
        "sticker",
        "poll",
        "component",
        "role",
        "emoji",
        "event",
        "field",
      ].includes(s.kind) ||
      typeof s.id !== "string" ||
      s.id.length > 200 ||
      typeof s.label !== "string" ||
      s.label.length > 1000 ||
      typeof s.key !== "string"
    )
      throw new Error("Invalid selected item.");
  }
  return request;
}
export async function collect(
  client: DataClient,
  selections: Selection[],
  options: ExportOptions,
  signal: AbortSignal,
  onProgress: (p: Progress) => void,
): Promise<Archive> {
  const archive: Archive = {
    version: 1,
    app: "DisDown",
    exportedAt: new Date().toISOString(),
    account: { id: client.info.user.id, username: client.info.user.username },
    selection: selections.map(({ data, ...s }) => s),
    options,
    guilds: [],
    channels: [],
    messages: [],
    users: [],
    items: [],
    warnings: [...client.info.warnings],
    media: {},
    truncated: false,
  };
  if (client.info.mode === "demo")
    archive.warnings.push(
      "Sample data export. This archive does not contain live Discord content.",
    );
  const channelMap = new Map<string, Channel>();
  const messageMap = new Map<string, Message>();
  const profileIds = new Set<string>();
  const expanded = new Set<string>();
  const guildCache = new Map<
    string,
    Awaited<ReturnType<DataClient["guild"]>>
  >();
  const progress = (detail: string, current = 0, total = selections.length) =>
    onProgress({
      phase: "collecting",
      current,
      total,
      detail,
      messages: messageMap.size,
      bytes: 0,
    });
  const guildView = async (guildId: string) => {
    if (!guildCache.has(guildId)) {
      const v = await client.guild(guildId, signal);
      guildCache.set(guildId, v);
      archive.warnings.push(...v.warnings);
      if (!archive.guilds.some((g) => g.id === v.guild.id))
        archive.guilds.push(v.guild);
    }
    return guildCache.get(guildId)!;
  };
  const addMessage = (message: Message) => {
    if (!match(message, options)) return;
    if (messageMap.size >= 250000 && !messageMap.has(message.id))
      throw new Error(
        "This export exceeds 250,000 messages. Add a date range or export smaller groups.",
      );
    messageMap.set(message.id, message);
    if (options.profiles) profileIds.add(message.author.id);
  };
  async function channel(c: Channel) {
    check(signal);
    if (expanded.has(c.id)) return;
    expanded.add(c.id);
    channelMap.set(c.id, c);
    if (isTextChannel(c)) {
      let before = "";
      let matched = 0;
      const seen = new Set<string>();
      for (;;) {
        check(signal);
        let page: Message[];
        try {
          page = await client.messages(c.id, before || undefined, signal);
        } catch (e) {
          if (signal.aborted) throw e;
          archive.warnings.push(`#${nameOf(c)}: ${(e as Error).message}`);
          break;
        }
        let stop = false;
        for (const m of page) {
          if (
            options.after &&
            Date.parse(m.timestamp) < Date.parse(options.after + "T00:00:00Z")
          ) {
            stop = true;
            continue;
          }
          if (match(m, options)) {
            if (options.maxMessages && matched >= options.maxMessages) {
              archive.truncated = true;
              stop = true;
              break;
            }
            addMessage(m);
            matched++;
          }
        }
        progress(
          `Reading #${nameOf(c)} · ${matched.toLocaleString()} matching messages`,
        );
        if (stop || page.length < 100) break;
        const cursor = page.at(-1)!.id;
        if (seen.has(cursor)) {
          archive.warnings.push(
            `Repeated history cursor in #${nameOf(c)}; reading stopped.`,
          );
          break;
        }
        seen.add(cursor);
        before = cursor;
      }
    }
    if (
      options.threads &&
      c.guild_id &&
      [0, 2, 5, 13, 15, 16].includes(c.type)
    ) {
      try {
        const result = await client.threads(c, signal);
        archive.warnings.push(...result.warnings);
        for (const t of result.threads) await channel(t);
      } catch (e) {
        if (signal.aborted) throw e;
        archive.warnings.push(
          `Threads in #${nameOf(c)}: ${(e as Error).message}`,
        );
      }
    }
  }
  for (const [i, s] of selections.entries()) {
    check(signal);
    progress(`Collecting ${s.label}`, i, selections.length);
    try {
      if (s.kind === "guild") {
        const view = await guildView(s.id);
        for (const c of view.channels) if (c.type !== 4) await channel(c);
        if (options.threads) for (const t of view.threads) await channel(t);
      } else if (s.kind === "category") {
        const view = await guildView(s.guildId!);
        channelMap.set(
          s.id,
          view.channels.find((c) => c.id === s.id) || (s.data as Channel),
        );
        for (const c of view.channels.filter((c) => c.parent_id === s.id))
          await channel(c);
      } else if (s.kind === "channel" || s.kind === "thread") {
        let c = s.data as Channel | undefined;
        if (!c || c.id !== s.id)
          throw new Error("Re-select this channel to load its metadata.");
        await channel(c);
      } else if (s.kind === "message") {
        const m = s.data as Message;
        if (!m || m.id !== s.id || !m.author)
          throw new Error("Re-select this message.");
        addMessage(m);
      } else if (s.kind === "user") {
        profileIds.add(s.id);
        archive.items.push(s);
      } else {
        const selected = { ...s };
        if (s.kind === "reaction") {
          const r = s.data as { emoji: { id: string | null; name: string } };
          const emoji = r.emoji.id
            ? `${r.emoji.name}:${r.emoji.id}`
            : r.emoji.name;
          try {
            selected.data = {
              ...r,
              users: await client.reactionUsers(
                s.channelId!,
                s.messageId!,
                emoji,
                signal,
              ),
            };
          } catch (e) {
            if (signal.aborted) throw e;
            archive.warnings.push(
              `Reaction members for ${s.label}: ${(e as Error).message}`,
            );
          }
        }
        archive.items.push(selected);
      }
    } catch (e) {
      if (signal.aborted) throw e;
      if ((e as Error).message.includes("exceeds 250,000")) throw e;
      archive.warnings.push(`${s.label}: ${(e as Error).message}`);
    }
  }
  // Never widen a leaf selection to its enclosing channel or message.
  archive.channels = [...channelMap.values()];
  archive.messages = [...messageMap.values()].sort(
    (a, b) =>
      Date.parse(a.timestamp) - Date.parse(b.timestamp) ||
      a.id.localeCompare(b.id),
  );
  for (const userId of profileIds) {
    check(signal);
    try {
      const profile = await client.profile(
        userId,
        selections.find((s) => s.id === userId)?.guildId,
        signal,
      );
      const user = (profile.user || profile) as User;
      archive.users.push({ ...user, profile });
    } catch (e) {
      if (signal.aborted) throw e;
      const author = archive.messages.find(
        (m) => m.author.id === userId,
      )?.author;
      if (author) archive.users.push(author);
      archive.warnings.push(`Profile ${userId}: ${(e as Error).message}`);
    }
  }
  archive.messages = archive.messages.map((m) => ({
    ...m,
    reactions: options.reactions ? m.reactions : undefined,
    author: options.profiles
      ? m.author
      : { id: m.author.id, username: m.author.username },
  }));
  if (options.redact) {
    const aliases = new Map<string, string>();
    const pseudonym = (user: User): User => {
      if (!aliases.has(user.id))
        aliases.set(user.id, `Person ${aliases.size + 1}`);
      return {
        id: user.id,
        username: aliases.get(user.id)!,
        global_name: aliases.get(user.id)!,
      };
    };
    archive.messages = archive.messages.map((m) => ({
      ...m,
      author: pseudonym(m.author),
      mentions: Array.isArray(m.mentions)
        ? (m.mentions as User[]).map(pseudonym)
        : m.mentions,
    }));
    archive.users = archive.users.map(pseudonym);
    archive.account.username = "Archive owner";
    archive.items = archive.items.map((item) =>
      item.kind === "user"
        ? {
            ...item,
            label: pseudonym({ id: item.id, username: "" }).username,
            data: pseudonym({ id: item.id, username: "" }),
          }
        : item,
    );
    archive.warnings.push(
      "Author display names were replaced. Message text, IDs, quoted content and selected non-profile fields may still identify people.",
    );
  }
  if (options.redact)
    archive.selection = archive.selection.map((s) => ({
      ...s,
      label:
        s.kind === "user"
          ? "Selected profile"
          : s.kind === "message"
            ? "Selected message"
            : s.label,
    }));
  archive.warnings = [...new Set(archive.warnings)];
  return clean(archive) as Archive;
}
function readableItem(item: Selection) {
  return `${item.kind}: ${item.label}\n${JSON.stringify(item.data, null, 2)}`;
}
export function serialize(
  archive: Archive,
  format: ExportOptions["format"],
): string {
  if (format === "json") return JSON.stringify(archive, null, 2);
  if (format === "csv")
    return [
      [
        "kind",
        "id",
        "channel_id",
        "timestamp",
        "author_id",
        "author",
        "content",
        "details",
      ]
        .map(csv)
        .join(","),
      ...archive.messages.map((m) =>
        [
          "message",
          m.id,
          m.channel_id,
          m.timestamp,
          m.author.id,
          m.author.global_name || m.author.username,
          m.content,
          JSON.stringify({
            attachments: m.attachments,
            embeds: m.embeds,
            reactions: m.reactions,
            poll: m.poll,
            stickers: m.sticker_items,
            components: m.components,
          }),
        ]
          .map(csv)
          .join(","),
      ),
      ...archive.items.map((i) =>
        [
          i.kind,
          i.id,
          i.channelId || "",
          "",
          "",
          "",
          i.label,
          JSON.stringify(i.data),
        ]
          .map(csv)
          .join(","),
      ),
      ...archive.users.map((u) =>
        ["user", u.id, "", "", "", u.username, "", JSON.stringify(u)]
          .map(csv)
          .join(","),
      ),
      ...archive.guilds.map((g) =>
        ["guild", g.id, "", "", "", "", g.name, JSON.stringify(g)]
          .map(csv)
          .join(","),
      ),
      ...archive.channels.map((c) =>
        ["channel", c.id, c.id, "", "", "", nameOf(c), JSON.stringify(c)]
          .map(csv)
          .join(","),
      ),
      ...archive.warnings.map((w) =>
        ["warning", "", "", "", "", "", w, ""].map(csv).join(","),
      ),
    ].join("\r\n");
  if (format === "html")
    return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'none'"><title>DisDown archive</title><style>body{margin:0;background:#24252a;color:#edeef2;font:15px/1.65 system-ui,sans-serif}main{max-width:900px;margin:60px auto;padding:0 28px}h1{font-size:36px;letter-spacing:-1px}h2{margin-top:40px;font-size:21px}article{padding:22px 0;border-bottom:1px solid #42434b}header{display:flex;gap:12px;align-items:baseline}time,.meta{color:#bbbcc7;font-size:12px}.content{white-space:pre-wrap;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#1c1d22;padding:16px}a{color:#c3b1ff}details{margin:12px 0}img{max-width:100%;max-height:420px}code{overflow-wrap:anywhere}.warning{color:#f1cb8b}</style></head><body><main><h1>DisDown archive</h1><p>${html(archive.account.username)} · ${html(archive.exportedAt)} · ${archive.messages.length} messages</p>${archive.truncated ? '<p class="warning">A message limit was applied. This is a limited export.</p>' : ""}${archive.warnings.map((w) => `<p class="warning">${html(w)}</p>`).join("")}${archive.guilds.map((g) => `<h2>${html(g.name)}</h2><details><summary>Server metadata</summary><pre>${html(JSON.stringify(g, null, 2))}</pre></details>`).join("")}${archive.channels.map((c) => `<details><summary>#${html(nameOf(c))} · channel metadata</summary><pre>${html(JSON.stringify(c, null, 2))}</pre></details>`).join("")}<h2>Messages</h2>${archive.messages.map((m) => `<article><header><strong>${html(m.author.global_name || m.author.username)}</strong><time>${html(m.timestamp)}</time></header><div class="meta">Channel ${html(m.channel_id)} · ${html(m.id)}</div><p class="content">${html(m.content)}</p>${m.attachments.map((a) => `<p>Attachment: ${archive.media[a.id] ? `<a href="${html(archive.media[a.id])}" download>${html(a.filename)}</a>${a.content_type?.startsWith("image/") ? `<br><img src="${html(archive.media[a.id])}" alt="${html(a.filename)}">` : ""}` : `${html(a.filename)} <span class="meta">${html(a.url)}</span>`}</p>`).join("")}${(m.reactions || []).map((r) => `<span>${html(r.emoji.name)} ${r.count} &nbsp;</span>`).join("")}${m.embeds.length ? `<pre>${html(JSON.stringify(m.embeds, null, 2))}</pre>` : ""}${m.poll ? `<pre>${html(JSON.stringify(m.poll, null, 2))}</pre>` : ""}${m.sticker_items?.length ? `<pre>${html(JSON.stringify(m.sticker_items, null, 2))}</pre>` : ""}${m.components?.length ? `<pre>${html(JSON.stringify(m.components, null, 2))}</pre>` : ""}</article>`).join("")}<h2>Selected items</h2>${archive.items.map((i) => `<details open><summary>${html(i.kind)} · ${html(i.label)}</summary><pre>${html(JSON.stringify(i.data, null, 2))}</pre>${i.kind === "attachment" && archive.media[i.id] ? `<a href="${html(archive.media[i.id])}" download>Open saved attachment</a>` : ""}</details>`).join("")}<h2>Profiles</h2>${archive.users.map((u) => `<details><summary>${html(u.global_name || u.username)}</summary><pre>${html(JSON.stringify(u, null, 2))}</pre></details>`).join("")}<footer><p class="meta">Created locally with DisDown. Links to Discord media may expire. Downloaded media is stored in the media folder.</p></footer></main></body></html>`;
  const md = format === "md";
  return `${md ? "# " : ""}DisDown archive\n${archive.exportedAt}\n${archive.warnings.map((w) => "NOTICE: " + w).join("\n")}\n${archive.truncated ? "NOTICE: A per-channel message limit was applied.\n" : ""}\n${archive.guilds.map((g) => `${md ? "## " : ""}${g.name}\n${JSON.stringify(g, null, 2)}`).join("\n\n")}\n${archive.channels.map((c) => `${md ? "## " : ""}#${nameOf(c)}\n${JSON.stringify(c, null, 2)}`).join("\n\n")}\n${archive.messages.map((m) => `${md ? "### " : ""}${m.author.global_name || m.author.username} · ${m.timestamp} · ${m.channel_id}\n${m.content}\n${m.attachments.map((a) => `Attachment: ${a.filename} (${archive.media[a.id] || a.url})`).join("\n")}\n${m.reactions?.map((r) => `${r.emoji.name} × ${r.count}`).join("  ") || ""}${m.embeds.length ? "\nEmbeds: " + JSON.stringify(m.embeds) : ""}${m.poll ? "\nPoll: " + JSON.stringify(m.poll) : ""}${m.sticker_items?.length ? "\nStickers: " + JSON.stringify(m.sticker_items) : ""}${m.components?.length ? "\nComponents: " + JSON.stringify(m.components) : ""}`).join("\n\n")}\n\n${archive.items.map(readableItem).join("\n\n")}\n\nProfiles\n${archive.users.map((u) => JSON.stringify(u, null, 2)).join("\n\n")}`;
}
async function download(
  attachment: Attachment,
  target: string,
  signal: AbortSignal,
  onBytes: (n: number) => void,
  fetcher: typeof fetch,
) {
  if (!safeImage(attachment.url))
    throw new Error("Only Discord-hosted attachments can be downloaded.");
  const response = await fetcher(attachment.url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(120000)]),
    redirect: "error",
  });
  if (!response.ok || !response.body)
    throw new Error(`Attachment unavailable (HTTP ${response.status}).`);
  const handle = await open(target, "wx", 0o600);
  let bytes = 0;
  try {
    for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
      check(signal);
      bytes += chunk.length;
      if (bytes > 512 * 1024 * 1024)
        throw new Error("Attachment exceeds the 512 MB per-file limit.");
      await handle.write(chunk);
      onBytes(chunk.length);
    }
  } finally {
    await handle.close();
  }
}
export async function exportArchive(
  client: DataClient,
  input: ExportRequest,
  signal: AbortSignal,
  progress: (p: Progress) => void,
  fetcher: typeof fetch = fetch,
): Promise<ExportResult> {
  const request = validateRequest(input);
  const output = await destination(request.directory, request.filename);
  const staging = await mkdtemp(path.join(tmpdir(), "disdown-"));
  const partial = path.join(
    request.directory,
    `.disdown-${crypto.randomUUID()}.part`,
  );
  let bytes = 0;
  try {
    const archive = await collect(
      client,
      request.selections,
      request.options,
      signal,
      progress,
    );
    check(signal);
    const media: { file: string; name: string }[] = [];
    if (request.options.media) {
      const attachments = [
        ...new Map(
          [
            ...archive.messages.flatMap((m) => m.attachments),
            ...archive.items
              .filter((i) => i.kind === "attachment")
              .map((i) => i.data as Attachment),
          ].map((a) => [a.id, a]),
        ).values(),
      ];
      for (const [i, a] of attachments.entries()) {
        check(signal);
        const name = `media/${a.id}-${a.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100)}`;
        const local = path.join(staging, `${i}.asset`);
        progress({
          phase: "media",
          current: i,
          total: attachments.length,
          detail: `Saving ${a.filename}`,
          messages: archive.messages.length,
          bytes,
        });
        try {
          if (client.info.mode === "demo") {
            await writeFile(
              local,
              "DisDown sample attachment. This is demonstration data, not a file retrieved from Discord.\n",
            );
          } else
            await download(
              a,
              local,
              signal,
              (n) => {
                bytes += n;
                progress({
                  phase: "media",
                  current: i,
                  total: attachments.length,
                  detail: `Saving ${a.filename}`,
                  messages: archive.messages.length,
                  bytes,
                });
              },
              fetcher,
            );
          media.push({ file: local, name });
          archive.media[a.id] = name;
        } catch (e) {
          if (signal.aborted) throw e;
          archive.warnings.push(`${a.filename}: ${(e as Error).message}`);
        }
      }
    }
    check(signal);
    progress({
      phase: "writing",
      current: 0,
      total: 1,
      detail: "Writing your archive",
      messages: archive.messages.length,
      bytes,
    });
    if (request.options.packaging === "zip") {
      const outputStream = createWriteStream(partial, {
        flags: "wx",
        mode: 0o600,
      });
      const zip = archiver("zip", { zlib: { level: 6 } });
      const closed = once(outputStream, "close");
      const fail = (e: Error) => outputStream.destroy(e);
      zip.on("error", fail);
      zip.on("warning", fail);
      zip.pipe(outputStream);
      const abort = () => {
        zip.abort();
        outputStream.destroy(new Error("Cancelled"));
      };
      signal.addEventListener("abort", abort, { once: true });
      try {
        zip.append(serialize(archive, request.options.format), {
          name: `archive.${request.options.format}`,
        });
        if (request.options.format !== "json")
          zip.append(JSON.stringify(archive, null, 2), { name: "data.json" });
        zip.append(
          JSON.stringify(
            {
              app: "DisDown",
              version: 1,
              selection: archive.selection,
              options: archive.options,
              messages: archive.messages.length,
              items: archive.items.length,
              profiles: archive.users.length,
              truncated: archive.truncated,
              warnings: archive.warnings,
              exportedAt: archive.exportedAt,
            },
            null,
            2,
          ),
          { name: "manifest.json" },
        );
        for (const asset of media) zip.file(asset.file, { name: asset.name });
        await zip.finalize();
        await closed;
      } finally {
        signal.removeEventListener("abort", abort);
      }
    } else
      await writeFile(partial, serialize(archive, request.options.format), {
        flag: "wx",
        mode: 0o600,
      });
    check(signal);
    const handle = await open(partial, "r+");
    await handle.sync();
    await handle.close();
    if (request.overwrite) await rename(partial, output);
    else {
      try {
        await link(partial, output);
        await unlink(partial);
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code === "EEXIST")
          throw new Error(
            "A file with this name already exists. Choose another name or confirm replacement.",
          );
        throw e;
      }
    }
    bytes = (await stat(output)).size;
    const result = {
      path: output,
      messages: archive.messages.length,
      bytes,
      warnings: archive.warnings,
    };
    progress({
      phase: "done",
      current: 1,
      total: 1,
      detail: "Your archive is ready",
      ...result,
    });
    return result;
  } finally {
    await rm(staging, { recursive: true, force: true });
    await rm(partial, { force: true });
  }
}
