# GitHub Pages Deployment Guide

This guide will help you deploy your portfolio website to GitHub Pages and keep the same URL for all updates.

## Step 1: Initialize Git (if not already done)

```bash
cd /Users/lauragomez/Desktop/website
git init
git add .
git commit -m "Initial portfolio website"
```

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: Choose one of these options:
   - **Option A**: `lauragomez.github.io` (for root URL: `https://lauragomez.github.io`)
   - **Option B**: `portfolio` or `website` (for subpath: `https://lauragomez.github.io/portfolio`)
3. Make it **Public** (required for free GitHub Pages)
4. **Don't** initialize with README, .gitignore, or license
5. Click "Create repository"

## Step 3: Configure Base Path (Only if using Option B)

If your repo is NOT named `username.github.io`, you need to set the base path.

**Update `vite.config.js`** - I'll do this for you based on your repo name.

## Step 4: Connect to GitHub and Push

```bash
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

Replace:
- `YOUR_USERNAME` with your GitHub username
- `REPO_NAME` with your repository name

## Step 5: Deploy to GitHub Pages

```bash
npm run deploy
```

This will:
1. Build your website
2. Create a `gh-pages` branch
3. Push the built files to GitHub

## Step 6: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under "Source":
   - Branch: Select `gh-pages`
   - Folder: Select `/ (root)`
4. Click **Save**
5. Wait 1-2 minutes for GitHub to build
6. Your site will be live at:
   - If repo is `username.github.io`: `https://YOUR_USERNAME.github.io`
   - If repo is `portfolio`: `https://YOUR_USERNAME.github.io/portfolio`

## Step 7: Updating Your Website

Whenever you want to update your site:

```bash
# Make your changes, then:
git add .
git commit -m "Update portfolio"
git push

# Deploy the updates:
npm run deploy
```

Your site will update at the same URL in 1-2 minutes!

## Important Notes

- **Free**: GitHub Pages is completely free
- **HTTPS**: Automatically included
- **Custom Domain**: You can add a custom domain in Settings → Pages
- **Build Time**: Usually 1-2 minutes after deployment
- **Public Repo**: Required for free GitHub Pages (or upgrade to GitHub Pro)

## Troubleshooting

### Images not loading?
- Make sure image paths start with `/` (e.g., `/profile.jpg` not `profile.jpg`)
- Check that images are in the `public/` folder

### 404 errors?
- Make sure you selected the `gh-pages` branch in Settings
- Wait a few minutes for GitHub to process

### Want to use a custom domain?
1. In GitHub repo → Settings → Pages
2. Add your domain (e.g., `lauragomez.com`)
3. Update your DNS records as instructed
4. GitHub will provide SSL certificate automatically

## Need Help?

- GitHub Pages Docs: https://docs.github.com/en/pages
- Vite Deployment Guide: https://vitejs.dev/guide/static-deploy.html#github-pages

