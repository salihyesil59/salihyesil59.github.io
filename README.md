# salihyesil59.github.io

Personal academic site — static HTML/CSS/JS, no build step, no dependencies,
no trackers. Served straight from GitHub Pages.

```
index.html            the whole page
404.html              not-found page
assets/css/style.css  design tokens + layout (dark/light)
assets/js/main.js     theme toggle, filters, live star counts, background
.nojekyll             tells Pages to serve the files as-is
```

## Deploying

The repository **must** be named `salihyesil59.github.io` for GitHub to serve it
at the root domain.

```bash
git init
git add .
git commit -m "Personal site"
git branch -M main
git remote add origin https://github.com/salihyesil59/salihyesil59.github.io.git
git push -u origin main
```

Then in the repository: **Settings → Pages → Source: Deploy from a branch →
`main` / `(root)`**. The site appears at <https://salihyesil59.github.io/>
within a minute or two.

## Previewing locally

Open `index.html` over HTTP rather than as a `file://` URL, so the relative
asset paths and the GitHub API request behave the same as in production:

```bash
python -m http.server 4173
```

Then visit <http://localhost:4173/>.

## Editing

Everything the page says lives in `index.html` as ordinary markup — no
templating language to learn.

- **Add a project.** Copy an existing `<article class="card card--project">`
  block. `data-repo` must match the GitHub repository name exactly (that is how
  the star count finds it); `data-topics` is a space-separated list matching the
  `data-filter` values on the filter chips.
- **Add a filter category.** Add a `<button class="chip" data-filter="…">` and
  use the same word in some card's `data-topics`.
- **Change the colours.** All of them are CSS custom properties at the top of
  `style.css`, defined once for dark and once for light.
- **Remove the email.** Delete the `#mail-link` list item in `index.html`; the
  address is assembled in JS purely to make scraping mildly annoying, which is
  not real protection.

## Notes

- Star counts come from the unauthenticated GitHub API, cached in
  `localStorage` for six hours. If the request is rate-limited or blocked the
  counts simply stay hidden — nothing else breaks.
- The animated background is disabled entirely under
  `prefers-reduced-motion: reduce`, and pauses in a hidden tab.
- Theme follows the operating system until the visitor clicks the toggle, after
  which their choice is remembered.
