import { createRouter, createWebHistory } from 'vue-router'
import BongoHelp from '../views/BongoHelp.vue'
import NewPatch from '../views/NewPatch.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: NewPatch,
    },
    {
      path: '/help',
      name: 'help',
      component: BongoHelp,
    },
  ],
})

export default router
