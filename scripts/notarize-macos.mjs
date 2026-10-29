import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { parseArgs } from "node:util";
import { signAsync } from "@electron/osx-sign";
import { Arch, Platform, build } from "electron-builder";

const exec = promisify(execFile);
const project = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const { values } = parseArgs({
  options: {
    input: { type: "string" },
    output: { type: "string" },
    identity: { type: "string" },
    resume: { type: "boolean", default: false },
    "timeout-minutes": { type: "string", default: "60" },
    "preflight-only": { type: "boolean", default: false },
  },
});
const pkg = JSON.parse(
  await readFile(path.join(project, "package.json"), "utf8"),
);
const input = path.resolve(
  values.input || path.join(project, "release", `publish-${pkg.version}`),
);
const output = path.resolve(
  values.output || path.join(project, "release", `notarized-${pkg.version}`),
);
const timeout = Number(values["timeout-minutes"]) * 60000;
if (process.platform !== "darwin")
  throw new Error("Signing and stapling require macOS.");
if (!Number.isFinite(timeout) || timeout < 60000)
  throw new Error("Invalid notarization timeout.");

async function run(command, args, options = {}) {
  return exec(command, args, {
    cwd: project,
    maxBuffer: 16 * 1024 * 1024,
    ...options,
  });
}
async function sha256(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const credentialArgs = [];
if (process.env.APPLE_KEYCHAIN_PROFILE) {
  credentialArgs.push("--keychain-profile", process.env.APPLE_KEYCHAIN_PROFILE);
  if (process.env.APPLE_KEYCHAIN)
    credentialArgs.push("--keychain", process.env.APPLE_KEYCHAIN);
} else if (process.env.APPLE_API_KEY && process.env.APPLE_API_KEY_ID) {
  await access(process.env.APPLE_API_KEY);
  credentialArgs.push(
    "--key",
    process.env.APPLE_API_KEY,
    "--key-id",
    process.env.APPLE_API_KEY_ID,
  );
  if (process.env.APPLE_API_ISSUER)
    credentialArgs.push("--issuer", process.env.APPLE_API_ISSUER);
} else {
  throw new Error(
    "Set APPLE_KEYCHAIN_PROFILE or local APPLE_API_KEY and APPLE_API_KEY_ID; team keys also need APPLE_API_ISSUER.",
  );
}
async function notary(command, args = []) {
  try {
    const { stdout } = await run("xcrun", [
      "notarytool",
      command,
      ...args,
      ...credentialArgs,
      "--output-format",
      "json",
    ]);
    return JSON.parse(stdout);
  } catch {
    // Do not echo credential arguments or authentication responses into public logs.
    throw new Error(
      `Apple notarytool ${command} failed. Check credentials, network access, and the saved submission ID.`,
    );
  }
}
const identities = (
  await run("security", ["find-identity", "-v", "-p", "codesigning"])
).stdout;
const candidates = [
  ...identities.matchAll(
    /([A-F0-9]{40}) "(Developer ID Application: [^"\n]+)"/g,
  ),
]
  .map((match) => ({ hash: match[1], name: match[2] }))
  .filter(
    (identity) =>
      !values.identity ||
      identity.name.includes(values.identity) ||
      identity.hash === values.identity,
  );
if (candidates.length !== 1)
  throw new Error(
    "Select exactly one valid Developer ID Application identity with --identity. App Store and ad-hoc certificates are not accepted.",
  );
const identity = candidates[0];
const team = identity.name.match(/\(([A-Z0-9]{10})\)$/)?.[1];
if (!team)
  throw new Error("The signing identity has no Apple team identifier.");
await run("xcrun", ["--find", "notarytool"]);
await run("xcrun", ["--find", "stapler"]);
await notary("history");
console.log(
  `Developer ID and notarization authentication verified for team ${team}.`,
);
if (values["preflight-only"]) process.exit(0);

const sums = new Map(
  (await readFile(path.join(input, "SHA256SUMS.txt"), "utf8"))
    .trim()
    .split("\n")
    .map((line) => {
      const [hash, name] = line.split("  ");
      return [name, hash];
    }),
);
await mkdir(output, { recursive: true });
const reportPath = path.join(output, "notarization-report.json");
let report;
try {
  report = JSON.parse(await readFile(reportPath, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
if (report && !values.resume)
  throw new Error(
    "A notarization report already exists; use --resume to continue its submissions.",
  );
report ||= {
  version: pkg.version,
  team,
  signingIdentity: identity.name,
  signingHash: identity.hash,
  complete: false,
  architectures: {},
};
if (report.version !== pkg.version || report.signingHash !== identity.hash)
  throw new Error("The resumed version or signing identity differs.");
let saving = Promise.resolve();
function save() {
  const text = JSON.stringify(report, null, 2) + "\n";
  saving = saving.then(() => writeFile(reportPath, text, { mode: 0o600 }));
  return saving;
}
async function verifyApp(app, expectedAsar) {
  await run("codesign", ["--verify", "--deep", "--strict", app]);
  const { stderr } = await run("codesign", ["-d", "--verbose=4", app]);
  if (
    !stderr.includes(`Authority=${identity.name}`) ||
    !stderr.includes(`TeamIdentifier=${team}`) ||
    !/flags=.*runtime/.test(stderr) ||
    !/^Timestamp=/m.test(stderr)
  ) {
    throw new Error(
      "The app lacks the expected Developer ID, hardened runtime, or secure timestamp.",
    );
  }
  if (
    (await sha256(path.join(app, "Contents/Resources/app.asar"))) !==
    expectedAsar
  )
    throw new Error("Application code changed during signing or packaging.");
}
async function staple(target) {
  for (let attempt = 0; ; attempt++) {
    try {
      await run("xcrun", ["stapler", "staple", target]);
      await run("xcrun", ["stapler", "validate", target]);
      return;
    } catch (error) {
      if (attempt >= 3) throw error;
      await pause(5000);
    }
  }
}
async function accepted(arch, role, file) {
  const state = report.architectures[arch];
  if (!state[role]) {
    const submission = await notary("submit", [file]);
    if (!submission.id) throw new Error("Apple returned no submission ID.");
    state[role] = {
      id: submission.id,
      status: submission.status,
      file: path.basename(file),
    };
    await save();
    console.log(`${arch} ${role}: submitted (${submission.id}).`);
  }
  const submission = state[role],
    deadline = Date.now() + timeout;
  for (;;) {
    const info = await notary("info", [submission.id]);
    if (info.status !== submission.status) {
      submission.status = info.status;
      await save();
      console.log(`${arch} ${role}: ${info.status}.`);
    }
    if (info.status === "Accepted") return;
    if (info.status === "Invalid" || info.status === "Rejected") {
      const log = await notary("log", [submission.id]);
      await writeFile(
        path.join(output, `${arch}-${role}-notary-log.json`),
        JSON.stringify(log, null, 2),
        { mode: 0o600 },
      );
      throw new Error(
        `${arch} ${role} was rejected by Apple; inspect its saved notarization log.`,
      );
    }
    if (Date.now() > deadline)
      throw new Error(
        `Apple is still processing ${arch} ${role}; use --resume to wait on the same submission.`,
      );
    await pause(30000);
  }
}

// Stage both architectures before waiting on Apple's asynchronous service.
for (const arch of ["arm64", "x64"]) {
  const name = `DisDown-${pkg.version}-mac-${arch}.zip`,
    original = path.join(input, name);
  if (!sums.get(name) || (await sha256(original)) !== sums.get(name))
    throw new Error(`Input checksum failed: ${name}`);
  const folder = path.join(output, "work", arch),
    app = path.join(folder, "DisDown.app");
  const state = (report.architectures[arch] ||= {
    inputSha256: sums.get(name),
  });
  if (state.inputSha256 !== sums.get(name))
    throw new Error("The resumed input artifact changed.");
  if (!state.signed) {
    await mkdir(folder, { recursive: true });
    await run("ditto", ["-x", "-k", original, folder]);
    state.asarSha256 = await sha256(
      path.join(app, "Contents/Resources/app.asar"),
    );
    console.log(`${arch}: signing the verified release app.`);
    await signAsync({
      app,
      identity: identity.hash,
      platform: "darwin",
      type: "distribution",
      optionsForFile: () => ({
        entitlements: path.join(project, "build/entitlements.mac.plist"),
        hardenedRuntime: true,
      }),
    });
    await verifyApp(app, state.asarSha256);
    state.signed = true;
    await save();
  }
  await verifyApp(app, state.asarSha256);
  const submitZip = path.join(folder, "notary-upload.zip");
  if (!state.app)
    await run("ditto", [
      "-c",
      "-k",
      "--sequesterRsrc",
      "--keepParent",
      app,
      submitZip,
    ]);
}
const jobs = await Promise.allSettled(
  ["arm64", "x64"].map(async (arch) => {
    const state = report.architectures[arch],
      app = path.join(output, "work", arch, "DisDown.app");
    await accepted(
      arch,
      "app",
      path.join(output, "work", arch, "notary-upload.zip"),
    );
    await staple(app);
    await verifyApp(app, state.asarSha256);
    await run("spctl", ["--assess", "--verbose=2", "--type", "execute", app]);
    state.app.stapled = true;
    state.app.gatekeeperAccepted = true;
    await save();
    if (!state.packaged) {
      // A prepackaged target keeps the already signed/stapled app intact.
      await build({
        projectDir: project,
        prepackaged: app,
        publish: "never",
        targets: Platform.MAC.createTarget(["dmg", "zip"], Arch[arch]),
        config: {
          directories: { output },
          forceCodeSigning: true,
          mac: {
            identity: identity.name.replace(/^Developer ID Application: /, ""),
            notarize: false,
          },
          dmg: { sign: true, writeUpdateInfo: false },
        },
      });
      state.packaged = true;
      await save();
    }
    const dmg = path.join(output, `DisDown-${pkg.version}-mac-${arch}.dmg`);
    await accepted(arch, "dmg", dmg);
    await staple(dmg);
    await run("codesign", ["--verify", "--strict", dmg]);
    await run("spctl", [
      "--assess",
      "--verbose=2",
      "--type",
      "open",
      "--context",
      "context:primary-signature",
      dmg,
    ]);
    state.dmg.stapled = true;
    state.dmg.gatekeeperAccepted = true;
    const unpack = await mkdtemp(path.join(tmpdir(), "disdown-notary-verify-"));
    try {
      const zip = path.join(output, `DisDown-${pkg.version}-mac-${arch}.zip`);
      await run("ditto", ["-x", "-k", zip, unpack]);
      await verifyApp(path.join(unpack, "DisDown.app"), state.asarSha256);
      await run("xcrun", [
        "stapler",
        "validate",
        path.join(unpack, "DisDown.app"),
      ]);
      state.zipTicketVerified = true;
      state.zipSha256 = await sha256(zip);
      state.dmgSha256 = await sha256(dmg);
    } finally {
      await rm(unpack, { recursive: true, force: true });
    }
    await save();
    console.log(
      `${arch}: Developer ID, Apple tickets, Gatekeeper, ZIP ticket, and unchanged app code verified.`,
    );
  }),
);
const failures = jobs.filter((job) => job.status === "rejected");
if (failures.length)
  throw new AggregateError(
    failures.map((job) => job.reason),
    "Notarization incomplete; existing submissions are saved for --resume.",
  );
report.complete = true;
report.completedAt = new Date().toISOString();
await save();
console.log(`Both architectures notarized and verified. Outputs: ${output}`);
