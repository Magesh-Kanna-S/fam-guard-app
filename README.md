# FAM-GUARD — Smart Grain Storage Companion

> **Protecting Every Grain, Empowering Every Home.**

A web-based prototype app for the FAM-GUARD device — a multi-zone storage risk
detection + adaptive ventilation system for rural Indian households and farms.

Innovator: **Vishnu .M**  •  Mentor: **Magesh Kanna S** (Innovation Ambassador)

---

## 🚀 Quick Start (Local Development)

```bash
npm install
npm run dev
# → http://localhost:3000
```

## 🏗️ Build for Production

```bash
npm run build
# Output: ./dist/  (static HTML/JS/CSS — ready for any static host)
```

## 🌐 Deploy to GitHub Pages (EASIEST)

This repo ships with a **GitHub Actions workflow** that auto-builds and deploys
on every push to `main` / `master`. Three steps:

1. **Push this repo to GitHub.**
   ```bash
   git init
   git add .
   git commit -m "Initial FAM-GUARD prototype"
   git branch -M main
   git remote add origin https://github.com/<USER>/<REPO>.git
   git push -u origin main
   ```

2. **Enable Pages from Actions:**
   - Go to **Settings → Pages → Build and deployment**
   - Under **Source**, select **GitHub Actions**

3. **Wait ~2 minutes** for the workflow to run. Your app will be live at:
   ```
   https://<your-username>.github.io/<repo-name>/
   ```

That's it — every future `git push` to `main` redeploys automatically.

## 🔧 Manual Deploy (Alternative)

If you prefer not to use Actions:

```bash
bash scripts/deploy-gh-pages.sh
```

This script:
- Detects your repo name from `git remote origin`
- Builds with the correct `base` path
- Pushes `dist/` to a `gh-pages` branch via the `gh-pages` npm package

Then in **Settings → Pages → Source**, pick **Deploy from a branch** → `gh-pages` → `/ (root)`.

## ❓ Why Was My Page Blank?

The most common cause: **uploading source code without building**. GitHub Pages
serves static files (HTML/CSS/JS), not React/TypeScript source. You must run
`npm run build` and serve the contents of `dist/`.

This repo fixes that with:
- `vite.config.ts` → sets `base: '/<repo-name>/'` automatically (using the
  `GITHUB_REPOSITORY` env var set by GitHub Actions) so assets load from the
  correct sub-path.
- `public/.nojekyll` → disables Jekyll processing so `_`-prefixed assets work.
- `public/404.html` → SPA fallback so deep links don't 404.
- `.github/workflows/deploy.yml` → auto-build + deploy pipeline.

## 🤖 Optional: AI Advisory

The Advisory Chat screen can use the Gemini API. To enable it locally:

```bash
cp .env.example .env
# Add your key: GEMINI_API_KEY=your_key_here
```

For GitHub Pages, set the same as a repo secret:
**Settings → Secrets and variables → Actions → New repository secret**
Name: `GEMINI_API_KEY`, Value: your key.

The workflow will inject it at build time. (Without a key, the chat screen
shows a friendly offline message.)

## 📚 Features

- Multi-zone storage monitoring (temperature, humidity, grain moisture)
- Risk classification: GREEN / YELLOW / RED
- Adaptive ventilation controls
- Alerts & notifications
- Inventory & grain-lot tracking
- AI advisory chat
- History & analytics
- Multi-user farm management
- Three subscription tiers (Basic / Plus / Pro)

## 🛠️ Tech Stack

- React 19 + TypeScript
- Vite 6 (build tool)
- Tailwind CSS 4
- Framer Motion (animations)
- Lucide React (icons)
- @google/genai (optional AI chat)

## 📄 License

Prototype — for evaluation purposes. © Vishnu .M (Innovator), mentored by
Magesh Kanna S (Innovation Ambassador).
