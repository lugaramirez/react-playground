import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Runs only integration tests — files matching *.integration.test.*.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.integration.test.*'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
})
