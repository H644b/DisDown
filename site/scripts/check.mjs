import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const { origin } = JSON.parse(await readFile(path.join(root, '../site.config.json'), 'utf8'));
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const issues = [];
for (const expected of [
  `<meta property="og:url" content="${origin}/">`,
  `<meta property="og:image" content="${origin}/assets/social-preview.png">`,
  `<meta name="twitter:image" content="${origin}/assets/social-preview.png">`,
  `<link rel="canonical" href="${origin}/">`,
]) if (!html.includes(expected)) issues.push('Public origin metadata does not match site.config.json; run npm run set-origin.');
if (new Set(ids).size !== ids.length) issues.push('Duplicate HTML ids');
for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  const target = match[1];
  if (target === '#') continue;
  if (target.startsWith('#')) { if (!ids.includes(target.slice(1))) issues.push(`Missing anchor ${target}`); continue; }
  if (/^https?:/.test(target)) continue;
  const file = path.resolve(root, target.split(/[?#]/)[0]);
  try { if (!(await stat(file)).isFile()) issues.push(`Invalid local target ${target}`); }
  catch { issues.push(`Missing local target ${target}`); }
}
const check = spawnSync(process.execPath, ['--check', path.join(root, 'main.js')], { encoding: 'utf8' });
if (check.status !== 0) issues.push(check.stderr);
if (!html.includes('User-token mode carries account risk.')) issues.push('Missing account risk decision copy');
if (!html.includes('Sample data')) issues.push('Missing sample data label');
if (/<input\b/i.test(html)) issues.push('Website unexpectedly contains an input');
if (issues.length) { console.error(issues.join('\n')); process.exit(1); }
console.log(`Passed: JavaScript syntax, unique ids, ${[...html.matchAll(/(?:href|src)="([^"]+)"/g)].length} asset/link references, required decision copy, and no credential inputs.`);
