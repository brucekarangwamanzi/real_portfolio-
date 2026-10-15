const path = require('node:path');
const fs = require('node:fs');
let chromium;
try { ({ chromium } = require('playwright')); }
catch {
  try { ({ chromium } = require('playwright-core')); }
  catch { console.error('Browser checks need Playwright. Install it with npm install --no-save playwright, then run npx playwright install chromium.'); process.exit(1); }
}

(async () => {
  const root = path.resolve(__dirname, '..');
  const output = path.join(root, 'exports', 'review');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ ...(process.env.PORTFOLIO_CHROMIUM_PATH ? { executablePath: process.env.PORTFOLIO_CHROMIUM_PATH } : {}), headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const width of [320, 390, 768, 1280, 1440]) {
      await page.setViewportSize({ width, height: 950 });
      await page.goto(require('node:url').pathToFileURL(path.join(root, 'dist', 'index.html')).href);
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(() => ({ viewport: innerWidth, body: document.documentElement.scrollWidth }));
      if (layout.body > width + 1) throw new Error(`Horizontal overflow at ${width}px: ${layout.body}px`);
      await page.locator('.project-open').click();
      if (!(await page.locator('#project-dialog').evaluate(d => d.open))) throw new Error('Project dialog did not open');
      await page.keyboard.press('Escape');
      if (await page.locator('#project-dialog').evaluate(d => d.open)) throw new Error('Project dialog did not close');
      if (await page.locator('a[href="mailto:manzibruce67@gmail.com"]').count() !== 1) throw new Error('Missing contact email');
      if (await page.locator('a[href="tel:+250786260902"]').count() !== 1) throw new Error('Missing phone');
      if (width <= 700) {
        await page.locator('.menu-toggle').click();
        if (await page.locator('.menu-toggle').getAttribute('aria-expanded') !== 'true') throw new Error('Mobile menu did not open');
        await page.locator('#site-nav a[href="#about"]').click();
        if (await page.locator('.menu-toggle').getAttribute('aria-expanded') !== 'false') throw new Error('Mobile menu did not close');
      }
      if (width === 390 || width === 1440) {
        await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); });
        await page.screenshot({ path: `${output}/${width === 390 ? 'mobile' : 'desktop'}.png`, fullPage: true });
      }
      console.log(`PASS ${width}px: layout, project dialog and contact links${width <= 700 ? ', mobile navigation' : ''}`);
    }
    if (errors.length) throw new Error(errors.join('\n'));
    console.log('Browser checks passed; screenshots: ' + output);
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exit(1); });
