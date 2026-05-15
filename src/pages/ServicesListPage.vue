<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { servicesApi } from '@/api/endpoints'
import PageHeader from '@/components/PageHeader.vue'

const items = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await servicesApi.list({ per_page: 100 })
    items.value = data.data
  } finally { loading.value = false }
})
</script>

<template>
  <div>
    <PageHeader title="Services & Directions" subtitle="Organigramme des services affectataires" />

    <div class="card overflow-hidden">
      <table class="table">
        <thead><tr><th>Code</th><th>Libellé</th><th>Parent</th><th>Site principal</th><th>Actif</th></tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="5" class="text-center py-8 text-slate-500">Chargement…</td></tr>
          <tr v-for="s in items" :key="s.id">
            <td><span class="badge-info font-mono">{{ s.code }}</span></td>
            <td class="font-medium">{{ s.libelle }}</td>
            <td class="text-xs text-slate-500">{{ s.parent?.code || '—' }}</td>
            <td class="text-xs">{{ s.site_principal?.code || '—' }}</td>
            <td><span :class="s.is_active ? 'badge-success' : 'badge-gray'">{{ s.is_active ? 'oui' : 'non' }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
