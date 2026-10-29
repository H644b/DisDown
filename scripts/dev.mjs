import { spawn } from "node:child_process";
import { createServer } from "vite";
await import("./build-electron.mjs");
const server = await createServer({
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
});
await server.listen();
const electron = spawn((await import("electron")).default, ["."], {
  stdio: "inherit",
  env: { ...process.env, DISDOWN_DEV_URL: "http://127.0.0.1:5173" },
});
electron.on("exit", async () => {
  await server.close();
  process.exit();
});
process.on("SIGINT", () => electron.kill());
