# Finance Dashboard

Turn your Excel or CSV spreadsheet into a beautiful financial dashboard — right in your browser.

## Features

- **Smart Import** — Automatically detects dates, amounts, and categories from your spreadsheet
- **Beautiful Analytics** — Modern charts and graphs for your finances
- **100% Private** — All data stays in your browser (IndexedDB). Nothing is uploaded to servers.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Scripts

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `npm run dev`    | Start the Vite dev server            |
| `npm run build`  | Type-check and build for production  |
| `npm run preview`| Preview the production build         |
| `npm run lint`   | Run Oxlint                           |

## Deployment to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the app to GitHub Pages on every push to `main`.

### One-time setup (required)

> ⚠️ **Important:** If your site shows a blank page or 404, the most likely cause is that
> GitHub Pages is still set to **"Deploy from a branch"** instead of **"GitHub Actions"**.
> The workflow runs, but GitHub Pages ignores it until you change this setting.

1. In your repository on GitHub, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
   - If it currently says "Deploy from a branch", change it to "GitHub Actions".
   - This tells GitHub Pages to use the artifact uploaded by the workflow instead of serving raw source files.
3. Push to `main` (or re-run the workflow) — it will build and deploy automatically.

The site will be available at `https://<your-username>.github.io/<repo-name>/`.

### How it works

- `vite.config.ts` uses a relative `base: './'` so assets load correctly from the repo subpath.
- `src/App.tsx` uses `HashRouter` so deep links (e.g. `/#/dashboard`) work on static hosting without server-side rewrites.