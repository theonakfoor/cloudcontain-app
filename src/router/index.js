import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from "@auth0/auth0-vue";

import EnvironmentView from '@/views/EnvironmentView.vue'
import DriveView from '@/views/DriveView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
