<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { campagnesApi } from '@/api/endpoints'
import type { Campagne } from '@/types'

const items = ref<Campagne[]>([])
const loading = ref(true)

const statutVariants: Record<string, string> = {
  preparation: 'badge-info',
  en_cours: 'badge-warning',
  cloturee: 'badge-gray',
  annulee: 'badge-danger',
}

onMounted(async () => {
  try {
    const { data } = await campagnesApi.list()
    items.value = data.data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Campagnes d'inventaire</h1>

    <div class="card overflow-hidden">
      <table class="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Libellé</th>
            <th>Type</th>
            <th>Période</th>
            <th class="text-right">Fiches</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="6" class="text-center py-8 text-slate-500">Chargement…</td></tr>
          <tr v-else-if="items.length === 0"><td colspan="6" class="text-center py-8 text-slate-400">Aucune campagne</td></tr>
          <tr v-for="c in items" :key="c.id" class="cursor-pointer"
              @click="$router.push(`/campagnes/${c.id}`)">
            <td class="font-mono text-xs">{{ c.code }}</td>
            <td class="font-medium">{{ c.libelle }}</td>
            <td><span class="badge-info">{{ c.type }}</span></td>
            <td class="text-xs">{{ c.date_debut_prevue }} → {{ c.date_fin_prevue }}</td>
            <td class="text-right">{{ c.fiches_count ?? 0 }}</td>
            <td><span :class="statutVariants[c.statut] || 'badge-gray'">{{ c.statut }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
