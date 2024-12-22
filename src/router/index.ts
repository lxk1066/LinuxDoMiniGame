import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GameRoom from '@/views/GameRoom.vue'
import GetInviteCode from '@/views/GetInviteCode.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
import OfflineGames from '@/views/OfflineGame/OfflineGames.vue'
import machineView from '@/views/OfflineGame/MachineView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/game/:id',
      name: 'gameRoom',
      component: GameRoom
    },
    {
      path: '/invite',
      name: 'GetInviteCode',
      component: GetInviteCode
    },
    {
      path: '/signup',
      name: 'signup',
      component: RegisterView
    },
    {
      path: '/signin',
      name: 'signin',
      component: LoginView
    },
    {
      path: '/offline',
      name: 'offline',
      redirect: '/offline/index', // 重定向到子路由 'index'
      children: [
        {
          path: 'index', // 相对路径
          name: 'offlineIndex',
          component: OfflineGames
        },
        {
          path: 'machine', // 相对路径
          name: 'machine',
          component: machineView
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  // 如果请求的是首页并且查询参数中携带token,则解析出token
  if (to.path === '/login' && to.query.t) {
    const token = to.query.t as string
    localStorage.setItem('token', token as string)
    // 重定向到首页，清除所有的查询参数
    location.href = '/'
  } else {
    next()
  }
})

export default router
