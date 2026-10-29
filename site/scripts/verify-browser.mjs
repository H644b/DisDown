import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const capture = process.argv.includes('--capture');
const base = (process.env.DISDOWN_SITE_URL || 'http://127.0.0.1:4178').replace(/\/$/, '');
const review = path.join(site, '.impeccable/review');
await mkdir(review, { recursive: true });
const knownChromium = '/Users/timurradjabov/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const configuredBrowser = process.env.DISDOWN_BROWSER_EXECUTABLE;
if (configuredBrowser && !existsSync(configuredBrowser)) throw new Error('DISDOWN_BROWSER_EXECUTABLE does not exist.');
const browserExecutable = configuredBrowser || (existsSync(chromium.executablePath()) ? chromium.executablePath() : existsSync(knownChromium) ? knownChromium : undefined);
const browser = await chromium.launch(browserExecutable ? { executablePath: browserExecutable, headless: true } : { channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [], failures = [], checks = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(base)) failures.push(`${response.status()} ${response.url()}`); });
const assert = (condition, label) => { if (!condition) throw new Error(label); checks.push(label); };
await page.goto(base, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
assert(await page.locator('h1').innerText() === 'Keep the good\nconversations.', 'First viewport states the product proposition');
assert(await page.locator('a[href="#download"]').count() >= 2, 'Primary download navigation present');

for (const theme of ['dark', 'light', 'twilight']) {
  await page.evaluate(theme => { document.documentElement.dataset.theme = theme; localStorage.setItem('disdown-site-theme', theme); }, theme);
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    for (const image of document.images) image.loading = 'eager';
    for (const frame of document.querySelectorAll('iframe')) frame.loading = 'eager';
    await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
  });
  assert(await page.locator('#product-image').getAttribute('src') === ({ dark: 'assets/browser.webp', light: 'assets/light-browser.webp', twilight: 'assets/blurple-browser.webp' })[theme], `${theme}: corresponding real product screenshot`);
  for (const width of [360, 390, 768, 900, 1280, 1440, 1600]) {
    await page.setViewportSize({ width, height: width < 640 ? 844 : 1000 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme}: no horizontal overflow at ${width}px`);
  }
  if (capture) {
    await page.setViewportSize({ width: 1440, height: 1000 }); await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(250);
    await page.locator('#html-sample').scrollIntoViewIfNeeded();
    await page.frameLocator('#html-sample').locator('h1').waitFor();
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(review, theme === 'dark' ? 'desktop.png' : `desktop-${theme}.png`), fullPage: true, animations: 'disabled' });
    await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(review, theme === 'dark' ? 'mobile.png' : `mobile-${theme}.png`), fullPage: true, animations: 'disabled' });
  }
}

await page.setViewportSize({ width: 1440, height: 1000 });
await page.evaluate(() => scrollTo(0, 0));
await page.locator('.appearance-menu summary').click();
await page.locator('.appearance-options [data-theme-choice="light"]').click();
await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
await page.waitForTimeout(550);
assert(await page.evaluate(() => localStorage.getItem('disdown-site-theme')) === 'light', 'Appearance control persists chosen theme');
await page.reload({ waitUntil: 'networkidle' });
assert(await page.locator('html').getAttribute('data-theme') === 'light', 'Appearance persists after reload');
await page.locator('.appearance-menu summary').click();
await page.locator('.appearance-options [data-theme-choice="light"]').focus();
await page.keyboard.press('Enter');
assert(await page.locator('.appearance-menu summary').evaluate(element => element === document.activeElement), 'Selecting the current appearance restores menu focus');
assert(await page.locator('#format-panel').evaluate(element => getComputedStyle(element).getPropertyValue('--focus').trim()) === '#fff', 'Format showcase uses a contrasting white focus outline');

for (const format of ['json', 'csv', 'md', 'txt', 'html']) {
  await page.locator(`[data-format="${format}"]`).click();
  if (format !== 'html') await page.waitForFunction(() => !document.querySelector('#code-sample').hasAttribute('aria-busy'));
  assert(await page.locator('#sample-download').getAttribute('href') === `assets/samples/disdown-sample.${format}`, `${format}: matching sample download`);
  if (format !== 'html') assert((await page.locator('#code-sample').innerText()).includes('DisDown') || format === 'csv', `${format}: real sample preview loaded`);
}
await page.locator('#tab-html').focus(); await page.keyboard.press('ArrowDown');
assert(await page.locator('#tab-json').getAttribute('aria-selected') === 'true', 'Format tabs support keyboard arrows');
await page.locator('#tab-json').press('End');
assert(await page.locator('#tab-txt').getAttribute('aria-selected') === 'true', 'Format tabs support End key');
await page.locator('.faq details').first().locator('summary').click();
assert(await page.locator('.faq details').first().getAttribute('open') !== null, 'FAQ disclosure opens');

await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => scrollTo(0, 0));
await page.locator('.mobile-menu summary').click();
await page.locator('.mobile-menu a[href="#download"]').click();
assert(await page.locator('.mobile-menu').getAttribute('open') === null, 'Mobile navigation closes after choosing a section');
await page.waitForTimeout(400);
assert(await page.evaluate(() => location.hash) === '#download', 'Mobile download link reaches download section');
await page.locator('.appearance-menu summary').click(); await page.keyboard.press('Escape');
assert(await page.locator('.appearance-menu').getAttribute('open') === null, 'Appearance menu supports Escape');

await page.emulateMedia({ reducedMotion: 'reduce' });
await page.evaluate(() => document.documentElement.style.removeProperty('scroll-behavior'));
await page.locator('.appearance-menu summary').click();
await page.locator('.appearance-options [data-theme-choice="dark"]').click();
await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
assert(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'Reduced motion disables smooth scrolling');

const localLinks = await page.locator('a[href^="assets/"]').evaluateAll(nodes => [...new Set(nodes.map(node => node.href))]);
for (const href of localLinks) assert((await context.request.get(href)).ok(), `Local downloadable artifact returns 200: ${new URL(href).pathname}`);
await page.goto(`${base}/404.html`, { waitUntil: 'networkidle' });
assert(await page.locator('html').getAttribute('data-theme') === 'dark', 'Recovery page applies persisted Dark appearance');
await page.evaluate(() => localStorage.setItem('disdown-site-theme', 'twilight'));
await page.reload({ waitUntil: 'networkidle' });
assert(await page.locator('html').getAttribute('data-theme') === 'twilight', 'Recovery page applies persisted Twilight appearance');
await page.evaluate(() => localStorage.removeItem('disdown-site-theme'));
await page.emulateMedia({ colorScheme: 'light' });
await page.reload({ waitUntil: 'networkidle' });
assert(await page.locator('html').getAttribute('data-theme') === 'light', 'Recovery page applies system Light appearance');
assert(errors.length === 0, 'No browser JavaScript errors'); assert(failures.length === 0, 'No failed same-origin resources');
const report = { checkedAt: new Date().toISOString(), checks: checks.length, results: checks, errors, failures, screenshotSet: capture ? ['desktop.png','mobile.png','desktop-light.png','mobile-light.png','desktop-twilight.png','mobile-twilight.png'] : [] };
await writeFile(path.join(review, 'browser-verification.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ checks: checks.length, errors, failures, captured: capture }, null, 2));
await browser.close();
