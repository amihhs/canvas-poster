import { loadLanguageAsync } from '@/modules/i18n'

export const langs = {
  en: 'English',
  zh_CN: '简体中文',
} as const

export async function toggleLocales(lang: keyof typeof langs) {
  await loadLanguageAsync(lang)
}
