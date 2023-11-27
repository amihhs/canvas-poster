import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Pages from 'vite-plugin-pages'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
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
    Pages(),
    vue({
      script: {
        defineModel: true,
      },
    }),
    Unocss(),
    VueI18nPlugin({
      runtimeOnly: true,
      compositionOnly: true,
      fullInstall: true,
      include: [path.resolve(__dirname, 'locales/**')],
    }),
    AutoImport({
      imports: [
        '@vueuse/core',
        'vue',
        'vue-router',
        {
          'vue': ['defineModel'],
          'vue-i18n': ['useI18n'],
        },
      ],
      dts: true,
      dirs: [
        './src/logic/**',
        './src/interface',
        './src/shared',
      ],
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
