import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { presetScrollbar } from 'unocss-preset-scrollbar'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'

export default defineConfig({
  // 通过组合现有实用程序来创建新的实用程序
  shortcuts: [
    ['scrollbar', 'scrollbar:w-1.5 scrollbar:h-1.5 scrollbar:bg-transparent scrollbar-track:bg-slate-100 scrollbar-thumb:rounded scrollbar-thumb:bg-slate-300 scrollbar-track:rounded dark:scrollbar-track:bg-slate-500/[0.16] dark:scrollbar-thumb:bg-slate-500/50 pr-2'],
    ['dit', ' w-2 h-2 inline-block bg-teal-6  absolute pointer-events-auto rounded-full'],
    ['show-label', 'text-3.5 text-slate-4 mr-2 font-bold'],
    ['form-item', 'text-4 flex items-center gap-sm justify-between border-(b-1 slate-1) p-3 last:border-0'],
    ['label', 'inline-flex items-center gap-1'],
    ['input', 'px-3 border-(2 slate-3) rounded-md h-8'],
  ],
  theme: {},
  // 预设
  presets: [
    presetUno(),
    presetAttributify(),
    // 预设icon
    presetIcons({
      mode: 'mask', // 模式覆盖 i-carbon:list?bg
      scale: 1.2,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': '-0.15em',
      },
      // prefix: 'icon-',
      collections: {
        custom: FileSystemIconLoader('./src/assets/icons'),
      },
    }),
    // 预设排版
    presetTypography(),
    // 预设web字体
    presetWebFonts({}),
    presetScrollbar(),
  ],
  // 转换
  transformers: [
    // @apply用于和theme()指令的 UnoCSS 转换器
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
