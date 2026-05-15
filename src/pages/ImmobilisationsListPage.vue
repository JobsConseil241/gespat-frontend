<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { immosApi, categoriesApi, sitesApi, reportsApi } from '@/api/endpoints'
import type { Immobilisation, CategorieImmobilisation, Site } from '@/types'
import { PlusIcon, ArrowDownTrayIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const items = ref<Immobilisation[]>([])
const meta = ref<any>({})
const loading = ref(true)
const categories = ref<CategorieImmobilisation[]>([])
const sites = ref<Site[]>([])

const filters = reactive({
  search: '',
  site_id: '',
  categorie_id: '',
  statut: '',
  page: 1,
})

const statutVariants: Record<string, string> = {
  actif: 'badge-success', en_maintenance: 'badge-warning', en_transfert: 'badge-info',
  reforme: 'badge-gray', cede: 'badge-gray', perdu: 'badge-danger',
  vole: 'badge-danger', detruit: 'badge-danger',
}

const fmt = (v: number | string) => new Intl.NumberFormat('fr-FR').format(typeof v === 'string' ? parseFloat(v) : v)

async function load() {
  loading.value = true
  try {
    const { data } = await immosApi.list({
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '')),
    })
    items.value = data.data
    meta.value = data.meta
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const [c, s] = await Promise.all([categoriesApi.list({ per_page: 100 }), sitesApi.list({ per_page: 100 })])
  categories.value = c.data.data
  sites.value = s.data.data
  await load()
})

let searchTimer: number | undefined
watch(() => filters.search, () => {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => { filters.page = 1; load() }, 300)
})

function applyFilter() { filters.page = 1; load() }
function changePage(p: number) { filters.page = p; load() }

function downloadExcel() {
  const params: Record<string, string> = {}
  if (filters.site_id) params.site_id = String(filters.site_id)
  if (filters.categorie_id) params.categorie_id = String(filters.categorie_id)
  if (filters.statut) params.statut = filters.statut
  const url = reportsApi.excelUrl(params) + (params ? '&' : '?') + 'token=' + localStorage.getItem('gespat_token')
  // Note: download via fetch + blob pour passer le Bearer
  fetch(reportsApi.excelUrl(params), {
    headers: { Authorization: `Bearer ${localStorage.getItem('gespat_token')}` },
  }).then(r => r.blob()).then(blob => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `immobilisations-${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
  })
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-bold">Immobilisations</h1>
      <div class="flex gap-2">
        <button @click="downloadExcel" class="btn-secondary">
          <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
          Export Excel
        </button>
        <RouterLink to="/immobilisations/nouveau" class="btn-primary">
          <PlusIcon class="w-4 h-4 mr-2" />
          Nouveau bien
        </RouterLink>
      </div>
    </div>

    <!-- Filtres -->
    <div class="card p-4 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="relative">
          <MagnifyingGlassIcon class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input v-model="filters.search" placeholder="Recherche code, libellé, n° série…"
                 class="input pl-9">
        </div>
        <select v-model="filters.site_id" @change="applyFilter" class="input">
          <option value="">Tous les sites</option>
          <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.code }} — {{ s.libelle }}</option>
        </select>
        <select v-model="filters.categorie_id" @change="applyFilter" class="input">
          <option value="">Toutes les catégories</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.code }} — {{ c.libelle }}</option>
        </select>
        <select v-model="filters.statut" @change="applyFilter" class="input">
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="en_maintenance">En maintenance</option>
          <option value="reforme">Réformé</option>
          <option value="cede">Cédé</option>
          <option value="perdu">Perdu</option>
        </select>
      </div>
    </div>

    <!-- Tableau -->
    <div class="card overflow-hidden">
      <table class="table">
        <thead>
          <tr>
            <th>Code inventaire</th>
            <th>Libellé</th>
            <th>Catégorie</th>
            <th>Site</th>
            <th class="text-right">Valeur</th>
            <th>État</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center py-8 text-slate-500">Chargement…</td>
          </tr>
          <tr v-else-if="items.length === 0">
            <td colspan="7" class="text-center py-8 text-slate-400">Aucune immobilisation</td>
          </tr>
          <tr v-for="immo in items" :key="immo.id" class="cursor-pointer"
              @click="$router.push(`/immobilisations/${immo.id}`)">
            <td class="font-mono text-xs">{{ immo.code_inventaire }}</td>
            <td class="font-medium">{{ immo.libelle }}</td>
            <td><span class="badge-info">{{ immo.categorie?.code }}</span></td>
            <td><span class="badge-gray">{{ immo.site?.code }}</span></td>
            <td class="text-right tabular-nums">{{ fmt(immo.valeur_acquisition) }} {{ immo.devise }}</td>
            <td><span class="badge-gray">{{ immo.etat_physique }}</span></td>
            <td><span :class="statutVariants[immo.statut] || 'badge-gray'">{{ immo.statut }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="meta.last_page > 1" class="flex items-center justify-between mt-4 text-sm">
      <div class="text-slate-500">
        Page {{ meta.current_page }} / {{ meta.last_page }} — {{ meta.total }} biens
      </div>
      <div class="flex gap-1">
        <button :disabled="filters.page <= 1" @click="changePage(filters.page - 1)" class="btn-secondary px-3 py-1">
          Précédent
        </button>
        <button :disabled="filters.page >= meta.last_page" @click="changePage(filters.page + 1)" class="btn-secondary px-3 py-1">
          Suivant
        </button>
      </div>
    </div>
  </div>
</template>
