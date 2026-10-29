import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(site, 'site.config.json');
const config = JSON.parse(await readFile(configPath, 'utf8'));
const input = process.argv[2] || config.origin;
let url;
try { url = new URL(input); } catch { throw new Error('Provide a public HTTPS origin, for example: npm run set-origin -- https://your-domain.example'); }
if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
  throw new Error('The website origin must be HTTPS with no credentials, path, query, or fragment.');
}
const origin = url.origin;
const htmlPath = path.join(site, 'dist/index.html');
let html = await readFile(htmlPath, 'utf8');
const replacements = [
  [/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${origin}/">`],
  [/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${origin}/assets/social-preview.png">`],
  [/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${origin}/assets/social-preview.png">`],
  [/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${origin}/">`],
];
for (const [pattern, replacement] of replacements) {
  if (!pattern.test(html)) throw new Error(`The metadata field is missing: ${replacement.split(' content=')[0]}`);
  html = html.replace(pattern, replacement);
}
await writeFile(htmlPath, html);
await writeFile(configPath, JSON.stringify({ ...config, origin }, null, 2) + '\n');
console.log(`Canonical and social metadata now use ${origin}`);
