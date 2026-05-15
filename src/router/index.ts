import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'dashboard', component: () => import('@/pages/DashboardPage.vue') },
      { path: 'immobilisations', name: 'immobilisations', component: () => import('@/pages/ImmobilisationsListPage.vue') },
      { path: 'immobilisations/nouveau', name: 'immobilisation-create', component: () => import('@/pages/ImmobilisationFormPage.vue') },
      { path: 'immobilisations/:id', name: 'immobilisation-detail', component: () => import('@/pages/ImmobilisationDetailPage.vue') },
      { path: 'campagnes', name: 'campagnes', component: () => import('@/pages/CampagnesListPage.vue') },
      { path: 'campagnes/:id', name: 'campagne-detail', component: () => import('@/pages/CampagneDetailPage.vue') },
      { path: 'sites', name: 'sites', component: () => import('@/pages/SitesListPage.vue') },
      { path: 'categories', name: 'categories', component: () => import('@/pages/CategoriesListPage.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guest && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
