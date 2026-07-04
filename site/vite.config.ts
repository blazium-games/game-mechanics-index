import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const ghPages = process.env.GITHUB_PAGES === 'true'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@lexicon': path.resolve(__dirname, '../data/source/lexicon'),
    },
  },
  base: ghPages ? '/game-design-index/' : '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('@mcp-b/webmcp-polyfill') ||
            id.includes('@cfworker/json-schema')
          ) {
            return 'webmcp'
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
})
