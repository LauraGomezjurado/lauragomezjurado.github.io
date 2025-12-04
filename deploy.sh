#!/bin/bash

# GitHub Pages Deployment Script for LauraGomezjurado
# Run this after creating your GitHub repository

echo "🚀 GitHub Pages Deployment Script"
echo "=================================="
echo ""

REPO_NAME="lauragomezjurado.github.io"
GITHUB_USER="LauraGomezjurado"

# Check if remote is set
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ Git remote is configured"
    REMOTE_URL=$(git remote get-url origin)
    echo "   Remote: $REMOTE_URL"
    echo ""
    
    # Extract repo name from URL
    REPO_NAME=$(basename -s .git "$REMOTE_URL")
    echo "📦 Repository: $REPO_NAME"
    echo ""
    
    # Check if repo is username.github.io format
    if [[ "$REPO_NAME" == *.github.io ]]; then
        echo "✅ Using root path (username.github.io format)"
        echo "   Your site will be at: https://$(echo $REPO_NAME | sed 's/\.github\.io//').github.io"
    else
        echo "⚠️  Repository is not in username.github.io format"
        echo "   Your site will be at: https://$(echo $REPO_NAME | sed 's/\.github\.io//').github.io/$REPO_NAME"
        echo ""
        echo "   Updating vite.config.js with base path..."
        # Update vite.config.js
        sed -i.bak "s|// base: '/REPO_NAME/',|base: '/$REPO_NAME/',|" vite.config.js
        rm vite.config.js.bak 2>/dev/null
        echo "   ✅ Updated vite.config.js"
    fi
    echo ""
    
    echo "📤 Pushing to GitHub..."
    git push -u origin main
    echo ""
    
    echo "🏗️  Building and deploying to GitHub Pages..."
    npm run deploy
    echo ""
    
    echo "✅ Deployment complete!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Go to: https://github.com/$GITHUB_USER/$REPO_NAME/settings/pages"
    echo "   2. Source: gh-pages branch"
    echo "   3. Folder: / (root)"
    echo "   4. Save and wait 1-2 minutes"
    echo ""
    echo "🌐 Your site will be at: https://$REPO_NAME"
    echo ""
    
else
    echo "❌ Git remote not configured yet"
    echo ""
    echo "Setting up remote for: $GITHUB_USER/$REPO_NAME"
    git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git" 2>/dev/null || \
    git remote set-url origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
    echo "✅ Remote configured"
    echo ""
    echo "📤 Pushing to GitHub..."
    git push -u origin main
    echo ""
    echo "🏗️  Building and deploying..."
    npm run deploy
    echo ""
    echo "📝 Final step: Enable GitHub Pages"
    echo "   Go to: https://github.com/$GITHUB_USER/$REPO_NAME/settings/pages"
    echo ""
fi

