# Quick Deployment Guide - Follow These Steps

## ✅ Step 1: Create GitHub Repository

1. Go to **https://github.com/new**
2. **Repository name**: Choose one:
   - `lauragomez.github.io` (recommended - gives you root URL)
   - OR `portfolio` (will be at `/portfolio` subpath)
3. Make it **Public** ✅
4. **Don't** check any boxes (no README, .gitignore, or license)
5. Click **"Create repository"**

## ✅ Step 2: Copy Your Repository URL

After creating the repo, GitHub will show you a URL like:
- `https://github.com/YOUR_USERNAME/REPO_NAME.git`

Copy this URL!

## ✅ Step 3: Connect and Deploy

Run these commands in your terminal:

```bash
cd /Users/lauragomez/Desktop/website

# Add your GitHub repository (replace with your actual URL)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Run the deployment script
./deploy.sh
```

OR manually:

```bash
cd /Users/lauragomez/Desktop/website

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main

# Deploy to GitHub Pages
npm run deploy
```

## ✅ Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under **Source**:
   - Branch: Select `gh-pages`
   - Folder: Select `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes

## ✅ Step 5: Your Site is Live!

Your website will be available at:
- If repo is `lauragomez.github.io`: **https://lauragomez.github.io**
- If repo is `portfolio`: **https://lauragomez.github.io/portfolio**

## 🔄 Updating Your Site

Whenever you make changes:

```bash
cd /Users/lauragomez/Desktop/website
git add .
git commit -m "Update portfolio"
git push
npm run deploy
```

That's it! Your site updates at the same URL in 1-2 minutes.

---

**Need help?** Check `GITHUB_PAGES_SETUP.md` for detailed instructions.

