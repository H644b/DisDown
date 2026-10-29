import { build } from "esbuild";
await build({
  entryPoints: ["src/main/index.ts"],
  outfile: "dist-electron/main/index.cjs",
  bundle: true,
  platform: "node",
  format: "cjs",
  external: ["electron", "archiver"],
  sourcemap: true,
});
await build({
  entryPoints: ["src/preload/index.ts"],
  outfile: "dist-electron/preload/index.cjs",
  bundle: true,
  platform: "node",
  format: "cjs",
  external: ["electron"],
});
