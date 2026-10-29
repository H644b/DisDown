import {
  test,
  expect,
  _electron as electron,
  type ElectronApplication,
  type Page,
} from "@playwright/test";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
let app: ElectronApplication;
let page: Page;
let folder: string;
test.beforeEach(async () => {
  folder = await mkdtemp(path.join(tmpdir(), "disdown-ui-"));
  app = await electron.launch({
    args: [
      ".",
      ...(process.env.CI && process.platform === "linux"
        ? ["--no-sandbox"]
        : []),
    ],
    env: { ...process.env, DISDOWN_DEV_URL: "", DISDOWN_TEST_HEADLESS: "1" },
  });
  page = await app.firstWindow();
  await page.waitForLoadState("domcontentloaded");
});
test.afterEach(async () => {
  await app.close();
  await rm(folder, { recursive: true, force: true });
});
async function sample() {
  await page.getByRole("button", { name: "Explore with sample data" }).click();
  await expect(
    page.getByRole("heading", { name: "general", exact: true }),
  ).toBeVisible();
}
test("consent, token isolation and desktop hardening", async () => {
  await page.screenshot({ path: "artifacts/welcome.png" });
  await expect(
    page.getByRole("button", { name: "Connect to Discord" }),
  ).toBeDisabled();
  await page
    .getByLabel("Discord token", { exact: true })
    .fill("test-token-never-transmitted");
  await page.getByText("I own this account", { exact: false }).click();
  await expect(
    page.getByRole("button", { name: "Connect to Discord" }),
  ).toBeDisabled();
  await page
    .getByText("I understand Discord’s policy", { exact: false })
    .click();
  await expect(
    page.getByRole("button", { name: "Connect to Discord" }),
  ).toBeEnabled();
  const prefs = await app.evaluate(({ BrowserWindow }) =>
    (
      BrowserWindow.getAllWindows()[0].webContents as any
    ).getLastWebPreferences(),
  );
  expect(prefs.nodeIntegration).toBe(false);
  expect(prefs.contextIsolation).toBe(true);
  expect(prefs.sandbox).toBe(true);
  expect(
    await page.evaluate(() => ({
      node: typeof (window as any).require,
      storage: localStorage.length,
    })),
  ).toEqual({ node: "undefined", storage: 0 });
});
test("granular selection across conversations, threads, profiles and server metadata", async () => {
  await sample();
  await page.screenshot({ path: "artifacts/browser.png" });
  for (const kind of [
    "message",
    "reaction",
    "attachment",
    "embed",
    "sticker",
    "poll",
    "component",
  ]) {
    const button = page
      .getByRole("button", { name: new RegExp(`^Select ${kind}:`) })
      .first();
    await button.scrollIntoViewIfNeeded();
    await button.click();
  }
  await page
    .getByRole("button", { name: "View profile Alex Park" })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Select user", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Select user", exact: true }).click();
  await page.getByRole("button", { name: "Close details" }).click();
  await page
    .getByRole("button", { name: "Select channel: general", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Select category: THE GOOD STUFF",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Select guild: The Commons", exact: true })
    .click();
  await page.getByRole("button", { name: "Browse threads" }).click();
  await expect(
    page.getByRole("heading", { name: "Threads in #general" }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Select thread: Little things worth saving",
      exact: true,
    })
    .last()
    .click();
  await page.getByRole("button", { name: "Close threads" }).click();
  await page.getByRole("button", { name: "Roles, emoji & events" }).click();
  for (const kind of ["role", "emoji", "event"])
    await page
      .getByRole("button", { name: new RegExp(`^Select ${kind}:`) })
      .first()
      .click();
  await page
    .getByRole("button", { name: "Direct messages", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Jules", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Select channel: Jules", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Select channel: The weekend crew",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Choose export options" }).click();
  await expect(
    page.getByRole("heading", { name: "A format for future you." }),
  ).toBeVisible();
  for (const label of ["JSON", "CSV", "Markdown", "Plain text", "HTML"])
    await page.getByRole("radio", { name: new RegExp(`^${label}`) }).click();
  await page.getByLabel("From date").fill("2026-10-29");
  await page.getByLabel("Through date").fill("2026-10-28");
  await expect(
    page.getByRole("button", { name: "Choose where to save" }),
  ).toBeDisabled();
  await page.getByLabel("From date").fill("2026-10-01");
  await expect(
    page.getByRole("button", { name: "Choose where to save" }),
  ).toBeEnabled();
  await page.screenshot({ path: "artifacts/options.png" });
});
test("themed picker creates folder, writes real export and protects existing files", async () => {
  await sample();
  await page
    .getByRole("button", { name: "Select message:", exact: false })
    .first()
    .click();
  await page.getByRole("button", { name: "Choose export options" }).click();
  await page.getByRole("radio", { name: /^JSON/ }).click();
  await page.getByLabel("ZIP bundle", { exact: true }).uncheck();
  await page.getByRole("button", { name: "Choose where to save" }).click();
  await page.screenshot({ path: "artifacts/save.png" });
  await page.getByLabel("Archive filename").fill("my-conversation");
  await page
    .getByRole("button", { name: "Save collection", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  expect(
    await page.evaluate(
      () => !!document.activeElement?.closest("[role=dialog]"),
    ),
  ).toBe(true);
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(
      () => !!document.activeElement?.closest("[role=dialog]"),
    ),
  ).toBe(true);
  await page.getByLabel("Folder path").fill(folder);
  await page.getByLabel("Go to folder", { exact: true }).click();
  await page.getByRole("button", { name: "New folder", exact: true }).click();
  await page.getByLabel("New folder name").fill("My archive");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("button", { name: "My archive", exact: true }).click();
  await expect(page.locator(".folder-picker .loading-state")).toBeHidden();
  await page.screenshot({ path: "artifacts/picker.png" });
  await page.getByRole("button", { name: "Use this folder" }).click();
  await expect(
    page.getByRole("heading", { name: "A little piece of Discord. Kept." }),
  ).toBeVisible();
  const saved = JSON.parse(
    await readFile(
      path.join(folder, "My archive", "my-conversation.json"),
      "utf8",
    ),
  );
  expect(saved.messages).toHaveLength(1);
  expect(saved.selection).toHaveLength(1);
  expect(saved.warnings.join(" ")).toContain("Sample data");
  await page.waitForTimeout(750);
  await page.screenshot({ path: "artifacts/saved.png" });
  await page.getByRole("button", { name: "Back to export options" }).click();
  await page.getByRole("button", { name: "Choose where to save" }).click();
  await page.getByLabel("Archive filename").fill("my-conversation");
  await page
    .getByRole("button", { name: "Save collection", exact: true })
    .click();
  await page.getByLabel("Folder path").fill(path.join(folder, "My archive"));
  await page.getByLabel("Go to folder", { exact: true }).click();
  await page.getByRole("button", { name: "Use this folder" }).click();
  await expect(
    page.getByRole("button", { name: "Replace file", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keep existing file" }).click();
  expect(
    (await readdir(path.join(folder, "My archive"))).filter((n) =>
      n.endsWith(".part"),
    ),
  ).toHaveLength(0);
});
test("minimum desktop size keeps navigation and selections accessible", async () => {
  await app.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].setSize(1000, 680),
  );
  await sample();
  await page
    .getByRole("button", { name: "Select message:", exact: false })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Choose export options" }),
  ).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Direct messages", exact: true }),
  ).toBeInViewport();
  await page.screenshot({ path: "artifacts/minimum-window.png" });
});
