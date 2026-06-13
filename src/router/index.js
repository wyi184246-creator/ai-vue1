import { createRouter, createWebHistory } from 'vue-router'
import BackendLayout from '../components/BackendLayout.vue'
import AuthLayout from '../components/AuthLayout.vue'
import FrontendLayout from '../components/FrontendLayout.vue'
import { useUserStore } from '../stores/user'
const backendRoutes = [
  {
    path: '/back',
    redirect: '/back/dashboard',
    component: BackendLayout,
    children: [
      {path: 'dashboard',
         component: () => import('@/views/dashboard.vue'),
        meta: { title:'数据分析',
               icon:'PieChart'
        }
        },
        {
          path:'knowledge',
          component: () => import('@/views/knowledge.vue'),
          meta: { title:'知识文章',
                 icon:'ChatLineSquare'
          }
        },
        {
          path:'consultations',
          component: () => import('@/views/consultations.vue'),
          meta: { title:'咨询记录',
                 icon:'Message'
          }
        },
        {
          path:'emotional',
          component: () => import('@/views/emotional.vue'),
          meta: { title:'情绪日志',
                 icon:'User'
          }
        }
      
]

  },
   {
  path:'/auth',
  component: AuthLayout,
  children:[
    {
      path:'login',
      component: () => import('@/views/login.vue'),
     meta: { title:'登录'}
    },
 {
      path:'register',
      component: () => import('@/views/register.vue'),
     meta: { title:'注册'}
    }
    ]
  }
]

const frontendRoutes = [
  {
    path:'/',
    component: FrontendLayout,
    children:[{
      path:'',
      component: () => import('@/views/home.vue'),
  
    },
    {
      path:'consultation',
      component: () => import('@/views/consultation.vue'),
    },
    {
      path:'emotion-diary',
      component: () => import('@/views/emotionDiary.vue'), 
    },
    {
      path:'knowledge',
      component: () => import('@/views/frontendKnowledge.vue'),
    },
      {
        path:'knowledge/article/:id',
        component:()=> import('@/views/articleDetail.vue'),
        props:true
      }
    ]
  }]

const router = createRouter({
  history: createWebHistory(),
  routes:[...frontendRoutes,...backendRoutes]
})

router.onError((error) => {
  const message = error?.message || ''
  const isChunkLoadFailed =
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Unable to preload CSS') ||
    message.includes('Loading chunk') ||
    message.includes('Importing a module script failed')

  if (isChunkLoadFailed && !sessionStorage.getItem('chunk-reload')) {
    sessionStorage.setItem('chunk-reload', '1')
    window.location.reload()
  }
})

router.afterEach(() => {
  sessionStorage.removeItem('chunk-reload')
})
  
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  if (userStore.token) {
     if(userStore.userType==2){
      if(to.path.startsWith('/back')) {
        next();
      } else {
        next('/back/dashboard');
      }
     } else if(userStore.userType==1){
     if(to.path.startsWith('/back')||to.path.startsWith('/auth')) 
      {
        next('/');
      } else {
        next();
      
     }
  } }else {
     if(to.path.startsWith('/back')) {
      next('/auth/login');
    } else {
      next();
    }
  }
});

export default router
