import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './', // Relative base path for flexible deployment (e.g. GitHub Pages)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
