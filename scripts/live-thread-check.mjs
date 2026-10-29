import { chromium } from "@playwright/test";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { unzipSync, strFromU8 } from "fflate";
const port = Number(process.argv[2]);
if (!Number.isInteger(port) || port < 1)
  throw new Error("Pass the local Electron CDP port.");
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const directory = path.resolve("artifacts/private/live-export");
await mkdir(directory, { recursive: true, mode: 0o700 });
try {
  const page = browser
    .contexts()[0]
    .pages()
    .find((p) => p.url().endsWith("index.html"));
  const result = await page.evaluate(
    async ({ directory }) => {
      const api = window.disdown,
        info = await api.session();
      const report = {
        checkedAt: new Date().toISOString(),
        serversChecked: 0,
        discoveredThreads: 0,
        messagesRead: 0,
        archived: false,
        warningCount: 0,
        saved: false,
      };
      const candidates = [...info.guilds]
        .reverse()
        .sort(
          (a, b) =>
            Number(b.features?.includes("COMMUNITY")) -
            Number(a.features?.includes("COMMUNITY")),
        );
      for (const g of candidates.slice(0, 20)) {
        report.serversChecked++;
        let view;
        try {
          view = await api.guild(g.id);
        } catch {
          continue;
        }
        let threads = view.threads;
        if (!threads.length) {
          const forum = view.channels.find((c) => [15, 16].includes(c.type));
          if (forum) {
            try {
              const result = await api.threads(forum);
              threads = result.threads;
              report.warningCount += result.warnings.length;
            } catch {}
          }
        }
        report.discoveredThreads += threads.length;
        for (const thread of threads.slice(0, 5)) {
          try {
            const messages = await api.messages(thread.id);
            if (!messages.length) continue;
            report.messagesRead = messages.length;
            report.archived = !!thread.thread_metadata?.archived;
            const result = await api.export({
              selections: [
                {
                  key: `thread:${thread.id}`,
                  kind: "thread",
                  id: thread.id,
                  label: "Live verification thread",
                  channelId: thread.id,
                  guildId: g.id,
                  data: thread,
                },
              ],
              options: {
                format: "json",
                packaging: "zip",
                media: false,
                threads: false,
                reactions: true,
                profiles: false,
                after: "",
                before: "",
                contains: "",
                authors: "",
                maxMessages: 2,
                redact: false,
              },
              directory,
              filename: "live-thread-verification.zip",
              overwrite: true,
            });
            report.saved = true;
            report.exportMessages = result.messages;
            report.exportBytes = result.bytes;
            report.warningCount += result.warnings.length;
            return report;
          } catch {}
        }
      }
      return report;
    },
    { directory },
  );
  if (result.saved) {
    const zip = unzipSync(
      await readFile(path.join(directory, "live-thread-verification.zip")),
    );
    const data = JSON.parse(strFromU8(zip["archive.json"]));
    result.limitHonored = data.messages.length > 0 && data.messages.length <= 2;
    result.threadMetadataPreserved = data.channels.some((c) =>
      [10, 11, 12].includes(c.type),
    );
  }
  await writeFile(
    "artifacts/private/live-thread-verification.json",
    JSON.stringify(result, null, 2),
    { mode: 0o600 },
  );
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
