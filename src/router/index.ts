import { createRouter, createWebHistory } from 'vue-router'
import BongoPatch from '../views/BongoPatch.vue'
import BongoHelp from '../views/BongoHelp.vue'
import NewPatch from '../views/NewPatch.vue'
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
    {
      path: '/new-patch',
      name: 'new-patch',
      component: NewPatch,
    },
  ],
})

export default router
