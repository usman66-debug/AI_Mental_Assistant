import { createRouter, createWebHistory } from 'vue-router'
//前台页面后台页面风格迥异，建议写两个不同的路由配置
const backendRoutes = [
  {
    path: '/back',
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
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: backendRoutes,
})

export default router
