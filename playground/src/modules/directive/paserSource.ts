import type { Directive } from 'vue'
import { parseSourceUrl } from '@/logic/shared'
import type { UserModule } from '@/types'

function parseUrlDirective(): Directive<HTMLElement, string | number> {
  const handler = async (el: HTMLElement) => {
    if (!el || el.tagName !== 'IMG')
      return

    const src = el.getAttribute('src')
    if (!src || !src.startsWith('image|'))
      return

    el.setAttribute('src', await parseSourceUrl(src))
  }
  return {
    mounted: handler,
    updated: handler,
    getSSRProps() {
      return {}
    },
    beforeUnmount() {
    },
  }
}

export const install: UserModule = ({ app }) => {
  app.directive('parse-url', parseUrlDirective())
}
