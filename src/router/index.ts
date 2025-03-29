import { createRouter, createWebHistory } from 'vue-router'
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
      path: '/about',
      name: 'about',
      component: BongoAbout,
    },
  ],
})

export default router
