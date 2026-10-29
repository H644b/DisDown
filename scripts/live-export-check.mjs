// Attach to the already consented local app. No credential input, logging or storage.
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { unzipSync, strFromU8 } from "fflate";
const port = Number(process.argv[2]);
if (!Number.isInteger(port) || port < 1)
  throw new Error("Pass the local Electron CDP port.");
const directory = path.resolve("artifacts/private/live-export");
await mkdir(directory, { recursive: true, mode: 0o700 });
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
try {
  const page = browser
    .contexts()[0]
    .pages()
    .find((p) => p.url().endsWith("index.html"));
  if (!page) throw new Error("DisDown window not found");
  const report = await page.evaluate(
    async ({ directory }) => {
      const api = window.disdown;
      const info = await api.session();
      if (!info || info.mode === "demo")
        throw new Error("Connect a real account locally first.");
      const selections = [];
      const stats = {
        checkedAt: new Date().toISOString(),
        mode: info.mode,
        liveThreadContent: false,
        channelMessages: 0,
        dmMessages: 0,
        groupMessages: 0,
        reactions: 0,
        attachments: 0,
        embeds: 0,
        profiles: 0,
      };
      let thread;
      const addMessage = (m) => {
        selections.push({
          key: `message:${m.channel_id}:${m.id}`,
          kind: "message",
          id: m.id,
          label: "Live verification message",
          data: m,
          channelId: m.channel_id,
        });
        stats.profiles++;
        if (m.reactions?.length) {
          const r = m.reactions[0];
          selections.push({
            key: `reaction:${m.id}`,
            kind: "reaction",
            id: m.id,
            label: "Live verification reaction",
            data: r,
            channelId: m.channel_id,
            messageId: m.id,
          });
          stats.reactions++;
        }
        if (m.attachments?.length) {
          const a = m.attachments[0];
          selections.push({
            key: `attachment:${a.id}`,
            kind: "attachment",
            id: a.id,
            label: "Live verification attachment",
            data: a,
            channelId: m.channel_id,
            messageId: m.id,
          });
          stats.attachments++;
        }
        if (m.embeds?.length) {
          selections.push({
            key: `embed:${m.id}`,
            kind: "embed",
            id: m.id,
            label: "Live verification embed",
            data: m.embeds[0],
            channelId: m.channel_id,
            messageId: m.id,
            index: 0,
          });
          stats.embeds++;
        }
      };
      // Bounded sampling, with no names or content returned to the console.
      for (const g of info.guilds.slice(0, 8)) {
        const v = await api.guild(g.id);
        const c = v.channels.find((c) => c.type === 0);
        if (c && stats.channelMessages === 0) {
          const messages = await api.messages(c.id);
          if (messages[0]) {
            addMessage(messages[0]);
            stats.channelMessages++;
          }
          const withMedia = messages.find((m) => m.attachments?.length);
          if (withMedia && withMedia.id !== messages[0]?.id) {
            addMessage(withMedia);
            stats.channelMessages++;
          }
        }
        if (v.threads[0]) {
          thread = v.threads[0];
          break;
        }
      }
      if (thread) {
        const messages = await api.messages(thread.id);
        if (messages[0]) {
          addMessage(messages[0]);
          stats.liveThreadContent = true;
        }
      }
      for (const type of [1, 3]) {
        const c = info.dms.find((c) => c.type === type);
        if (c) {
          const messages = await api.messages(c.id);
          if (messages[0]) {
            addMessage(messages[0]);
            if (type === 1) stats.dmMessages++;
            else stats.groupMessages++;
          }
        }
      }
      if (!selections.length)
        throw new Error("No accessible messages found in the bounded sample.");
      const result = await api.export({
        selections,
        options: {
          format: "html",
          packaging: "zip",
          media: true,
          threads: false,
          reactions: true,
          profiles: true,
          after: "",
          before: "",
          contains: "",
          authors: "",
          maxMessages: 0,
          redact: false,
        },
        directory,
        filename: "live-verification.zip",
        overwrite: true,
      });
      return {
        ...stats,
        selectionCount: selections.length,
        messages: result.messages,
        bytes: result.bytes,
        warningCount: result.warnings.length,
        path: result.path,
      };
    },
    { directory },
  );
  const zip = unzipSync(await readFile(report.path));
  const data = JSON.parse(strFromU8(zip["data.json"]));
  const manifest = JSON.parse(strFromU8(zip["manifest.json"]));
  const checks = {
    ...report,
    html: !!zip["archive.html"],
    json: !!zip["data.json"],
    manifest: !!zip["manifest.json"],
    savedMediaFiles: Object.keys(zip).filter(
      (k) => k.startsWith("media/") && !k.endsWith("/"),
    ).length,
    selectionMatches: data.selection.length === report.selectionCount,
    countsMatch:
      data.messages.length === report.messages &&
      manifest.messages === report.messages,
  };
  await writeFile(
    "artifacts/private/live-export-verification.json",
    JSON.stringify(checks, null, 2),
    { mode: 0o600 },
  );
  const { path: privatePath, ...safe } = checks;
  console.log(JSON.stringify(safe));
} finally {
  await browser.close();
}
