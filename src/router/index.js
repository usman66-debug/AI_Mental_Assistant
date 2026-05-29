import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import FrontendLayout from '@/components/frontend/FrontendLayout.vue'
//前台页面后台页面风格迥异，建议写两个不同的路由配置
const backendRoutes = [
  {
    path: '/back',
    redirect: '/back/dashboard',
    component: () => import('@/components/backend/BackendLayout.vue'),
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/backend/DashBoard.vue'),
        meta: {
          title: '数据分析',
          icon: 'PieChart',
        },
      },
      {
        path: 'knowledge',
        component: () => import('@/views/backend/KnowledgeView.vue'),
        meta: {
          title: '知识文章',
          icon: 'ChatLineSquare',
        },
      },
      {
        path: 'consultation',
        component: () => import('@/views/backend/ConsultationView.vue'),
        meta: {
          title: '咨询记录',
          icon: 'Message',
        },
      },
      {
        path: 'emotional',
        component: () => import('@/views/backend/EmotionalView.vue'),
        meta: {
          title: '情绪日志',
          icon: 'User',
        },
      },
    ],
  },
  {
    path: '/auth',
    component: () => import('@/components/backend/AuthLayout.vue'),
    children: [
      {
        path: 'register',
        component: () => import('@/views/AuthLayoutCom/RegisterView.vue'),
        meta: {
          title: '注册',
        },
      },
      {
        path: 'login',
        component: () => import('@/views/AuthLayoutCom/LoginView.vue'),
        meta: {
          title: '登录',
        },
      },
    ],
  },
]

const frontendRoutes = [
  {
    path: '/',
    component: FrontendLayout,
    children: [
      {
        path: '',
        component: () => import('@/views/frontend/HomeView.vue'),
      },
      {
        path: 'knowledge',
        component: () => import('@/views/frontend/FrontKnowledgeView.vue'),
      },
      {
        path: 'consultation',
        component: () => import('@/views/frontend/ConsultationView.vue'),
      },
      {
        path: 'emotion-diary',
        component: () => import('@/views/frontend/EmotionDiary.vue'),
      },
    ],
  },
]
//创建路由器
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...backendRoutes, ...frontendRoutes],
})

//配置路由前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  //判断当前用户是否登录
  if (token) {
    //判断是前台用户还是后台用户
    const userInfo = JSON.parse(localStorage.getItem('userinfo'))
    if (userInfo.userType === 2) {
      //后台用户，直接放行
      if (to.path.startsWith('/back')) {
        //放行到相应页面
        next()
      } else {
        next('/back/dashboard')
      }
    } else if (userInfo.userType === 1) {
      //前台用户，直接放行
    }
  } else {
    //没有登录的话，判断想访问的是后台页面还是前台页面
    //如果是后台页面，提示用户先登录
    if (to.path.startsWith('/back')) {
      ElMessage.error('请先登录')
      next('/auth/login')
    } else {
      //前台用户，直接放行
      next()
    }
  }
})

export default router
