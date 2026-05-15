<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { campagnesApi } from '@/api/endpoints'
import type { Campagne } from '@/types'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import EmptyState from '@/components/EmptyState.vue'
import { PlusIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const items = ref<Campagne[]>([])
const loading = ref(true)

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
    <PageHeader title="Campagnes d'inventaire" subtitle="Planification et suivi des campagnes">
      <template #actions>
        <RouterLink to="/inventaire/campagnes/nouvelle" class="btn-primary">
          <PlusIcon class="w-4 h-4 mr-1" /> Nouvelle campagne
        </RouterLink>
      </template>
    </PageHeader>

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
          <tr v-else-if="items.length === 0"><td colspan="6"><EmptyState message="Aucune campagne." /></td></tr>
          <tr v-for="c in items" :key="c.id" class="cursor-pointer"
              @click="router.push(`/inventaire/campagnes/${c.id}`)">
            <td class="font-mono text-xs">{{ c.code }}</td>
            <td class="font-medium">{{ c.libelle }}</td>
            <td><span class="badge-info">{{ c.type }}</span></td>
            <td class="text-xs">{{ c.date_debut_prevue }} → {{ c.date_fin_prevue }}</td>
            <td class="text-right">{{ c.fiches_count ?? 0 }}</td>
            <td><StatusBadge :value="c.statut" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
