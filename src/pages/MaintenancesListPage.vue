<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { maintenancesApi } from '@/api/endpoints'
import PageHeader from '@/components/PageHeader.vue'
import Pagination from '@/components/Pagination.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import EmptyState from '@/components/EmptyState.vue'
import { WrenchScrewdriverIcon } from '@heroicons/vue/24/outline'

const items = ref<any[]>([])
const meta = ref<any>(null)
const loading = ref(true)
const filters = reactive({ statut: '', type: '', echeances_proches: false, page: 1 })

const fmt = (v: number | string | null) => v == null ? '—' : new Intl.NumberFormat('fr-FR').format(typeof v === 'string' ? parseFloat(v) : v)

async function load() {
  loading.value = true
  try {
    const params: any = { page: filters.page }
    if (filters.statut) params.statut = filters.statut
    if (filters.type) params.type = filters.type
    if (filters.echeances_proches) params.echeances_proches = 1
    const { data } = await maintenancesApi.list(params)
    items.value = data.data.data || data.data
    meta.value = data.data.meta || data.meta
  } finally { loading.value = false }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader title="Maintenances" subtitle="Planning préventif et curatif" />

    <div class="card p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <select v-model="filters.type" @change="filters.page = 1; load()" class="input">
        <option value="">Tous les types</option>
        <option value="preventive">Préventive</option>
        <option value="curative">Curative</option>
        <option value="controle_technique">Contrôle technique</option>
      </select>
      <select v-model="filters.statut" @change="filters.page = 1; load()" class="input">
        <option value="">Tous les statuts</option>
        <option value="planifiee">Planifiée</option>
        <option value="en_cours">En cours</option>
        <option value="terminee">Terminée</option>
        <option value="annulee">Annulée</option>
      </select>
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" v-model="filters.echeances_proches" @change="load()">
        Échéances ≤ 30 jours uniquement
      </label>
    </div>

    <div class="card overflow-hidden">
      <table class="table">
        <thead><tr>
          <th>Bien</th><th>Type</th><th>Date prévue</th><th>Date réalisation</th>
          <th>Prestataire</th><th class="text-right">Coût</th><th>Prochaine échéance</th><th>Statut</th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="8" class="text-center py-8 text-slate-500">Chargement…</td></tr>
          <tr v-else-if="items.length === 0">
            <td colspan="8">
              <EmptyState message="Aucune maintenance.">
                <WrenchScrewdriverIcon class="w-6 h-6 text-slate-300 mx-auto" />
              </EmptyState>
            </td>
          </tr>
          <tr v-for="m in items" :key="m.id">
            <td class="text-xs">
              <div class="font-mono">{{ m.immobilisation?.code_inventaire }}</div>
              <div class="text-slate-500">{{ m.immobilisation?.libelle }}</div>
            </td>
            <td><span class="badge-info">{{ m.type }}</span></td>
            <td class="text-xs">{{ m.date_prevue?.substring(0, 10) || '—' }}</td>
            <td class="text-xs">{{ m.date_realisation?.substring(0, 10) || '—' }}</td>
            <td class="text-xs">{{ m.prestataire || '—' }}</td>
            <td class="text-right tabular-nums">{{ fmt(m.cout) }}</td>
            <td class="text-xs">{{ m.prochaine_echeance?.substring(0, 10) || '—' }}</td>
            <td><StatusBadge :value="m.statut" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :meta="meta" @change="(p) => { filters.page = p; load() }" />
  </div>
</template>
