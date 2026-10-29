import { copyFile, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import sharp from 'sharp';
import archiver from 'archiver';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(site, '..');
const assets = path.join(site, 'dist/assets');
await mkdir(path.join(assets, 'fonts'), { recursive: true });
await mkdir(path.join(assets, 'samples'), { recursive: true });
await copyFile(path.join(root, 'public/logo.svg'), path.join(assets, 'logo.svg'));
for (const weight of [400, 500, 600, 700]) {
  const name = `noto-sans-latin-${weight}-normal.woff2`;
  await copyFile(path.join(root, 'node_modules/@fontsource/noto-sans/files', name), path.join(assets, 'fonts', name));
}
await copyFile(path.join(root, 'node_modules/@fontsource/noto-sans/LICENSE'), path.join(assets, 'fonts/LICENSE.txt'));
for (const name of ['browser', 'light-browser', 'blurple-browser', 'options', 'forum']) {
  await sharp(path.join(root, 'docs/screenshots', `${name}.png`))
    .webp({ quality: 92 }).toFile(path.join(assets, `${name}.webp`));
}

// Only the app's fabricated sample workspace is used. No live account is opened.
const modulePath = path.join(site, '.impeccable/sample-serializer.mjs');
await build({
  stdin: {
    contents: `export { serialize } from './src/main/exporter.ts';\nexport { demoMessages, demoUsers } from './src/shared/demo.ts';\nexport { defaultOptions } from './src/shared/types.ts';`,
    resolveDir: root,
    loader: 'ts',
  },
  platform: 'node', format: 'esm', bundle: true, packages: 'external', outfile: modulePath,
});
const { serialize, demoMessages, demoUsers, defaultOptions } = await import(modulePath);
const archive = {
  version: 1, app: 'DisDown', exportedAt: '2026-10-28T12:00:00.000Z',
  account: { id: '10001', username: 'Sample workspace' },
  selection: [{ key: 'channel:30004', kind: 'channel', id: '30004', label: '#general' }],
  options: { ...defaultOptions, packaging: 'file' },
  guilds: [{ id: '20001', name: 'The Commons (sample data)' }],
  channels: [{ id: '30004', name: 'general', type: 0 }],
  messages: demoMessages.slice(0, 2), users: demoUsers.slice(0, 2), items: [],
  warnings: ['This archive contains fabricated sample data. It is not a real Discord conversation.'],
  media: {}, truncated: false,
};
for (const format of ['html', 'json', 'csv', 'md', 'txt']) {
  await writeFile(path.join(assets, 'samples', `disdown-sample.${format}`), serialize({ ...archive, options: { ...archive.options, format } }, format));
}
const stream = createWriteStream(path.join(assets, 'samples/disdown-sample.zip'));
const zip = archiver('zip', { zlib: { level: 9 } });
const finish = new Promise((resolve, reject) => { stream.on('close', resolve); stream.on('error', reject); zip.on('error', reject); });
zip.pipe(stream);
for (const format of ['html', 'json', 'csv', 'md', 'txt']) {
  zip.append(await readFile(path.join(assets, 'samples', `disdown-sample.${format}`)), { name: `disdown-sample.${format}` });
}
zip.append('All content is fabricated sample data from DisDown. This website sampler includes all five standalone formats for comparison; it is not the app ZIP bundle layout.\n', { name: 'README.txt' });
await zip.finalize(); await finish;
await rm(modulePath);
console.log('Prepared original branding, self-hosted fonts, five real app screenshots, and five serializer-generated sample formats.');
