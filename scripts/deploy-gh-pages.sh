#!/usr/bin/env bash
# FAM-GUARD — Manual deploy to GitHub Pages using `gh-pages` package.
#
# Usage:
#   1. Ensure your `git remote origin` points to your GitHub repo.
#   2. Run:  bash scripts/deploy-gh-pages.sh
#   3. Wait 1-2 minutes for GitHub to publish.
#
# Builds the app with relative `base: './'` (so it works on ANY sub-path),
# pushes `dist/` to a separate `gh-pages` branch.
#
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Reading repo name from git remote..."
REPO_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [[ -z "$REPO_URL" ]]; then
  echo "ERROR: No git remote named 'origin'."
  echo "Set it with:  git remote add origin https://github.com/<USER>/<REPO>.git"
  exit 1
fi

REPO_SLUG=$(echo "$REPO_URL" | sed -E 's#(https://github.com/|git@github.com:)##; s#\.git$##')
REPO_NAME=$(basename "$REPO_SLUG")
echo "    Repo:  $REPO_SLUG"
echo "    Name:  $REPO_NAME"

echo
echo "==> Installing dependencies..."
npm install

echo
echo "==> Building app (base: './' — works for any sub-path)..."
npm run build

echo
echo "==> Adding SPA fallback (404.html) and .nojekyll..."
cp dist/index.html dist/404.html
touch dist/.nojekyll

echo
echo "==> Publishing dist/ to gh-pages branch..."
npx -y gh-pages --dist dist --message "Deploy FAM-GUARD build $(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo
echo "==> Done! Your site will be live in 1-2 minutes at:"
echo "    https://$(echo "$REPO_SLUG" | cut -d'/' -f1).github.io/$REPO_NAME/"
echo
echo "Reminder: In repo Settings → Pages → Source, choose 'Deploy from a branch'"
echo "and select the 'gh-pages' branch with '/ (root)' folder."
