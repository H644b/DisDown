import { readdir, stat, mkdir, access, realpath } from "node:fs/promises";
import { homedir, platform } from "node:os";
import path from "node:path";
import type { DirectoryListing } from "../shared/types";
export function validName(name: string): string {
  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.length > 180 ||
    /[<>:"/\\|?*\x00-\x1f]/.test(name) ||
    /\.$|\s$/.test(name) ||
    name === "." ||
    name === ".." ||
    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(name)
  )
    throw new Error(
      "Choose a valid file or folder name without reserved characters.",
    );
  return name;
}
export async function directoryPath(input: string) {
  if (typeof input !== "string" || !path.isAbsolute(input))
    throw new Error("Choose an absolute folder path.");
  const resolved = await realpath(input);
  if (!(await stat(resolved)).isDirectory())
    throw new Error("Choose a folder.");
  return resolved;
}
export async function browse(input = homedir()): Promise<DirectoryListing> {
  const current = await directoryPath(input);
  const home = homedir();
  const shortcuts = [
    { name: "Home", path: home },
    ...["Desktop", "Documents", "Downloads"].map((name) => ({
      name,
      path: path.join(home, name),
    })),
    {
      name: platform() === "win32" ? "System drive" : "Computer",
      path: path.parse(home).root,
    },
  ];
  if (platform() === "darwin")
    shortcuts.push({ name: "Volumes", path: "/Volumes" });
  if (platform() === "win32")
    for (const drive of "DEFGHIJKLMNOPQRSTUVWXYZ")
      try {
        await access(`${drive}:\\`);
        shortcuts.push({ name: `${drive}:`, path: `${drive}:\\` });
      } catch {}
  const available = [];
  for (const shortcut of shortcuts)
    try {
      await access(shortcut.path);
      available.push(shortcut);
    } catch {}
  const entries = (await readdir(current, { withFileTypes: true }))
    .filter((e) => !e.name.startsWith(".") && (e.isDirectory() || e.isFile()))
    .map((e) => ({
      name: e.name,
      path: path.join(current, e.name),
      directory: e.isDirectory(),
    }))
    .sort(
      (a, b) =>
        Number(b.directory) - Number(a.directory) ||
        a.name.localeCompare(b.name),
    );
  return {
    path: current,
    parent: path.dirname(current) === current ? null : path.dirname(current),
    entries,
    shortcuts: available,
  };
}
export async function createDirectory(parent: string, name: string) {
  const root = await directoryPath(parent);
  await mkdir(path.join(root, validName(name)));
  return browse(root);
}
export async function destination(directory: string, filename: string) {
  return path.join(await directoryPath(directory), validName(filename));
}
export async function exists(directory: string, filename: string) {
  try {
    await access(await destination(directory, filename));
    return true;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw e;
  }
}
