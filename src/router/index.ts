import { createRouter, createWebHistory } from 'vue-router'
import BongoHelp from '../views/BongoHelp.vue'
import NewPatch from '../views/BongoPatch.vue'
import BongoAbout from '../views/BongoAbout.vue'

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
    {
      path: '/about',
      name: 'about',
      component: BongoAbout,
    },
  ],
})

export default router
