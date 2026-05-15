<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { dashboardApi } from '@/api/endpoints'
import type { KpiData } from '@/types'
import {
  CubeIcon, CheckCircleIcon, ArchiveBoxXMarkIcon, BanknotesIcon, ClipboardDocumentListIcon,
} from '@heroicons/vue/24/outline'
import ChartCard from '@/components/ChartCard.vue'

const kpi = ref<KpiData | null>(null)
const parCategorie = ref<any[]>([])
const parSite = ref<any[]>([])
const parStatut = ref<any[]>([])
const loading = ref(true)

const fmt = (v: number | string) => new Intl.NumberFormat('fr-FR').format(typeof v === 'string' ? parseFloat(v) : v)

const palette = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16']

const categorieChart = computed(() => ({
  labels: parCategorie.value.map((c) => `${c.code} — ${c.libelle}`),
  datasets: [{ data: parCategorie.value.map((c) => Number(c.nombre)), backgroundColor: palette }],
}))

const siteChart = computed(() => ({
  labels: parSite.value.map((s) => s.code),
  datasets: [{
    label: 'Nombre de biens',
    data: parSite.value.map((s) => Number(s.nombre)),
    backgroundColor: '#0284c7',
  }, {
    label: 'Valeur brute (millions XAF)',
    data: parSite.value.map((s) => Number(s.valeur_brute) / 1_000_000),
    backgroundColor: '#10b981',
  }],
}))

const statutChart = computed(() => ({
  labels: parStatut.value.map((s) => s.statut),
  datasets: [{
    data: parStatut.value.map((s) => Number(s.nombre)),
    backgroundColor: parStatut.value.map((s) => ({
      actif: '#10b981', en_maintenance: '#f59e0b', en_transfert: '#0284c7',
      reforme: '#94a3b8', cede: '#94a3b8', perdu: '#ef4444',
      vole: '#ef4444', detruit: '#ef4444',
    } as Record<string, string>)[s.statut] || '#6b7280'),
  }],
}))

onMounted(async () => {
  try {
    const [k, c, s, st] = await Promise.all([
      dashboardApi.kpi(),
      dashboardApi.parCategorie(),
      dashboardApi.parSite(),
      dashboardApi.parStatut(),
    ])
    kpi.value = k.data.data
    parCategorie.value = c.data.data as any
    parSite.value = s.data.data as any
    parStatut.value = st.data.data as any
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Tableau de bord</h1>

    <div v-if="loading" class="text-slate-500">Chargement…</div>

    <template v-else-if="kpi">
      <!-- KPI cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="card p-5">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-slate-500">Total biens</div>
              <div class="text-3xl font-bold mt-1">{{ fmt(kpi.biens.total) }}</div>
            </div>
            <div class="w-12 h-12 rounded-lg bg-gespat-100 text-gespat-700 flex items-center justify-center">
              <CubeIcon class="w-6 h-6" />
            </div>
          </div>
        </div>

        <div class="card p-5">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-slate-500">Biens actifs</div>
              <div class="text-3xl font-bold mt-1 text-emerald-600">{{ fmt(kpi.biens.actifs) }}</div>
            </div>
            <div class="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircleIcon class="w-6 h-6" />
            </div>
          </div>
        </div>

        <div class="card p-5">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-slate-500">Biens sortis</div>
              <div class="text-3xl font-bold mt-1 text-amber-600">{{ fmt(kpi.biens.sortis) }}</div>
            </div>
            <div class="w-12 h-12 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <ArchiveBoxXMarkIcon class="w-6 h-6" />
            </div>
          </div>
        </div>

        <div class="card p-5">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-slate-500">Campagnes en cours</div>
              <div class="text-3xl font-bold mt-1 text-blue-600">{{ kpi.inventaire.campagnes_en_cours }}</div>
            </div>
            <div class="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <ClipboardDocumentListIcon class="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <!-- Valorisation -->
      <div class="card p-5 mb-6">
        <div class="flex items-center gap-3 mb-4">
          <BanknotesIcon class="w-6 h-6 text-slate-500" />
          <h2 class="text-lg font-semibold">Valorisation patrimoine</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="border-l-4 border-gespat-500 pl-4">
            <div class="text-sm text-slate-500">Valeur brute d'acquisition</div>
            <div class="text-2xl font-bold mt-1">
              {{ fmt(kpi.valorisation.valeur_brute_acquisition) }}
              <span class="text-sm text-slate-500 font-normal ml-1">{{ kpi.valorisation.devise }}</span>
            </div>
          </div>
          <div class="border-l-4 border-emerald-500 pl-4">
            <div class="text-sm text-slate-500">VNC totale (exercice courant)</div>
            <div class="text-2xl font-bold mt-1">
              {{ fmt(kpi.valorisation.vnc_totale_exercice_courant) }}
              <span class="text-sm text-slate-500 font-normal ml-1">{{ kpi.valorisation.devise }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Graphiques -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div class="card p-5">
          <h2 class="text-lg font-semibold mb-4">Répartition par catégorie</h2>
          <ChartCard v-if="parCategorie.length"
                     type="doughnut" :labels="categorieChart.labels"
                     :datasets="categorieChart.datasets" />
          <p v-else class="text-sm text-slate-400 text-center py-8">Aucune donnée</p>
        </div>

        <div class="card p-5">
          <h2 class="text-lg font-semibold mb-4">Répartition par statut</h2>
          <ChartCard v-if="parStatut.length"
                     type="doughnut" :labels="statutChart.labels"
                     :datasets="statutChart.datasets" />
          <p v-else class="text-sm text-slate-400 text-center py-8">Aucune donnée</p>
        </div>
      </div>

      <div class="card p-5 mb-6">
        <h2 class="text-lg font-semibold mb-4">Patrimoine par site (nombre + valorisation)</h2>
        <ChartCard v-if="parSite.length"
                   type="bar" :labels="siteChart.labels"
                   :datasets="siteChart.datasets" />
        <p v-else class="text-sm text-slate-400 text-center py-8">Aucune donnée</p>
      </div>

      <!-- Tableaux détaillés -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card p-5">
          <h2 class="text-lg font-semibold mb-4">Détail par catégorie</h2>
          <table class="table">
            <thead><tr><th>Code</th><th>Catégorie</th><th class="text-right">Nb</th><th class="text-right">Valeur</th></tr></thead>
            <tbody>
              <tr v-for="row in parCategorie" :key="row.code">
                <td><span class="badge-info">{{ row.code }}</span></td>
                <td>{{ row.libelle }}</td>
                <td class="text-right tabular-nums">{{ fmt(row.nombre) }}</td>
                <td class="text-right tabular-nums">{{ fmt(row.valeur_brute) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card p-5">
          <h2 class="text-lg font-semibold mb-4">Détail par site</h2>
          <table class="table">
            <thead><tr><th>Code</th><th>Site</th><th class="text-right">Nb</th><th class="text-right">Valeur</th></tr></thead>
            <tbody>
              <tr v-for="row in parSite" :key="row.code">
                <td><span class="badge-gray">{{ row.code }}</span></td>
                <td>{{ row.libelle }}</td>
                <td class="text-right tabular-nums">{{ fmt(row.nombre) }}</td>
                <td class="text-right tabular-nums">{{ fmt(row.valeur_brute) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
