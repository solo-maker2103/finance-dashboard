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

### One-time setup

1. In your repository on GitHub, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main` — the workflow will build and deploy automatically.

The site will be available at `https://<your-username>.github.io/<repo-name>/`.

### How it works

- `vite.config.ts` uses a relative `base: './'` so assets load correctly from the repo subpath.
- `src/App.tsx` uses `HashRouter` so deep links (e.g. `/#/dashboard`) work on static hosting without server-side rewrites.