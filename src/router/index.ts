import { createRouter, createWebHistory } from 'vue-router'
import BongoPatch from '../views/BongoPatch.vue'
import BongoHelp from '../views/BongoHelp.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: BongoPatch,
    },
    {
      path: '/help',
      name: 'help',
      component: BongoHelp,
    },
  ],
})

export default router
