# Deployment Guide

This guide explains how to publish your website and keep updating it with the same URL.

## Option 1: Vercel (Recommended - Easiest)

Vercel is perfect for React/Vite projects and offers:
- ✅ Free hosting
- ✅ Custom domain support
- ✅ Automatic deployments from Git
- ✅ Same URL for all updates
- ✅ HTTPS included

### Steps:

1. **Initialize Git (if not already done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a GitHub repository:**
   - Go to https://github.com/new
   - Create a new repository (e.g., "portfolio-website")
   - Don't initialize with README

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/portfolio-website.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy to Vercel:**
   - Go to https://vercel.com
   - Sign up/login with GitHub
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings
   - Click "Deploy"
   - Your site will be live at: `https://your-project-name.vercel.app`

5. **Add Custom Domain (Optional):**
   - In Vercel dashboard → Settings → Domains
   - Add your domain (e.g., `lauragomez.com`)
   - Follow DNS instructions

6. **Updating Your Site:**
   - Make changes locally
   - Commit and push to GitHub:
     ```bash
     git add .
     git commit -m "Update portfolio"
     git push
     ```
   - Vercel automatically rebuilds and deploys (usually takes 1-2 minutes)
   - Same URL, updated content!

---

## Option 2: Netlify

Similar to Vercel, also free and easy.

### Steps:

1. **Push to GitHub** (same as Vercel steps 1-3)

2. **Deploy to Netlify:**
   - Go to https://netlify.com
   - Sign up/login with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"
   - Your site will be live at: `https://random-name.netlify.app`

3. **Updating:**
   - Same as Vercel - just push to GitHub and it auto-deploys

---

## Option 3: GitHub Pages

Free but requires a bit more setup.

### Steps:

1. **Install gh-pages package:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts:**
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages:**
   - Go to your repo → Settings → Pages
   - Source: `gh-pages` branch
   - Your site: `https://YOUR_USERNAME.github.io/portfolio-website`

---

## Quick Comparison

| Platform | Free | Custom Domain | Auto-Deploy | Ease |
|----------|------|---------------|-------------|------|
| Vercel   | ✅   | ✅            | ✅          | ⭐⭐⭐⭐⭐ |
| Netlify  | ✅   | ✅            | ✅          | ⭐⭐⭐⭐ |
| GitHub Pages | ✅ | ✅        | ❌          | ⭐⭐⭐ |

## Recommended: Vercel

Vercel is the easiest and most reliable option. Your workflow will be:

1. Make changes to your code
2. `git add . && git commit -m "Update" && git push`
3. Wait 1-2 minutes
4. Your site is updated at the same URL!

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- GitHub Pages: https://pages.github.com

