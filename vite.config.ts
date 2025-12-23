import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: (() => {
    const isCI = process.env.GITHUB_ACTIONS === 'true'
    const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
    if (!isCI || !repo) return '/'
    return repo.endsWith('.github.io') ? '/' : `/${repo}/`
  })(),
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listens on all interfaces
    // OR
    // host: true, // Also listens on all interfaces
  },
})
