import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'
import type { UserModule } from '@/types'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export const install: UserModule = ({ app }) => {
  app.use(router)
}
