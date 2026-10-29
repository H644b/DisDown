import { _electron as electron } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
await mkdir("artifacts/private", { recursive: true });
const app = await electron.launch({ args: ["."] });
const page = await app.firstWindow();
await page.waitForLoadState("domcontentloaded");
console.log(
  "DisDown is open. Enter your token and consent locally. No token is read by this verification script.",
);
try {
  await page
    .locator(".session-status")
    .waitFor({ state: "visible", timeout: 3600000 });
  await page
    .locator(".loading-state")
    .first()
    .waitFor({ state: "hidden", timeout: 120000 })
    .catch(() => {});
  console.log(
    "Live session connected. Checking available content without logging names or message bodies.",
  );
  const findings = await page.evaluate(async () => {
    const api = window.disdown;
    const info = await api.session();
    const results = {
      mode: info.mode,
      serverCount: info.guilds.length,
      dmCount: info.dms.length,
      checks: [],
      notices: info.warnings.length,
    };
    const check = async (name, fn) => {
      try {
        const result = await fn();
        results.checks.push({ name, status: "passed", ...result });
      } catch (e) {
        results.checks.push({ name, status: "failed", error: e.message });
      }
    };
    for (const g of info.guilds.slice(0, 2))
      await check("server channels and metadata", async () => {
        const v = await api.guild(g.id);
        results.notices += v.warnings.length;
        const c = v.channels.find((c) => c.type === 0);
        if (c) {
          await check("message history", async () => {
            const messages = await api.messages(c.id);
            if (messages.length) {
              await check("author profile", async () => {
                const p = await api.profile(messages[0].author.id, g.id);
                return { fields: Object.keys(p).length };
              });
              const reaction = messages.find((m) => m.reactions?.length);
              if (reaction) {
                const r = reaction.reactions[0];
                await check("reaction users", async () => ({
                  count: (
                    await api.reactionUsers(
                      c.id,
                      reaction.id,
                      r.emoji.id
                        ? `${r.emoji.name}:${r.emoji.id}`
                        : r.emoji.name,
                    )
                  ).length,
                }));
              }
            }
            return { count: messages.length };
          });
          await check("active and archived threads", async () => {
            const t = await api.threads(c);
            results.notices += t.warnings.length;
            return { count: t.threads.length, notices: t.warnings.length };
          });
        }
        return {
          channels: v.channels.length,
          activeThreads: v.threads.length,
          extras: v.extras.length,
        };
      });
    for (const c of info.dms.slice(0, 2))
      await check(
        c.type === 3 ? "group conversation history" : "DM history",
        async () => ({ count: (await api.messages(c.id)).length }),
      );
    return results;
  });
  await writeFile(
    "artifacts/private/live-api-verification.json",
    JSON.stringify(
      { checkedAt: new Date().toISOString(), ...findings },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  console.log(JSON.stringify(findings));
  console.log(
    "Live API check complete. App remains open for your selection and export test. Report is local under artifacts/private.",
  );
  await new Promise((resolve) => app.on("close", resolve));
} catch (e) {
  console.log("Live verification did not complete: " + e.message);
  await app.close();
  process.exitCode = 1;
}
