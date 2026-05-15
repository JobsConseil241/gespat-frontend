<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { localisationsApi, sitesApi } from '@/api/endpoints'
import PageHeader from '@/components/PageHeader.vue'
import Pagination from '@/components/Pagination.vue'
import EmptyState from '@/components/EmptyState.vue'

const items = ref<any[]>([])
const meta = ref<any>(null)
const sites = ref<any[]>([])
const loading = ref(true)
const filters = ref({ search: '', site_id: '', type: '', page: 1 })

const typeVariants: Record<string, string> = {
  batiment: 'badge-info', etage: 'badge-gray',
  salle: 'badge-success', bureau: 'badge-success',
  depot: 'badge-warning', exterieur: 'badge-gray',
}

async function load() {
  loading.value = true
  try {
    const params: any = { page: filters.value.page, per_page: 50 }
    if (filters.value.search) params.search = filters.value.search
    if (filters.value.site_id) params.site_id = filters.value.site_id
    if (filters.value.type) params.type = filters.value.type
    const { data } = await localisationsApi.list(params)
    items.value = data.data
    meta.value = data.meta
  } finally { loading.value = false }
}

onMounted(async () => {
  const s = await sitesApi.list({ per_page: 100 })
  sites.value = s.data.data
  await load()
})

let t: number | undefined
watch(() => filters.value.search, () => {
  window.clearTimeout(t)
  t = window.setTimeout(() => { filters.value.page = 1; load() }, 300)
})
</script>

<template>
  <div>
    <PageHeader title="Localisations" subtitle="Arborescence des sites > bâtiments > étages > salles/bureaux" />

    <div class="card p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <input v-model="filters.search" placeholder="Rechercher…" class="input">
      <select v-model="filters.site_id" @change="filters.page = 1; load()" class="input">
        <option value="">Tous les sites</option>
        <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.code }} — {{ s.libelle }}</option>
      </select>
      <select v-model="filters.type" @change="filters.page = 1; load()" class="input">
        <option value="">Tous les types</option>
        <option value="batiment">Bâtiment</option>
        <option value="etage">Étage</option>
        <option value="salle">Salle</option>
        <option value="bureau">Bureau</option>
        <option value="depot">Dépôt</option>
        <option value="exterieur">Extérieur</option>
      </select>
    </div>

    <div class="card overflow-hidden">
      <table class="table">
        <thead><tr>
          <th>Code</th><th>Libellé</th><th>Type</th><th>Chemin</th><th>Niveau</th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="5" class="text-center py-8 text-slate-500">Chargement…</td></tr>
          <tr v-else-if="items.length === 0"><td colspan="5"><EmptyState message="Aucune localisation pour les filtres sélectionnés." /></td></tr>
          <tr v-for="l in items" :key="l.id">
            <td class="font-mono text-xs">{{ l.code }}</td>
            <td class="font-medium">{{ l.libelle }}</td>
            <td><span :class="typeVariants[l.type] || 'badge-gray'">{{ l.type }}</span></td>
            <td class="text-xs text-slate-500">{{ l.path }}</td>
            <td>{{ l.niveau }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination :meta="meta" @change="(p) => { filters.page = p; load() }" />
  </div>
</template>
