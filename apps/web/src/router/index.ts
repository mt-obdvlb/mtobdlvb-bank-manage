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

//全局路由守卫
router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('user') // 每次都重新获取
  const userStr = JSON.parse(user || '{}')
  // 检查是否需要认证的路由
  if (to.path !== '/login' && !userStr?.userInfo?.id) {
    // 用户未登录，重定向到登录页
    next('/login')
    return
  } else {
    // 允许访问
    next()
  }
})

export default router
