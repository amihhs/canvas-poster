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
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'

export default defineConfig({
  // 通过组合现有实用程序来创建新的实用程序
  shortcuts: [],
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
  ],
  // 转换
  transformers: [
    // @apply用于和theme()指令的 UnoCSS 转换器
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
