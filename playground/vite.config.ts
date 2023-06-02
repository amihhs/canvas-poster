import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { alias } from '../alias'

// https://vitejs.dev/config/
export default defineConfig({
  root: './',
  resolve: {
    alias: {
      '@': '/src',
      ...alias,
    },
  },
  plugins: [
    vue(),
    Unocss(),
    AutoImport({
      imports: ['@vueuse/core', 'vue'],
    }),
  ],
})
