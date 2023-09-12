import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {
  HeadlessUiResolver,
} from 'unplugin-vue-components/resolvers'
import { alias } from '../alias'

// https://vitejs.dev/config/
export default defineConfig({
  root: './',
  resolve: {
    alias: {
      ...alias,
      '@': '/src',
    },
  },
  plugins: [
    vue(),
    Unocss(),
    AutoImport({
      imports: ['@vueuse/core', 'vue'],
      dts: true,
      dirs: ['./src/logic', './src/interface'],
    }),
    Components({
      resolvers: [
        HeadlessUiResolver(),
      ],
      dts: true,
      directoryAsNamespace: true,
      dirs: ['./src/components'],
    }),
  ],
})
