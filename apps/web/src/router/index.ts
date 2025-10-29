import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/pages/LoginPage.vue'
import Home from '@/pages/Home.vue'
import Layout from '@/pages/Layout.vue'
import Profile from '@/pages/Profile.vue'
import Cards from '@/pages/Cards.vue'
import type { RouteRecordRaw } from 'vue-router'

const routes = [
  { path: '/login', component: LoginPage },
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', component: Home },
      {
        path: '/profile',
        component: Profile,
      },
      { path: '/cards', component: Cards },
    ],
  },
] as RouteRecordRaw[]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
