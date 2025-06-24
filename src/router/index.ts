import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import Vina from '../views/VineDetalepage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/vina',
    name: 'Vina',
    component: Vina,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
