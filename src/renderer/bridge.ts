import type { DisdownBridge } from "../shared/types";
import { DemoClient } from "../shared/demo";
declare global {
  interface Window {
    disdown?: DisdownBridge;
  }
}
const sample = new DemoClient();
const desktopOnly = async (): Promise<any> => {
  throw new Error(
    "Open the DisDown desktop app to use your filesystem or connect a token. This browser is a sample-data preview.",
  );
};
export const bridge: DisdownBridge = window.disdown || {
  platform: "browser",
  appearance: () => sample.appearance(),
  session: async () => sample.info,
  demo: async () => sample.info,
  connect: desktopOnly,
  disconnect: async () => {},
  guild: (id) => sample.guild(id),
  messages: (id, before) => sample.messages(id, before),
  threads: (c) => sample.threads(c),
  threadPage: (c) => sample.threadPage(c),
  profile: (id) => sample.profile(id),
  reactionUsers: () => sample.reactionUsers(),
  browse: desktopOnly,
  mkdir: desktopOnly,
  exists: desktopOnly,
  export: desktopOnly,
  cancel: async () => {},
  onProgress: () => () => {},
  openPath: desktopOnly,
  openExternal: async (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  },
};
