# jakeflem.com

Jake Fleming's personal site. Static site built with [Eleventy](https://www.11ty.dev/),
[Sass](https://sass-lang.com/), and [esbuild](https://esbuild.github.io/),
and deployed to GitHub Pages automatically.

## Quick start

Requires [Node.js](https://nodejs.org/) (see `.nvmrc` for the version — run
`nvm use` if you use [nvm](https://github.com/nvm-sh/nvm)).

```bash
npm install      # once, to install dependencies
npm start        # local dev server with live reload at http://localhost:8080
```

Edit anything under `src/` and the browser reloads automatically.

```bash
npm run build    # one-off production build into docs/
```

## Editing the site

Everything lives in `src/`:

| Path                       | What it is                                                        |
| -------------------------- | ----------------------------------------------------------------- |
| `src/index.njk`            | The homepage content.                                             |
| `src/_includes/layouts/`   | The page shell (`<head>`, scripts) shared by every page.          |
| `src/_includes/shared/`    | Reusable snippets pulled in with `{% include %}`.                 |
| `src/_data/`               | Global data available in every template (e.g. `global.json`).     |
| `src/stylesheets/app.scss` | Styles. `spectre/` is the vendored framework; edit `app.scss`.    |
| `src/javascripts/app.js`   | The JS entry point (bundled by esbuild).                          |
| `src/images/`              | Images shipped with the site.                                     |
| `src/fonts/`               | Web fonts.                                                        |
| `src/static/`              | Copied to the site root as-is (favicons, videos, `CNAME`).        |

Templates use [Nunjucks](https://mozilla.github.io/nunjucks/). To add a page,
drop a new `.njk` file in `src/` that starts with
`{% extends 'layouts/application.njk' %}`.

## Deployment

Pushing to `master` triggers the **Deploy site to GitHub Pages** GitHub Action
(`.github/workflows/deploy.yml`), which builds the site and publishes it. The
built output (`docs/`) is **not** committed — it's generated fresh on every
deploy, so there's nothing to build or commit by hand.

> **One-time setup:** in the repo's **Settings → Pages**, set **Source** to
> **GitHub Actions** (instead of "Deploy from a branch"). The custom domain
> (`jakeflem.com`) is preserved via `src/static/CNAME`.
