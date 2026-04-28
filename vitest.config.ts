import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: [
      '__tests__/**/*.test.ts',
      '__tests__/**/*.test.tsx',
    ],
    fileParallelism: false,
    isolate: false,
    maxWorkers: 1,
    minWorkers: 1,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
