<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { sortiesApi } from '@/api/endpoints'
import PageHeader from '@/components/PageHeader.vue'
import Pagination from '@/components/Pagination.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import EmptyState from '@/components/EmptyState.vue'
import { CheckIcon } from '@heroicons/vue/24/outline'

const items = ref<any[]>([])
const meta = ref<any>(null)
const loading = ref(true)
const filters = reactive({ type: '', statut: '', page: 1 })

const fmt = (v: number | string | null) => v == null ? '—' : new Intl.NumberFormat('fr-FR').format(typeof v === 'string' ? parseFloat(v) : v)

async function load() {
  loading.value = true
  try {
    const { data } = await sortiesApi.list({
      ...(filters.type && { type: filters.type }),
      ...(filters.statut && { statut: filters.statut }),
      page: filters.page,
    })
    items.value = data.data.data || data.data
    meta.value = data.data.meta || data.meta
  } finally { loading.value = false }
}

onMounted(load)

async function valider(s: any) {
  if (!confirm(`Valider la ${s.type_sortie} ? L'immobilisation sera archivée.`)) return
  await sortiesApi.valider(s.id)
  await load()
}
</script>

<template>
  <div>
    <PageHeader title="Sorties" subtitle="Réformes, cessions, pertes et destructions" />

    <div class="card p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <select v-model="filters.type" @change="filters.page = 1; load()" class="input">
        <option value="">Tous les types</option>
        <option value="reforme">Réforme</option>
        <option value="cession">Cession</option>
        <option value="perte">Perte</option>
        <option value="vol">Vol</option>
        <option value="destruction">Destruction</option>
      </select>
      <select v-model="filters.statut" @change="filters.page = 1; load()" class="input">
        <option value="">Tous les statuts</option>
        <option value="proposee">Proposée</option>
        <option value="executee">Exécutée</option>
        <option value="refusee">Refusée</option>
      </select>
    </div>

    <div class="card overflow-hidden">
      <table class="table">
        <thead><tr>
          <th>Date décision</th><th>Bien</th><th>Type</th><th>Motif</th>
          <th class="text-right">Prix cession</th><th>Acquéreur</th><th>Statut</th><th></th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="8" class="text-center py-8 text-slate-500">Chargement…</td></tr>
          <tr v-else-if="items.length === 0"><td colspan="8"><EmptyState message="Aucune sortie enregistrée." /></td></tr>
          <tr v-for="s in items" :key="s.id">
            <td class="text-xs">{{ s.date_decision?.substring(0, 10) }}</td>
            <td class="text-xs">
              <div class="font-mono">{{ s.immobilisation?.code_inventaire }}</div>
              <div class="text-slate-500">{{ s.immobilisation?.libelle }}</div>
            </td>
            <td><span class="badge-info">{{ s.type_sortie }}</span></td>
            <td class="text-xs text-slate-500">{{ s.motif }}</td>
            <td class="text-right tabular-nums">{{ fmt(s.prix_cession) }}</td>
            <td>{{ s.acquereur_nom || '—' }}</td>
            <td><StatusBadge :value="s.statut" /></td>
            <td>
              <button v-if="s.statut === 'proposee'" @click="valider(s)"
                      class="p-1 rounded text-emerald-600 hover:bg-emerald-50" title="Valider">
                <CheckIcon class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :meta="meta" @change="(p) => { filters.page = p; load() }" />
  </div>
</template>
