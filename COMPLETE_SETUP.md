# Complete Setup Guide for LauraGomezjurado

## ✅ What's Already Done

- ✅ Git repository initialized
- ✅ All files committed
- ✅ Deployment scripts configured
- ✅ Ready for GitHub Pages

## 🚀 Final Steps (Choose One Method)

### Method 1: Using GitHub CLI (Fastest - if authenticated)

If you're logged into GitHub CLI:

```bash
cd /Users/lauragomez/Desktop/website

# Authenticate if needed
gh auth login

# Create repo and deploy
gh repo create lauragomezjurado.github.io --public --source=. --remote=origin --push
npm run deploy
```

Then enable GitHub Pages:
1. Go to: https://github.com/LauraGomezjurado/lauragomezjurado.github.io/settings/pages
2. Source: `gh-pages` branch
3. Folder: `/ (root)`
4. Save

### Method 2: Manual Setup (Recommended)

**Step 1: Create Repository**
1. Go to: https://github.com/new
2. Repository name: `lauragomezjurado.github.io`
3. Make it **Public** ✅
4. **Don't** check any boxes
5. Click "Create repository"

**Step 2: Connect and Deploy**

Run these commands:

```bash
cd /Users/lauragomez/Desktop/website

# Connect to GitHub
git remote add origin https://github.com/LauraGomezjurado/lauragomezjurado.github.io.git

# Push your code
git push -u origin main

# Deploy to GitHub Pages
npm run deploy
```

**Step 3: Enable GitHub Pages**
1. Go to: https://github.com/LauraGomezjurado/lauragomezjurado.github.io/settings/pages
2. Under "Source":
   - Branch: Select `gh-pages`
   - Folder: Select `/ (root)`
3. Click **Save**
4. Wait 1-2 minutes

## 🌐 Your Website URL

Once deployed, your site will be live at:
**https://lauragomezjurado.github.io**

## 🔄 Updating Your Site

Whenever you make changes:

```bash
cd /Users/lauragomez/Desktop/website
git add .
git commit -m "Update portfolio"
git push
npm run deploy
```

Your site updates automatically at the same URL!

## 🎉 That's It!

Your portfolio website will be live and you can update it anytime while keeping the same URL.

