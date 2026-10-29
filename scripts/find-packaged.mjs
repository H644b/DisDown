import { existsSync } from "node:fs";
import path from "node:path";
const candidates =
  process.platform === "darwin"
    ? [
        "release/mac-arm64/DisDown.app/Contents/MacOS/DisDown",
        "release/mac/DisDown.app/Contents/MacOS/DisDown",
      ]
    : process.platform === "win32"
      ? ["release/win-unpacked/DisDown.exe"]
      : ["release/linux-unpacked/disdown"];
const executable = candidates.find(existsSync);
if (!executable) throw new Error("Packaged executable missing");
console.log(`DISDOWN_EXECUTABLE=${path.resolve(executable)}`);
