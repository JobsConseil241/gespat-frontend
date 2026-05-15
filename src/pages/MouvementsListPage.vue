<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { mouvementsApi } from '@/api/endpoints'
import PageHeader from '@/components/PageHeader.vue'
import Pagination from '@/components/Pagination.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import EmptyState from '@/components/EmptyState.vue'
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const items = ref<any[]>([])
const meta = ref<any>(null)
const loading = ref(true)
const filters = reactive({ type: '', statut: '', page: 1 })

async function load() {
  loading.value = true
  try {
    const { data } = await mouvementsApi.list({
      ...(filters.type && { type: filters.type }),
      ...(filters.statut && { statut: filters.statut }),
      page: filters.page,
    })
    items.value = data.data.data || data.data
    meta.value = data.data.meta || data.meta
  } finally { loading.value = false }
}

onMounted(load)

async function valider(m: any) {
  await mouvementsApi.valider(m.id)
  await load()
}

async function refuser(m: any) {
  await mouvementsApi.refuser(m.id)
  await load()
}
</script>

<template>
  <div>
    <PageHeader title="Mouvements" subtitle="Historique et validation des transferts inter-sites/services" />

    <div class="card p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <select v-model="filters.type" @change="filters.page = 1; load()" class="input">
        <option value="">Tous les types</option>
        <option value="transfert">Transfert</option>
        <option value="sortie_temporaire">Sortie temporaire</option>
        <option value="retour">Retour</option>
        <option value="changement_etat">Changement d'état</option>
        <option value="maintenance_entree">Maintenance entrée</option>
        <option value="maintenance_sortie">Maintenance sortie</option>
      </select>
      <select v-model="filters.statut" @change="filters.page = 1; load()" class="input">
        <option value="">Tous les statuts</option>
        <option value="propose">Proposé</option>
        <option value="execute">Exécuté</option>
        <option value="refuse">Refusé</option>
      </select>
    </div>

    <div class="card overflow-hidden">
      <table class="table">
        <thead><tr>
          <th>Date</th><th>Bien</th><th>Type</th><th>Origine → Destination</th><th>Motif</th><th>Statut</th><th></th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="7" class="text-center py-8 text-slate-500">Chargement…</td></tr>
          <tr v-else-if="items.length === 0"><td colspan="7"><EmptyState message="Aucun mouvement." /></td></tr>
          <tr v-for="m in items" :key="m.id">
            <td class="text-xs">{{ m.date_mouvement?.substring(0, 10) }}</td>
            <td class="text-xs">
              <div class="font-mono">{{ m.immobilisation?.code_inventaire }}</div>
              <div class="text-slate-500">{{ m.immobilisation?.libelle }}</div>
            </td>
            <td><span class="badge-info">{{ m.type_mouvement }}</span></td>
            <td class="text-xs">
              {{ m.site_origine?.code || '?' }} → <strong>{{ m.site_destination?.code || '?' }}</strong>
            </td>
            <td class="text-xs text-slate-500">{{ m.motif || '—' }}</td>
            <td><StatusBadge :value="m.statut" /></td>
            <td>
              <div v-if="m.statut === 'propose'" class="flex gap-1">
                <button @click="valider(m)" title="Valider"
                        class="p-1 rounded text-emerald-600 hover:bg-emerald-50">
                  <CheckIcon class="w-4 h-4" />
                </button>
                <button @click="refuser(m)" title="Refuser"
                        class="p-1 rounded text-red-600 hover:bg-red-50">
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :meta="meta" @change="(p) => { filters.page = p; load() }" />
  </div>
</template>
