const root = document.documentElement;
const themes = ['light', 'dark', 'twilight'];
const themeNames = { light: 'Light', dark: 'Dark', twilight: 'Blurple Twilight' };
const themeImages = { light: 'assets/light-browser.webp', dark: 'assets/browser.webp', twilight: 'assets/blurple-browser.webp' };
const themeColors = { light: '#fbfbfb', dark: '#202024', twilight: '#141333' };
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const announcement = document.querySelector('#site-announcement');
const productImage = document.querySelector('#product-image');
const imageCache = new Map();
let changingTheme = false;

function syncThemeControls(theme) {
  document.querySelectorAll('[data-theme-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme)));
  document.querySelector('.appearance-icon use').setAttribute('href', `#i-${theme === 'light' ? 'sun' : theme === 'dark' ? 'moon' : 'twilight'}`);
  document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColors[theme]);
  productImage.src = themeImages[theme];
}
syncThemeControls(themes.includes(root.dataset.theme) ? root.dataset.theme : 'dark');

async function setTheme(theme, event) {
  const menu = document.querySelector('.appearance-menu');
  const returnFocus = menu.contains(event?.target);
  if (!themes.includes(theme) || changingTheme || root.dataset.theme === theme) {
    menu.removeAttribute('open');
    if (returnFocus) menu.querySelector('summary').focus({ preventScroll: true });
    return;
  }
  changingTheme = true;
  if (!imageCache.has(theme)) {
    const image = new Image(); image.src = themeImages[theme];
    imageCache.set(theme, image.decode().catch(() => {}));
  }
  await imageCache.get(theme);
  const apply = () => {
    root.dataset.theme = theme;
    syncThemeControls(theme);
    try { localStorage.setItem('disdown-site-theme', theme); } catch {}
    announcement.textContent = `${themeNames[theme]} appearance selected.`;
  };
  menu.removeAttribute('open');
  if (returnFocus) menu.querySelector('summary').focus({ preventScroll: true });
  if (document.startViewTransition && !reducedMotion.matches) {
    const transition = document.startViewTransition(apply);
    try {
      await transition.ready;
      const x = event?.clientX || innerWidth / 2;
      const y = event?.clientY || 60;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] }, { duration: 460, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' });
      await transition.finished;
    } catch {}
  } else { apply(); }
  changingTheme = false;
}
document.querySelectorAll('[data-theme-choice]').forEach(button => button.addEventListener('click', event => setTheme(button.dataset.themeChoice, event)));
document.querySelector('[data-cycle-theme]').addEventListener('click', event => setTheme(themes[(themes.indexOf(root.dataset.theme) + 1) % themes.length], event));

document.addEventListener('click', event => {
  for (const selector of ['.appearance-menu', '.mobile-menu']) {
    const menu = document.querySelector(selector);
    if (!menu.contains(event.target)) menu.removeAttribute('open');
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') document.querySelectorAll('.appearance-menu[open],.mobile-menu[open]').forEach(menu => { menu.removeAttribute('open'); menu.querySelector('summary').focus(); });
});
document.querySelectorAll('.mobile-menu a').forEach(link => link.addEventListener('click', () => document.querySelector('.mobile-menu').removeAttribute('open')));

const formats = {
  html: { name: 'HTML', description: 'A self-contained, readable record that opens in your browser. No scripts or remote media.' },
  json: { name: 'JSON', description: 'Structured messages and metadata, ready for tools, queries, and future projects.' },
  csv: { name: 'CSV', description: 'Rows for a spreadsheet, with content and details preserved in their own columns.' },
  md: { name: 'Markdown', description: 'Readable text with headings, ready for notes, documentation, and knowledge bases.' },
  txt: { name: 'plain text', description: 'An ordinary text file. Easy to open, easy to keep, with no special reader needed.' },
};
const formatTabs = [...document.querySelectorAll('[data-format]')];
const codePreview = document.querySelector('#code-sample');
const htmlPreview = document.querySelector('#html-sample');
const sampleError = document.querySelector('#sample-error');
const sampleCache = new Map();
let formatRequest = 0;
async function setFormat(format, moveFocus = false) {
  const request = ++formatRequest;
  const config = formats[format];
  const selected = document.querySelector(`[data-format="${format}"]`);
  formatTabs.forEach(tab => {
    const active = tab === selected;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  if (moveFocus) selected.focus();
  document.querySelector('#format-panel').setAttribute('aria-labelledby', selected.id);
  document.querySelector('#sample-filename').textContent = `disdown-sample.${format}`;
  document.querySelector('#format-description').textContent = config.description;
  const download = document.querySelector('#sample-download');
  download.href = `assets/samples/disdown-sample.${format}`;
  download.innerHTML = `Download ${config.name} sample<svg class="icon" aria-hidden="true"><use href="#i-download"/></svg>`;
  htmlPreview.hidden = format !== 'html';
  codePreview.hidden = format === 'html';
  sampleError.hidden = true;
  if (format !== 'html') {
    codePreview.textContent = 'Loading sample…';
    codePreview.setAttribute('aria-busy', 'true');
    try {
      if (!sampleCache.has(format)) sampleCache.set(format, fetch(`assets/samples/disdown-sample.${format}`).then(response => { if (!response.ok) throw new Error('Sample unavailable'); return response.text(); }));
      const content = await sampleCache.get(format);
      if (request !== formatRequest) return;
      codePreview.textContent = content;
      codePreview.scrollTo(0, 0);
    } catch {
      if (request !== formatRequest) return;
      sampleCache.delete(format); codePreview.hidden = true; sampleError.hidden = false;
    } finally { if (request === formatRequest) codePreview.removeAttribute('aria-busy'); }
  }
  if (!reducedMotion.matches) document.querySelector('.artifact-preview').animate([{ opacity: .65, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 240, easing: 'cubic-bezier(.16,1,.3,1)' });
}
formatTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => setFormat(tab.dataset.format));
  tab.addEventListener('keydown', event => {
    let next;
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % formatTabs.length;
    if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index - 1 + formatTabs.length) % formatTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = formatTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); setFormat(formatTabs[next].dataset.format, true); }
  });
});
const formatMedia = matchMedia('(max-width: 640px)');
const setFormatOrientation = () => document.querySelector('[role="tablist"]').setAttribute('aria-orientation', formatMedia.matches ? 'horizontal' : 'vertical');
setFormatOrientation(); formatMedia.addEventListener('change', setFormatOrientation);
