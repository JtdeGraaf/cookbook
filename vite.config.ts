import { fileURLToPath } from 'node:url'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'
import { defineConfig } from 'vitest/config'
import { domainLanguagePlugin } from './build/domain-language-plugin.ts'
import { linkPreviewPlugin } from './build/link-preview-plugin.ts'
import { offlinePlugin } from './build/offline-plugin.ts'
import { recipeBookPlugin } from './build/recipe-book-plugin.ts'

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    recipeBookPlugin('recipes'),
    imagetools({ removeMetadata: true }),
    domainLanguagePlugin(),
    linkPreviewPlugin('recipes'),
    offlinePlugin(),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'build/**/*.test.ts', 'packages/**/*.test.ts'],
    setupFiles: ['src/test/setup.ts'],
  },
})
