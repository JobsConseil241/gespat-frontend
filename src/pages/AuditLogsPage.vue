<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { auditApi } from '@/api/endpoints'
import PageHeader from '@/components/PageHeader.vue'
import Pagination from '@/components/Pagination.vue'
import EmptyState from '@/components/EmptyState.vue'
import ChartCard from '@/components/ChartCard.vue'
import { EyeIcon } from '@heroicons/vue/24/outline'

const items = ref<any[]>([])
const meta = ref<any>(null)
const stats = ref<any>(null)
const loading = ref(true)
const showDetail = ref<any>(null)

const filters = reactive({
  search_entity: '',
  action: '',
  date_debut: '',
  date_fin: '',
  page: 1,
})

const eventVariants: Record<string, string> = {
  created: 'badge-success',
  updated: 'badge-info',
  deleted: 'badge-danger',
  restored: 'badge-warning',
}

const palette = ['#10b981', '#0284c7', '#ef4444', '#f59e0b']

const actionChart = computed(() => {
  if (!stats.value?.par_action) return { labels: [], datasets: [] }
  return {
    labels: stats.value.par_action.map((a: any) => a.event),
    datasets: [{
      data: stats.value.par_action.map((a: any) => Number(a.nb)),
      backgroundColor: palette,
    }],
  }
})

const jourChart = computed(() => {
  if (!stats.value?.par_jour_30) return { labels: [], datasets: [] }
  return {
    labels: stats.value.par_jour_30.map((j: any) => j.jour?.substring(0, 10)),
    datasets: [{
      label: 'Activités par jour',
      data: stats.value.par_jour_30.map((j: any) => Number(j.nb)),
      backgroundColor: '#0284c7',
    }],
  }
})

async function load() {
  loading.value = true
  try {
    const params: any = { page: filters.page, per_page: 50 }
    if (filters.search_entity) params.entity_type = filters.search_entity
    if (filters.action) params.action = filters.action
    if (filters.date_debut) params.date_debut = filters.date_debut
    if (filters.date_fin) params.date_fin = filters.date_fin
    const { data } = await auditApi.list(params)
    items.value = (data as any).data
    meta.value = (data as any).meta
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  const { data } = await auditApi.stats()
  stats.value = (data as any).data
}

onMounted(async () => {
  await Promise.all([load(), loadStats()])
})

function entityShortName(type: string): string {
  return type?.split('\\').pop() || type
}

function diff(audit: any): Array<{ field: string; old: any; new: any }> {
  if (!audit.new_values) return []
  return Object.keys(audit.new_values).map((k) => ({
    field: k,
    old: audit.old_values?.[k] ?? null,
    new: audit.new_values[k],
  }))
}
</script>

<template>
  <div>
    <PageHeader title="Audit trail" subtitle="Historique complet des actions horodatées et imputables" />

    <!-- Stats charts -->
    <div v-if="stats" class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <div class="card p-5">
        <div class="text-sm text-slate-500">Total des actions ({{ new Date().getFullYear() }})</div>
        <div class="text-3xl font-bold mt-1">{{ stats.total }}</div>
      </div>
      <div class="card p-5 lg:col-span-1">
        <h3 class="text-sm font-semibold mb-3">Par type d'action</h3>
        <ChartCard v-if="stats.par_action?.length"
                   type="doughnut" :labels="actionChart.labels"
                   :datasets="actionChart.datasets" />
      </div>
      <div class="card p-5 lg:col-span-1">
        <h3 class="text-sm font-semibold mb-3">30 derniers jours</h3>
        <ChartCard v-if="stats.par_jour_30?.length"
                   type="bar" :labels="jourChart.labels"
                   :datasets="jourChart.datasets" />
      </div>
    </div>

    <!-- Filtres -->
    <div class="card p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
      <input v-model="filters.search_entity" placeholder="Type d'entité (Immobilisation, Site, …)"
             @keyup.enter="filters.page = 1; load()" class="input">
      <select v-model="filters.action" @change="filters.page = 1; load()" class="input">
        <option value="">Toutes les actions</option>
        <option value="created">Création</option>
        <option value="updated">Modification</option>
        <option value="deleted">Suppression</option>
        <option value="restored">Restauration</option>
      </select>
      <input v-model="filters.date_debut" type="date" @change="filters.page = 1; load()" class="input">
      <input v-model="filters.date_fin" type="date" @change="filters.page = 1; load()" class="input">
    </div>

    <!-- Logs -->
    <div class="card overflow-hidden">
      <table class="table">
        <thead><tr>
          <th>Date</th><th>Utilisateur</th><th>Entité</th><th>ID</th><th>Action</th><th>IP</th><th></th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="7" class="text-center py-8 text-slate-500">Chargement…</td></tr>
          <tr v-else-if="items.length === 0"><td colspan="7"><EmptyState message="Aucun audit log." /></td></tr>
          <tr v-for="a in items" :key="a.id">
            <td class="text-xs whitespace-nowrap">{{ a.created_at?.substring(0, 16).replace('T', ' ') }}</td>
            <td class="text-xs">
              <div v-if="a.user" class="font-medium">{{ a.user.prenom }} {{ a.user.nom }}</div>
              <div v-else class="text-slate-400">— système —</div>
              <div v-if="a.user" class="text-slate-500 font-mono">{{ a.user.matricule }}</div>
            </td>
            <td><span class="badge-gray">{{ entityShortName(a.auditable_type) }}</span></td>
            <td class="text-xs font-mono">#{{ a.auditable_id }}</td>
            <td><span :class="eventVariants[a.event] || 'badge-gray'">{{ a.event }}</span></td>
            <td class="text-xs font-mono text-slate-500">{{ a.ip_address }}</td>
            <td>
              <button @click="showDetail = a" class="text-slate-500 hover:text-gespat-600">
                <EyeIcon class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :meta="meta" @change="(p) => { filters.page = p; load() }" />

    <!-- Modal détail -->
    <Teleport to="body">
      <div v-if="showDetail" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto"
           @click.self="showDetail = null">
        <div class="card w-full max-w-3xl p-6">
          <h3 class="text-lg font-semibold">Détail de l'audit #{{ showDetail.id }}</h3>
          <div class="text-sm text-slate-500 mt-1">
            {{ showDetail.created_at?.substring(0, 19).replace('T', ' ') }} —
            <strong>{{ showDetail.event }}</strong> sur {{ entityShortName(showDetail.auditable_type) }}
            #{{ showDetail.auditable_id }}
          </div>

          <dl class="grid grid-cols-2 gap-3 mt-4 text-sm bg-slate-50 p-4 rounded">
            <div><dt class="text-slate-500">Utilisateur</dt>
              <dd class="font-medium">
                {{ showDetail.user ? `${showDetail.user.prenom} ${showDetail.user.nom}` : '— système —' }}
              </dd></div>
            <div><dt class="text-slate-500">IP</dt><dd class="font-mono">{{ showDetail.ip_address }}</dd></div>
            <div class="col-span-2"><dt class="text-slate-500">User-Agent</dt>
              <dd class="text-xs font-mono break-all">{{ showDetail.user_agent }}</dd></div>
            <div class="col-span-2"><dt class="text-slate-500">URL</dt>
              <dd class="text-xs font-mono break-all">{{ showDetail.url }}</dd></div>
          </dl>

          <h4 class="font-semibold mt-4 mb-2">Champs modifiés</h4>
          <div class="border border-slate-200 rounded overflow-hidden">
            <table class="table">
              <thead><tr><th>Champ</th><th>Avant</th><th>Après</th></tr></thead>
              <tbody>
                <tr v-for="d in diff(showDetail)" :key="d.field">
                  <td class="font-mono text-xs">{{ d.field }}</td>
                  <td class="text-xs text-red-700 font-mono">{{ JSON.stringify(d.old) }}</td>
                  <td class="text-xs text-emerald-700 font-mono">{{ JSON.stringify(d.new) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-end mt-4">
            <button @click="showDetail = null" class="btn-secondary">Fermer</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
