#!/bin/bash

echo "🚀 Setting up GitHub Pages for LauraGomezjurado"
echo "================================================"
echo ""

# Check if repo exists
REPO_NAME="lauragomezjurado.github.io"
echo "📦 Repository name: $REPO_NAME"
echo ""

# Try to create repo with gh CLI
echo "🔐 Attempting to create repository..."
if gh repo create "$REPO_NAME" --public --source=. --remote=origin --push 2>/dev/null; then
    echo "✅ Repository created and pushed!"
else
    echo "⚠️  Could not create repo automatically (authentication needed)"
    echo ""
    echo "Please create the repository manually:"
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: $REPO_NAME"
    echo "3. Make it Public"
    echo "4. Don't initialize with README"
    echo "5. Click 'Create repository'"
    echo ""
    read -p "Press Enter after you've created the repository..."
    
    # Set remote
    git remote add origin "https://github.com/LauraGomezjurado/$REPO_NAME.git" 2>/dev/null || \
    git remote set-url origin "https://github.com/LauraGomezjurado/$REPO_NAME.git"
    
    # Push
    git push -u origin main
fi

echo ""
echo "🏗️  Deploying to GitHub Pages..."
npm run deploy

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Final step: Enable GitHub Pages"
echo "   1. Go to: https://github.com/LauraGomezjurado/$REPO_NAME/settings/pages"
echo "   2. Source: gh-pages branch"
echo "   3. Folder: / (root)"
echo "   4. Save"
echo ""
echo "🌐 Your site will be at: https://lauragomezjurado.github.io"
