import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProfileView from '../views/ProfileView.vue'
import AnalyzeView from '../views/AnalyzeView.vue'
import ResultadoAnaliseView from '../views/ResultadoAnaliseView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // Adicionar configurações para evitar recarregamento desnecessário de componentes
  scrollBehavior(to, from, savedPosition) {
    // Retornar a posição salva se houver
    if (savedPosition) {
      return savedPosition;
    }
    // Caso contrário, ir para o topo da página
    return { top: 0 };
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/profile/:username',
      name: 'profile',
      component: ProfileView
    },
    {
      path: '/analyze',
      name: 'analyze',
      component: AnalyzeView
    },
    {
      path: '/resultado-analise',
      name: 'resultado-analise',
      component: ResultadoAnaliseView
    },
    // Rota específica para análise com username diretamente na URL
    {
      path: '/analyze/:username',
      name: 'analyze-direct',
      component: AnalyzeView,
      props: true // Passa o parâmetro de rota como prop para o componente
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

// Prevenir navegações desnecessárias para a mesma rota
router.beforeEach((to, from, next) => {
  // Se estamos navegando para a mesma rota, cancelar
  if (to.path === from.path) {
    console.log('Prevenindo navegação redundante para a mesma rota:', to.path);
    return next(false);
  }
  
  // Se estamos indo para a rota /analyze com um nome de usuário no estado,
  // redirecionar para /analyze/:username
  if (to.name === 'analyze' && to.params.username) {
    console.log('Redirecionando para analyze-direct com usuário:', to.params.username);
    return next({ 
      name: 'analyze-direct', 
      params: { username: to.params.username }
    });
  }
  
  next();
});

export default router 