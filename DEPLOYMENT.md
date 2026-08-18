# FAM-GUARD — Complete GitHub Pages Deployment Guide

This guide walks you through deploying FAM-GUARD to **GitHub Pages** so anyone
can access it at `https://<your-username>.github.io/<repo-name>/`.

---

## 🩹 Why Your Page Was Blank

When you uploaded the source code as-is, GitHub Pages could not serve it
because:

| What you uploaded | What GitHub Pages needs |
|---|---|
| `App.tsx`, `screens/*.tsx`, `index.tsx` (source) | `index.html`, `assets/*.js`, `assets/*.css` (compiled) |
| TypeScript that needs compiling | Plain HTML/CSS/JS the browser can run directly |
| Assets referenced as `/index.css` (root) | Assets at `/<repo-name>/index.css` (sub-path) |

GitHub Pages is a **static file host**. It does not run `npm install` or
`npm run build`. The fix: build locally (or use Actions) and serve `dist/`.

---

## ✅ Method 1 — GitHub Actions (Recommended, Auto-Deploy)

Best for: hands-off deploys on every `git push`.

### Step 1 — Create the GitHub repo

1. Go to **https://github.com/new**
2. **Repository name:** e.g. `fam-guard-app`
3. Set to **Public** (Pages only works on public repos for free accounts).
4. **Do NOT** add README / .gitignore / license (we already have them).
5. Click **Create repository**.

### Step 2 — Push the code

From the project root:

```bash
git init
git add .
git commit -m "Initial FAM-GUARD prototype"
git branch -M main
git remote add origin https://github.com/<USER>/fam-guard-app.git
git push -u origin main
```

### Step 3 — Enable GitHub Actions as Pages source

1. Open your repo on GitHub.
2. Go to **Settings** → **Pages** (left sidebar).
3. Under **Build and deployment → Source**, click the dropdown and select
   **GitHub Actions**.

### Step 4 — Watch the workflow run

1. Click the **Actions** tab at the top of your repo.
2. You should see a workflow named **"Deploy FAM-GUARD to GitHub Pages"**
   running.
3. Wait ~2 minutes for it to finish (yellow → green).

### Step 5 — Visit your live site

```
https://<your-username>.github.io/fam-guard-app/
```

That's it. Every future `git push` to `main` automatically rebuilds and
redeploys.

---

## 🛠️ Method 2 — Manual `gh-pages` Branch (Alternative)

Best for: if you don't want Actions running, or you want to deploy from your
local machine.

### Step 1 — Push source code to `main` (as above).

### Step 2 — Run the deploy script

```bash
bash scripts/deploy-gh-pages.sh
```

The script automatically:
- Detects your repo name from `git remote origin`
- Installs dependencies
- Builds with the correct `base` path (`/<repo-name>/`)
- Copies `index.html` → `404.html` for SPA routing
- Adds `.nojekyll` to skip Jekyll processing
- Pushes `dist/` to a new `gh-pages` branch

### Step 3 — Point Pages at the `gh-pages` branch

1. Go to **Settings → Pages → Build and deployment**.
2. Under **Source**, pick **Deploy from a branch**.
3. Select **`gh-pages`** branch and **`/ (root)`** folder.
4. Click **Save**.

Wait 1-2 minutes. Your site is live.

---

## 🔑 Optional — Enable AI Advisory Chat

The Advisory Chat screen uses Google's Gemini API. Without a key, it shows a
friendly offline message. To enable it:

### For GitHub Actions deployment:

1. Get a free API key at **https://aistudio.google.com/apikey**.
2. In your GitHub repo: **Settings → Secrets and variables → Actions →
   New repository secret**.
3. **Name:** `GEMINI_API_KEY`  •  **Value:** your key.
4. Re-run the workflow (Actions tab → Re-run jobs).

### For local development:

```bash
cp .env.example .env
# Edit .env and add: GEMINI_API_KEY=your_key_here
```

---

## 🐛 Troubleshooting

### Still seeing a blank page?

Open the browser DevTools (F12) → Console. Common errors & fixes:

| Console Error | Cause | Fix |
|---|---|---|
| `Failed to load resource: /assets/index-xxxx.js 404` | `base` not set | Re-run workflow; check `vite.config.ts` |
| `MIME type ('text/plain') mismatch` | `.nojekyll` missing | Workflow adds it; for manual, `touch dist/.nojekyll` |
| `Uncaught SyntaxError` in index.js | Old build cached | Hard refresh: Ctrl+Shift+R |
| Page loads but routes 404 | No SPA fallback | Workflow copies `index.html` → `404.html` |

### Wrong base path?

If your site is at `https://user.github.io/fam-guard-app/` but assets try to
load from `https://user.github.io/assets/...`, the `base` is wrong. Ensure
the workflow ran (Actions tab) and the latest commit is on `main`.

### CSS / icons missing?

Font Awesome and Google Fonts load from CDNs. Ensure your browser has
internet access. They don't go through GitHub Pages.

### Want a custom domain?

1. Add a `CNAME` file in `public/` with your domain (e.g. `famguard.example.com`).
2. Configure DNS at your domain registrar.
3. In **Settings → Pages → Custom domain**, enter it and click **Save**.

---

## 📁 Repo Structure (for deployment)

```
fam-guard-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions auto-deploy
├── public/
│   ├── .nojekyll               ← Skip Jekyll processing
│   └── 404.html                ← SPA routing fallback
├── scripts/
│   └── deploy-gh-pages.sh      ← Manual deploy alternative
├── src files (App.tsx, screens/, components/...)
├── .env.example
├── .gitignore
├── index.html
├── index.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts              ← base path set dynamically
├── DEPLOYMENT.md               ← (this file)
└── README.md
```

---

## ✅ Deployment Checklist

- [ ] Repo is **public** on GitHub (required for free Pages)
- [ ] All files committed & pushed to `main`
- [ ] **Settings → Pages → Source = GitHub Actions** (or `gh-pages` branch)
- [ ] Workflow ran green in **Actions** tab
- [ ] Visit `https://<user>.github.io/<repo>/` — see Dashboard load
- [ ] (Optional) `GEMINI_API_KEY` secret set for AI chat

If anything goes wrong, paste the error from the **Actions** tab or browser
console — happy to help debug.
