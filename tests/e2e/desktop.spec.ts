import { themeVariables } from "../../src/renderer/theme";
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
    env: {
      ...process.env,
      DISDOWN_DEV_URL: "",
      DISDOWN_TEST_HEADLESS: process.env.CI ? "" : "1",
    },
  });
  page = await app.firstWindow();
  await page.waitForLoadState("domcontentloaded");
  await page.emulateMedia({ reducedMotion: "reduce" });
});
test.afterEach(async () => {
  await app.close();
  await rm(folder, { recursive: true, force: true });
});
async function sample() {
  await page.getByRole("button", { name: "Preview with sample data" }).click();
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
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(
    page.getByRole("heading", { name: "Export settings" }),
  ).toBeVisible();
  for (const label of ["JSON", "CSV", "Markdown", "Plain text", "HTML"])
    await page.getByRole("radio", { name: new RegExp(`^${label}`) }).click();
  await page.getByLabel("From date").fill("2026-10-29");
  await page.getByLabel("Through date").fill("2026-10-28");
  await expect(
    page.getByRole("button", { name: "Continue to save" }),
  ).toBeDisabled();
  await page.getByLabel("From date").fill("2026-10-01");
  await expect(
    page.getByRole("button", { name: "Continue to save" }),
  ).toBeEnabled();
  await page.screenshot({ path: "artifacts/options.png" });
});
test("themed picker creates folder, writes real export and protects existing files", async () => {
  await sample();
  await page
    .getByRole("button", { name: "Select message:", exact: false })
    .first()
    .click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: /^JSON/ }).click();
  await page.getByLabel("ZIP bundle", { exact: true }).uncheck();
  await page.getByRole("button", { name: "Continue to save" }).click();
  await page.screenshot({ path: "artifacts/save.png" });
  await page.getByLabel("Archive filename").fill("my-conversation");
  await page.getByRole("button", { name: "Save export", exact: true }).click();
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
    page.getByRole("heading", { name: "Export complete" }),
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
  await page.getByRole("button", { name: "Back to settings" }).click();
  await page.getByRole("button", { name: "Continue to save" }).click();
  await page.getByLabel("Archive filename").fill("my-conversation");
  await page.getByRole("button", { name: "Save export", exact: true }).click();
  await page.getByLabel("Folder path").fill(path.join(folder, "My archive"));
  // Confirming a typed path must validate that path, even before pressing Go.
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
  await expect(page.getByRole("button", { name: "Continue" })).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Direct messages", exact: true }),
  ).toBeInViewport();
  await page.screenshot({ path: "artifacts/minimum-window.png" });
});

test("forum channels open directly to selectable posts and return from the thread", async () => {
  await sample();
  await page.getByRole("button", { name: "resources", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Posts in #resources" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Our favorite type foundries/ }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Select thread: Our favorite type foundries",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: /Our favorite type foundries/ })
    .first()
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Our favorite type foundries",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Back to forum", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Posts in #resources" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Deselect thread: Our favorite type foundries",
      exact: true,
    }),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/forum.png" });
});

test("light account theme stays applied through export and the themed folder picker", async () => {
  await sample();
  const tokens = themeVariables({ source: "discord", base: "light" });
  await page.evaluate((tokens) => {
    for (const [name, value] of Object.entries(tokens))
      document.documentElement.style.setProperty(name, value);
    document.documentElement.dataset.baseTheme = "light";
    document.documentElement.style.colorScheme = "light";
  }, tokens);
  expect(
    await page.evaluate(
      () =>
        getComputedStyle(document.querySelector(".conversation")!)
          .backgroundColor,
    ),
  ).toBe("rgb(251, 251, 251)");
  await expect(page.locator(".author-name").first()).toHaveCSS(
    "color",
    "rgb(46, 46, 52)",
  );
  await expect(page.locator(".server-heading > button").first()).toHaveCSS(
    "color",
    "rgb(46, 46, 52)",
  );
  await page.screenshot({ path: "artifacts/light-browser.png" });
  await page
    .getByRole("button", { name: "Select message:", exact: false })
    .first()
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Continue to save", exact: true })
    .click();
  await page.getByRole("button", { name: "Save export", exact: true }).click();
  await page.getByLabel("Folder path").fill(folder);
  await page.getByLabel("Go to folder", { exact: true }).click();
  await expect(page.locator(".folder-picker .loading-state")).toBeHidden();
  expect(
    await page.evaluate(
      () =>
        getComputedStyle(document.querySelector(".folder-picker")!)
          .backgroundColor,
    ),
  ).toBe("rgb(251, 251, 251)");
  await page.screenshot({ path: "artifacts/light-picker.png" });
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
});

test("account appearance and rounded server icons load with full image coverage and failure fallback", async () => {
  // Fake only the main-process HTTP boundary. This exercises consent, IPC,
  // settings decoding and renderer image handling without a real credential.
  await app.evaluate(() => {
    globalThis.fetch = (async (input: string | URL | Request) => {
      const route = new URL(String(input)).pathname.replace("/api/v10", "");
      const guilds = [
        { id: "20001", name: "Animated server", icon: "a_test", owner: true },
        { id: "20002", name: "Failed image", icon: "missing", owner: true },
        { id: "20003", name: "No image", owner: true },
      ];
      const payload =
        route === "/users/@me"
          ? { id: "10001", username: "sample" }
          : route === "/users/@me/guilds"
            ? guilds
            : route === "/users/@me/settings-proto/1"
              ? { settings: "agIIAg==" }
              : route === "/guilds/20001"
                ? guilds[0]
                : route.includes("/members/")
                  ? { roles: [] }
                  : [];
      return new Response(JSON.stringify(payload), { status: 200 });
    }) as typeof fetch;
  });
  const logo = await readFile(path.resolve("public/logo.png"));
  await page.route("https://cdn.discordapp.com/icons/**", async (route) => {
    if (route.request().url().includes("/20001/"))
      await route.fulfill({ body: logo, contentType: "image/png" });
    else await route.abort();
  });
  await page
    .getByLabel("Discord token", { exact: true })
    .fill("local-test-credential");
  await page.getByText("I own this account", { exact: false }).click();
  await page
    .getByText("I understand Discord’s policy", { exact: false })
    .click();
  await page
    .getByRole("button", { name: "Connect to Discord", exact: true })
    .click();
  const server = page.getByRole("button", {
    name: "Open server Animated server",
    exact: true,
  });
  const icon = server.locator("img");
  await expect(icon).toBeVisible();
  await expect
    .poll(() => icon.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  const geometry = await icon.evaluate((img) => ({
    width: img.getBoundingClientRect().width,
    height: img.getBoundingClientRect().height,
    radius: getComputedStyle(img).borderRadius,
  }));
  expect(geometry).toEqual({ width: 44, height: 44, radius: "13px" });
  await expect(
    page.getByRole("button", { name: "Open server Failed image", exact: true }),
  ).toHaveText("Fi");
  await expect(
    page.getByRole("button", { name: "Open server No image", exact: true }),
  ).toHaveText("Ni");
  await expect(page.locator("html")).toHaveAttribute(
    "data-base-theme",
    "light",
  );
  await expect(page.locator(".server-heading > button").first()).toHaveCSS(
    "color",
    "rgb(46, 46, 52)",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await server.hover();
  await expect(icon).toHaveAttribute("src", /\.gif\?size=128$/);
  await page
    .getByRole("button", { name: "Sync Discord theme", exact: true })
    .hover();
  await expect(icon).toHaveAttribute("src", /\.png\?size=128$/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await server.hover();
  await expect(icon).toHaveAttribute("src", /\.png\?size=128$/);
  await page.screenshot({
    path: "artifacts/server-icons.png",
    animations: "disabled",
  });
});
