import { createApp } from 'vue'
import 'uno.css'
import './assets/styles/reset.scss'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

import routes from '~pages'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App).use(router).mount('#app')
