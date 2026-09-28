import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  server: {
    // Forward API calls to the Go backend during development
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  test: {
    globals: true, // Optional: allows using describe/it without importing them
    environment: 'jsdom', // Simulates a browser DOM
    setupFiles: './src/test/setup.ts', // Optional but recommended for DOM matchers
  }
})
