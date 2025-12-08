# Adding GitHub Repository Links to Portfolio

This guide explains how to link your portfolio projects to their GitHub repositories.

## How to Add GitHub Links

1. **Open** `src/components/Portfolio.jsx`

2. **Find the project** you want to add a GitHub link to in the `projects` array

3. **Update the `github` field** with your repository URL:

```javascript
{
  id: 1,
  title: 'AI Cybersecurity & Evaluation Robustness',
  // ... other fields ...
  github: 'https://github.com/LauraGomezjurado/your-repo-name'  // Add your repo URL here
}
```

## Example

If you have a repository at `https://github.com/LauraGomezjurado/model-editing-fairness`, you would update:

```javascript
{
  id: 4,
  title: 'High-Dimensional Model Editing for Fairness',
  // ... other fields ...
  github: 'https://github.com/LauraGomezjurado/model-editing-fairness'
}
```

## What Gets Displayed

- If a project has a `github` link, a "View Code" button with a GitHub icon will appear
- If a project has a `link` (publication), a "View Publication" button will appear
- Both can be displayed together if both are provided

## Finding Your Repository URLs

1. Go to your GitHub profile: https://github.com/LauraGomezjurado
2. Browse your repositories
3. Click on a repository
4. Copy the URL from the address bar
5. Paste it into the `github` field for the corresponding project

## Notes

- Leave `github: null` if a project doesn't have a public repository
- The links open in a new tab
- GitHub links are styled consistently with your site's design

