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

      // Patrimoine
      { path: 'immobilisations', name: 'immobilisations', component: () => import('@/pages/ImmobilisationsListPage.vue') },
      { path: 'immobilisations/nouveau', name: 'immobilisation-create', component: () => import('@/pages/ImmobilisationFormPage.vue') },
      { path: 'immobilisations/:id', name: 'immobilisation-detail', component: () => import('@/pages/ImmobilisationDetailPage.vue') },
      { path: 'mouvements', name: 'mouvements', component: () => import('@/pages/MouvementsListPage.vue') },
      { path: 'sorties', name: 'sorties', component: () => import('@/pages/SortiesListPage.vue') },
      { path: 'maintenances', name: 'maintenances', component: () => import('@/pages/MaintenancesListPage.vue') },
      { path: 'amortissements', name: 'amortissements', component: () => import('@/pages/AmortissementsPage.vue') },

      // Inventaire
      { path: 'inventaire/campagnes', name: 'campagnes', component: () => import('@/pages/CampagnesListPage.vue') },
      { path: 'inventaire/campagnes/nouvelle', name: 'campagne-create', component: () => import('@/pages/CampagneFormPage.vue') },
      { path: 'inventaire/campagnes/:id', name: 'campagne-detail', component: () => import('@/pages/CampagneDetailPage.vue') },

      // Codification
      { path: 'codification', name: 'codification', component: () => import('@/pages/CodificationPage.vue') },
      { path: 'etiquettes', name: 'etiquettes', component: () => import('@/pages/EtiquettesPage.vue') },

      // Comptabilité
      { path: 'comptabilite/imports', name: 'compta-imports', component: () => import('@/pages/ComptabiliteImportsPage.vue') },
      { path: 'comptabilite/imports/:id', name: 'compta-matching', component: () => import('@/pages/ComptabiliteMatchingPage.vue') },
      { path: 'comptabilite/reconciliation', name: 'compta-reconciliation', component: () => import('@/pages/ComptabiliteReconciliationPage.vue') },

      // Référentiel
      { path: 'sites', name: 'sites', component: () => import('@/pages/SitesListPage.vue') },
      { path: 'localisations', name: 'localisations', component: () => import('@/pages/LocalisationsListPage.vue') },
      { path: 'services', name: 'services', component: () => import('@/pages/ServicesListPage.vue') },
      { path: 'categories', name: 'categories', component: () => import('@/pages/CategoriesListPage.vue') },
      { path: 'fournisseurs', name: 'fournisseurs', component: () => import('@/pages/FournisseursListPage.vue') },

      // Administration
      { path: 'admin/users', name: 'admin-users', component: () => import('@/pages/UsersListPage.vue') },
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
