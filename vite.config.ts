/// <reference types="vitest" />
// ↑ This triple-slash directive makes TypeScript aware of Vitest's `test`
//   config key on defineConfig without needing a separate vitest.config.ts file.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    // Tailwind v4 ships a Vite plugin that replaces the PostCSS setup from v3.
    // It reads your CSS @import "tailwindcss" and scans src/ for class usage.
    tailwindcss(),
  ],
  test: {
    // `globals: true` means describe/it/expect/vi are available without imports.
    globals: true,
    // jsdom simulates a browser DOM in Node.js so React components can render.
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
