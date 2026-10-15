# Karangwa Manzi Bruce — Portfolio

A responsive personal portfolio for video editing, videography and software development.

## Features

- Light and dark themes with a saved preference and device-theme detection.
- Responsive navigation with keyboard controls.
- Video work and current experience at Kingura.
- HR Interchange project overview: an employee and payment management application built with React, JavaScript and SQL.
- Email and phone contact links.
- No build step or production dependencies.

Video samples and project screenshots will be added later. The decorative artwork is not a video sample or application screenshot.

## Open locally

Open `dist/index.html` in a browser. Keep the other files in `dist/` beside it.

You can also serve it with Python 3:

```sh
python -m http.server 8000 --directory dist
```

Then open http://localhost:8000.

## Checks

With Node.js 18 or newer:

```sh
node tools/check-interactions.cjs
```

These dependency-free checks cover theme preferences, browser API fallbacks, the mobile menu and project details. They do not replace browser rendering checks.

Optional browser checks require Playwright:

```sh
npm install --no-save playwright
npx playwright install chromium
node tools/check-design.cjs
```

Use `PORTFOLIO_CHROMIUM_PATH` if you need a different Chromium executable. Screenshots go into `exports/review/`.

## Export

With Python 3:

```sh
python tools/export-preview.py
```

This creates a self-contained `exports/portfolio-preview.html` and `exports/bruce-portfolio.zip`. You can specify a different destination with `--output-dir PATH`.

## Project files

- `dist/index.html`: page content and structure.
- `dist/styles.css`: base layout and artwork.
- `dist/theme.css`: professional styling and both color themes.
- `dist/theme-init.js`: initial theme and saved preference.
- `dist/script.js`: theme button, navigation and project details.
- `tools/`: regression checks and offline export.

## GitHub Pages

The site is published from the `main` branch's `docs/` folder. Its GitHub Pages URL is:

https://brucekarangwamanzi.github.io/real_portfolio-/

`dist/` is the source for the published page. After editing the portfolio, refresh the hosting files before committing and pushing:

```sh
python tools/prepare-pages.py
```

Commit the updated `dist/` and generated `docs/` files together. GitHub Pages builds after the push. There is no backend or build dependency.
