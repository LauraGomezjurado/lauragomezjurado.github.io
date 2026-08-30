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
        //
        // The `three` entry that used to live here was preloading a 1MB chunk
        // on every visit for a canvas that had been commented out for months.
        // These are the libraries actually on the critical path.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['gsap', 'framer-motion'],
        },
      },
    },
  },
})
