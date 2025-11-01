import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from "@auth0/auth0-vue";

import EnvironmentView from '@/views/EnvironmentView.vue'
import DriveView from '@/views/DriveView.vue'
import LandingView from '@/views/LandingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/drive',
      name: 'drive',
      component: DriveView,
      beforeEnter: authGuard
    },
    {
      path: '/env/:containerId',
      name: 'environment',
      component: EnvironmentView,
      beforeEnter: authGuard
    },
  ],
})

export default router
