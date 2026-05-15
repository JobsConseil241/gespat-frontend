<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { categoriesApi } from '@/api/endpoints'
import type { CategorieImmobilisation } from '@/types'

const categories = ref<CategorieImmobilisation[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await categoriesApi.list({ per_page: 100 })
    categories.value = data.data
  } finally {
    loading.value = false
  }
})

function dureeFormat(mois: number | null): string {
  if (!mois) return '—'
  const ans = Math.floor(mois / 12)
  const r = mois % 12
  return `${mois} mois${ans > 0 ? ` (${ans} an${ans > 1 ? 's' : ''}${r ? ` ${r} mois` : ''})` : ''}`
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Catégories d'immobilisations</h1>

    <p class="text-sm text-slate-500 mb-4">
      Plan comptable SYSCOHADA — durées d'amortissement et méthodes par défaut.
    </p>

    <div class="card overflow-hidden">
      <table class="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Libellé</th>
            <th>Classe comptable</th>
            <th>Durée par défaut</th>
            <th>Méthode</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="5" class="text-center py-8 text-slate-500">Chargement…</td></tr>
          <tr v-for="c in categories" :key="c.id">
            <td><span class="badge-info font-mono">{{ c.code }}</span></td>
            <td class="font-medium">{{ c.libelle }}</td>
            <td class="font-mono text-sm">{{ c.classe_comptable || '—' }}</td>
            <td>{{ dureeFormat(c.duree_amortissement_defaut) }}</td>
            <td><span class="badge-gray">{{ c.methode_amortissement_defaut }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
