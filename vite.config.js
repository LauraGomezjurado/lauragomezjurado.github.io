import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages: if your repo is NOT named "username.github.io",
  // uncomment the line below and replace 'REPO_NAME' with your repo name
  // base: '/REPO_NAME/',
})
