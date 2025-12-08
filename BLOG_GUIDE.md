# Blog Guide

This guide explains how to add new blog posts to your website.

## How to Add a Blog Post

### Step 1: Create a Markdown File

Create a new markdown file in the `content/blog/` directory with the following naming convention:
```
YYYY-MM-DD-slug.md
```

Example: `2025-01-20-understanding-interpretability.md`

### Step 2: Add Frontmatter

At the top of your markdown file, add frontmatter (metadata):

```markdown
---
title: "Your Post Title"
date: "2025-01-20"
excerpt: "A brief description of your post that will appear in the blog listing."
---

# Your Post Title

Your content here...
```

### Step 3: Update Blog.jsx

Open `src/components/Blog.jsx` and add your new post to the `blogPosts` array:

```javascript
const blogPosts = [
  {
    slug: 'welcome-to-my-blog',
    title: 'Welcome to My Blog',
    date: '2025-01-15',
    excerpt: 'This is my first blog post...'
  },
  {
    slug: 'understanding-interpretability',  // matches the filename (without date)
    title: 'Understanding Interpretability',
    date: '2025-01-20',
    excerpt: 'A brief description...'
  }
]
```

### Step 4: Update BlogPost.jsx

Open `src/components/BlogPost.jsx` and add your post content to the `blogPosts` object:

```javascript
const blogPosts = {
  'welcome-to-my-blog': {
    title: 'Welcome to My Blog',
    date: '2025-01-15',
    content: `# Welcome to My Blog\n\nYour markdown content here...`
  },
  'understanding-interpretability': {
    title: 'Understanding Interpretability',
    date: '2025-01-20',
    content: `# Understanding Interpretability\n\nYour markdown content here...`
  }
}
```

**Note:** You can copy the content from your markdown file (everything after the frontmatter) and paste it as a template literal string.

## Markdown Features

You can use standard markdown syntax:
- Headers (`#`, `##`, `###`)
- **Bold** and *italic* text
- Lists (ordered and unordered)
- Links and images
- Code blocks
- Blockquotes

## Future Improvements

For a more automated solution, you could:
1. Create a build script that reads markdown files and generates the blog posts automatically
2. Use a headless CMS (like Contentful or Sanity)
3. Use a static site generator plugin for Vite

For now, this manual approach gives you full control and works well for a personal blog.

