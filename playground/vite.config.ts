import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import { alias } from '../alias'
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      ...alias,
    },
  },
  plugins: [
    vue(),
    Unocss(),
  ],
})
