import { createApp } from 'vue'
import 'uno.css'
import './assets/styles/reset.scss'
import App from './App.vue'
import type { UserModule } from './types'

const app = createApp(App)

Object.values(
  import.meta.glob<{ install: UserModule }>('./modules/*.ts', { eager: true }),
).forEach(i => i.install?.({ app }))

app.mount('#app')
