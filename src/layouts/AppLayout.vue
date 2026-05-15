<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  HomeIcon, CubeIcon, ClipboardDocumentListIcon, BuildingOffice2Icon,
  TagIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon,
  MapPinIcon, UserGroupIcon, TruckIcon, ArrowsRightLeftIcon,
  ArchiveBoxXMarkIcon, WrenchScrewdriverIcon, CalculatorIcon,
  QrCodeIcon, BookOpenIcon, BanknotesIcon, DocumentChartBarIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const router = useRouter()
const sidebarOpen = ref(false)
const userMenuOpen = ref(false)

interface NavItem { name: string; to: string; icon: any; perm?: string }
interface NavGroup { title: string; items: NavItem[] }

const groups: NavGroup[] = [
  {
    title: '',
    items: [{ name: 'Tableau de bord', to: '/dashboard', icon: HomeIcon }],
  },
  {
    title: 'Patrimoine',
    items: [
      { name: 'Immobilisations', to: '/immobilisations', icon: CubeIcon },
      { name: 'Mouvements', to: '/mouvements', icon: ArrowsRightLeftIcon },
      { name: 'Sorties', to: '/sorties', icon: ArchiveBoxXMarkIcon },
      { name: 'Maintenances', to: '/maintenances', icon: WrenchScrewdriverIcon },
      { name: 'Amortissements', to: '/amortissements', icon: CalculatorIcon },
    ],
  },
  {
    title: 'Inventaire',
    items: [
      { name: 'Campagnes', to: '/inventaire/campagnes', icon: ClipboardDocumentListIcon },
    ],
  },
  {
    title: 'Codification',
    items: [
      { name: 'Plans de codification', to: '/codification', icon: BookOpenIcon },
      { name: 'Étiquettes', to: '/etiquettes', icon: QrCodeIcon },
    ],
  },
  {
    title: 'Comptabilité',
    items: [
      { name: 'Imports', to: '/comptabilite/imports', icon: BanknotesIcon },
      { name: 'Réconciliation', to: '/comptabilite/reconciliation', icon: DocumentChartBarIcon },
    ],
  },
  {
    title: 'Référentiel',
    items: [
      { name: 'Sites', to: '/sites', icon: BuildingOffice2Icon },
      { name: 'Localisations', to: '/localisations', icon: MapPinIcon },
      { name: 'Services', to: '/services', icon: UserGroupIcon },
      { name: 'Catégories', to: '/categories', icon: TagIcon },
      { name: 'Fournisseurs', to: '/fournisseurs', icon: TruckIcon },
    ],
  },
  {
    title: 'Administration',
    items: [
      { name: 'Utilisateurs', to: '/admin/users', icon: UsersIcon, perm: 'users.view' },
    ],
  },
]

function canSee(item: NavItem): boolean {
  if (!item.perm) return true
  return auth.can(item.perm)
}

async function logout() {
  await auth.logout()
  router.push('/login')
}

onMounted(async () => {
  if (auth.isAuthenticated) {
    try { await auth.fetchMe() } catch { /* géré par l'intercepteur */ }
  }
})
</script>

<template>
  <div class="min-h-screen flex bg-slate-50">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gespat-800 text-white transform transition-transform overflow-y-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <div class="flex items-center justify-between h-16 px-4 border-b border-gespat-700 sticky top-0 bg-gespat-800 z-10">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold">G</div>
          <span class="text-lg font-semibold">GESPAT</span>
        </div>
        <button @click="sidebarOpen = false" class="lg:hidden text-white/70 hover:text-white">
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <nav class="px-2 py-4 space-y-4">
        <div v-for="(group, gi) in groups" :key="gi">
          <div v-if="group.title"
               class="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-white/40">
            {{ group.title }}
          </div>
          <div class="space-y-0.5">
            <RouterLink
              v-for="item in group.items.filter(canSee)" :key="item.to" :to="item.to"
              class="flex items-center gap-3 px-3 py-2 rounded text-sm font-medium text-white/80
                     hover:bg-gespat-700 hover:text-white transition"
              active-class="bg-gespat-700 text-white"
            >
              <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
              {{ item.name }}
            </RouterLink>
          </div>
        </div>
      </nav>

      <div class="p-4 text-xs text-white/40 border-t border-gespat-700 mt-4">
        v1.0 — MRTECH
      </div>
    </aside>

    <!-- Backdrop mobile -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false"
         class="fixed inset-0 z-20 bg-black/40 lg:hidden" />

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div class="flex items-center justify-between h-16 px-4 lg:px-6">
          <button @click="sidebarOpen = true" class="lg:hidden text-slate-500">
            <Bars3Icon class="w-6 h-6" />
          </button>

          <div class="flex-1 lg:ml-0"></div>

          <div class="relative">
            <button @click="userMenuOpen = !userMenuOpen"
                    class="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-slate-100">
              <div class="w-8 h-8 rounded-full bg-gespat-100 text-gespat-700 flex items-center justify-center text-sm font-semibold">
                {{ auth.user?.prenom?.[0] }}{{ auth.user?.nom?.[0] }}
              </div>
              <div class="hidden md:block text-left">
                <div class="text-sm font-medium">{{ auth.user?.nom_complet }}</div>
                <div class="text-xs text-slate-500">{{ auth.user?.roles?.[0] ?? 'utilisateur' }}</div>
              </div>
            </button>

            <div v-if="userMenuOpen"
                 class="absolute right-0 mt-2 w-64 card divide-y divide-slate-100 z-20">
              <div class="px-4 py-3">
                <div class="text-sm font-medium">{{ auth.user?.nom_complet }}</div>
                <div class="text-xs text-slate-500">{{ auth.user?.email }}</div>
                <div class="text-xs text-slate-400 mt-1">
                  {{ auth.user?.site?.code }} · {{ auth.user?.service?.code }}
                </div>
              </div>
              <button @click="logout"
                      class="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <ArrowRightOnRectangleIcon class="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 p-4 lg:p-6 overflow-x-auto" @click="userMenuOpen = false">
        <RouterView />
      </main>
    </div>
  </div>
</template>
