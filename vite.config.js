import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages: if your repo is NOT named "username.github.io",
  // uncomment the line below and replace 'REPO_NAME' with your repo name
  // base: '/REPO_NAME/',
  build: {
    rollupOptions: {
      output: {
        // Split heavy libraries into their own chunks so they cache
        // independently and don't bloat the initial app shell.
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          markdown: ['react-markdown', 'remark-gfm', 'remark-math', 'rehype-katex', 'katex'],
        },
      },
    },
  },
})
