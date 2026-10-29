import { app, BrowserWindow, ipcMain, shell, session } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { DiscordClient, type DataClient, id } from "./discord";
import { DemoClient } from "../shared/demo";
import { browse, createDirectory, exists } from "./filesystem";
import { exportArchive, clean } from "./exporter";
import type { Channel, ExportRequest, ThreadPage } from "../shared/types";
let client: DataClient | undefined;
let controller: AbortController | undefined;
let window: BrowserWindow;
let lastSaved = "";
const devUrl = process.env.DISDOWN_DEV_URL;
if (devUrl && new URL(devUrl).origin !== "http://127.0.0.1:5173")
  throw new Error("Invalid development origin.");
function active() {
  if (!client) throw new Error("Connect to Discord or open sample data first.");
  return client;
}
function handle(name: string, fn: (...args: any[]) => unknown) {
  ipcMain.handle(`disdown:${name}`, async (event, ...args) => {
    const url = event.senderFrame?.url;
    if (
      event.sender !== window.webContents ||
      event.senderFrame !== window.webContents.mainFrame ||
      !url ||
      (devUrl
        ? new URL(url).origin !== new URL(devUrl).origin
        : url !==
          pathToFileURL(path.join(__dirname, "../../dist/index.html")).href)
    )
      throw new Error("Untrusted application window.");
    return fn(...args);
  });
}
async function createWindow() {
  window = new BrowserWindow({
    show: process.env.DISDOWN_TEST_HEADLESS !== "1",
    width: 1480,
    height: 960,
    minWidth: 1000,
    minHeight: 680,
    title: "DisDown",
    backgroundColor: "#25262c",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 18, y: 18 },
    autoHideMenuBar: true,
    icon: path.join(__dirname, "../../dist/logo.png"),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: false,
      backgroundThrottling: false,
    },
  });
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.on("will-navigate", (event) => event.preventDefault());
  window.webContents.on("will-attach-webview", (event) =>
    event.preventDefault(),
  );
  window.on("closed", () => {
    client?.disconnect();
    client = undefined;
    controller?.abort();
  });
  if (devUrl) await window.loadURL(devUrl);
  else await window.loadFile(path.join(__dirname, "../../dist/index.html"));
}
app.whenReady().then(async () => {
  session.defaultSession.setPermissionRequestHandler(
    (_wc, _permission, callback) => callback(false),
  );
  session.defaultSession.setPermissionCheckHandler(() => false);
  handle(
    "connect",
    async (input: {
      token: string;
      mode: "user" | "bot";
      consent: boolean;
      policyAccepted: boolean;
    }) => {
      if (controller)
        throw new Error("Cancel the current export before switching accounts.");
      if (
        !input ||
        typeof input.token !== "string" ||
        !["user", "bot"].includes(input.mode) ||
        input.consent !== true ||
        (input.mode === "user" && input.policyAccepted !== true)
      )
        throw new Error(
          "Explicit consent and policy acknowledgement are required before connecting.",
        );
      client?.disconnect();
      client = undefined;
      const next = new DiscordClient(input.token, input.mode);
      try {
        const info = await next.connect();
        client = next;
        return info;
      } catch (e) {
        next.disconnect();
        throw e;
      }
    },
  );
  handle("session", () => (client ? clean(client.info) : null));
  handle("demo", () => {
    if (controller) throw new Error("Cancel the export first.");
    client?.disconnect();
    client = new DemoClient();
    return client.info;
  });
  handle("disconnect", () => {
    controller?.abort();
    client?.disconnect();
    client = undefined;
  });
  handle("guild", (value: string) => active().guild(id(value)));
  handle("messages", (value: string, before?: string) =>
    active().messages(id(value), before ? id(before) : undefined),
  );
  handle("threads", (channel: Channel) => {
    id(channel.id);
    if (channel.guild_id) id(channel.guild_id);
    return active().threads(channel);
  });
  handle("threadPage", (channel: Channel, cursor?: ThreadPage["cursor"]) => {
    id(channel.id);
    if (channel.guild_id) id(channel.guild_id);
    if (
      cursor &&
      (typeof cursor.archived !== "boolean" ||
        !Number.isInteger(cursor.offset) ||
        cursor.offset < 0)
    )
      throw new Error("Invalid thread page.");
    return active().threadPage(channel, cursor);
  });
  handle("profile", (value: string, guildId?: string) =>
    active().profile(id(value), guildId ? id(guildId) : undefined),
  );
  handle("reactionUsers", (channel: string, message: string, emoji: string) => {
    if (typeof emoji !== "string" || emoji.length > 150)
      throw new Error("Invalid emoji.");
    return active().reactionUsers(id(channel), id(message), emoji);
  });
  handle("browse", browse);
  handle("mkdir", createDirectory);
  handle("exists", exists);
  handle("export", async (request: ExportRequest) => {
    if (controller) throw new Error("An export is already running.");
    const data = active();
    controller = new AbortController();
    try {
      const result = await exportArchive(
        data,
        request,
        controller.signal,
        (p) => {
          if (!window.isDestroyed())
            window.webContents.send("disdown:progress", p);
        },
      );
      lastSaved = result.path;
      return result;
    } finally {
      controller = undefined;
    }
  });
  handle("cancel", () => controller?.abort());
  handle("openPath", async (value: string) => {
    if (!lastSaved || value !== lastSaved)
      throw new Error("Only the last saved archive can be revealed.");
    shell.showItemInFolder(value);
  });
  handle("openExternal", async (value: string) => {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol))
      throw new Error("Only web links can be opened.");
    await shell.openExternal(url.href);
  });
  await createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow();
  });
});
app.on("window-all-closed", () => {
  client?.disconnect();
  if (process.platform !== "darwin") app.quit();
});
