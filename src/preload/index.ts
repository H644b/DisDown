import { contextBridge, ipcRenderer } from "electron";
import type { DisdownBridge, Progress } from "../shared/types";
const invoke = (method: string, ...args: unknown[]) =>
  ipcRenderer.invoke(`disdown:${method}`, ...args);
const bridge: DisdownBridge = {
  platform: process.platform,
  appearance: () => invoke("appearance"),
  session: () => invoke("session"),
  connect: (input) => invoke("connect", input),
  demo: () => invoke("demo"),
  disconnect: () => invoke("disconnect"),
  guild: (id) => invoke("guild", id),
  messages: (id, before) => invoke("messages", id, before),
  threads: (channel) => invoke("threads", channel),
  threadPage: (channel, cursor) => invoke("threadPage", channel, cursor),
  profile: (id, guild) => invoke("profile", id, guild),
  reactionUsers: (channel, message, emoji) =>
    invoke("reactionUsers", channel, message, emoji),
  browse: (path) => invoke("browse", path),
  mkdir: (parent, name) => invoke("mkdir", parent, name),
  exists: (directory, filename) => invoke("exists", directory, filename),
  export: (request) => invoke("export", request),
  cancel: () => invoke("cancel"),
  openPath: (path) => invoke("openPath", path),
  openExternal: (url) => invoke("openExternal", url),
  onProgress: (callback) => {
    const listener = (_: unknown, p: Progress) => callback(p);
    ipcRenderer.on("disdown:progress", listener);
    return () => ipcRenderer.removeListener("disdown:progress", listener);
  },
};
contextBridge.exposeInMainWorld("disdown", bridge);
