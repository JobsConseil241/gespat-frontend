<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { sitesApi } from '@/api/endpoints'
import type { Site } from '@/types'

const sites = ref<Site[]>([])
const loading = ref(true)

const typeVariants: Record<string, string> = {
  siege: 'badge-info',
  agence: 'badge-success',
  depot: 'badge-warning',
  site_distant: 'badge-gray',
}

onMounted(async () => {
  try {
    const { data } = await sitesApi.list({ per_page: 100 })
    sites.value = data.data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Sites</h1>

    <div class="card overflow-hidden">
      <table class="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Libellé</th>
            <th>Type</th>
            <th>Ville</th>
            <th>Province</th>
            <th class="text-right">Localisations</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="6" class="text-center py-8 text-slate-500">Chargement…</td></tr>
          <tr v-for="s in sites" :key="s.id">
            <td><span class="badge-gray font-mono text-xs">{{ s.code }}</span></td>
            <td class="font-medium">{{ s.libelle }}</td>
            <td><span :class="typeVariants[s.type] || 'badge-gray'">{{ s.type }}</span></td>
            <td>{{ s.ville || '—' }}</td>
            <td class="text-slate-500">{{ s.province || '—' }}</td>
            <td class="text-right">{{ s.localisations_count ?? 0 }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
