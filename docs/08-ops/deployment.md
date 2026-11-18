# Deployment

**Owner:** DevOps / Release Engineer

## Build

`npm ci && npm run build` produces `dist/` (static files, service worker and manifest).
Use `BASE_PATH=/<repo>/ npm run build` for sub-path hosting such as GitHub Pages.

## CI (`.github/workflows/ci.yml`)

On every push and PR: `npm ci`, typecheck, lint, test (unit and accuracy), build.

## Live site

**https://speedyzozo.github.io/python-hangman/** (GitHub Pages, deployed from branch `ccr-7c43b1a1-kunrlh`).
Redeploy at any time: Actions → "Deploy to GitHub Pages" → _Run workflow_.

## GitHub Pages (`.github/workflows/deploy.yml`)

Manual trigger (`workflow_dispatch`). It builds with `BASE_PATH=/<repo-name>/` and publishes
`dist/` through `actions/deploy-pages`. **The sponsor must enable Pages (Settings → Pages →
Source: GitHub Actions).** HTTPS is required for the microphone, and Pages provides it.

## Any static host

Serve `dist/` over HTTPS. No server-side rewrites are needed (HashRouter). Recommended headers are in [security.md](security.md).

## Versioning

SemVer in `package.json`. MVP = `0.1.0`. A tag and release note at the end of each milestone.
