import fs from 'fs';

// Read the markdown file
const content = fs.readFileSync('content/blog/2025-01-20-subliminal-preference-transfer.md', 'utf8');

// Extract content after frontmatter
const lines = content.split('\n');
let startIdx = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === '---' && i > 0) {
    startIdx = i + 1;
    break;
  }
}

const markdownContent = lines.slice(startIdx).join('\n');

// Escape for JavaScript template literal
const escaped = markdownContent
  .replace(/\\/g, '\\\\')  // Escape backslashes first
  .replace(/`/g, '\\`')     // Escape backticks
  .replace(/\${/g, '\\${'); // Escape template literal expressions

// Read the BlogPost.jsx file
let jsxContent = fs.readFileSync('src/components/BlogPost.jsx', 'utf8');

// Find and replace the content field using a more robust regex
// Match from 'subliminal-preference-transfer' to the closing }, before 'welcome-to-my-blog'
const pattern = /('subliminal-preference-transfer':\s*\{[^}]*content:\s*`)([\s\S]*?)(`\s*\n\s*\},)/;
const replacement = `$1${escaped}$3`;

jsxContent = jsxContent.replace(pattern, replacement);

// Write back
fs.writeFileSync('src/components/BlogPost.jsx', jsxContent, 'utf8');

console.log('Updated BlogPost.jsx successfully!');
