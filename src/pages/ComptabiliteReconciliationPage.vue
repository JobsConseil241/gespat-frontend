<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { comptaApi } from '@/api/endpoints'
import PageHeader from '@/components/PageHeader.vue'
import { DocumentChartBarIcon } from '@heroicons/vue/24/outline'

const exercice = ref(new Date().getFullYear())
const etats = ref<any[]>([])
const ecarts = ref<any>(null)
const loading = ref(false)
const generating = ref(false)

const fmt = (v: number | string | null) => v == null ? '—' : new Intl.NumberFormat('fr-FR').format(typeof v === 'string' ? parseFloat(v) : v)

async function load() {
  loading.value = true
  try {
    const [r, e] = await Promise.all([
      comptaApi.reconciliation(exercice.value),
      comptaApi.ecarts(exercice.value),
    ])
    etats.value = (r.data as any).data || []
    ecarts.value = (e.data as any).data
  } finally { loading.value = false }
}

onMounted(load)

async function generer() {
  generating.value = true
  try {
    const today = new Date().toISOString().substring(0, 10)
    await comptaApi.genererReconciliation({ exercice: exercice.value, date_arrete: today })
    await load()
  } finally { generating.value = false }
}
</script>

<template>
  <div>
    <PageHeader title="Réconciliation comptable"
                subtitle="Comparaison patrimoine vs comptabilité par exercice">
      <template #actions>
        <input v-model.number="exercice" type="number" class="input w-28" @change="load">
        <button @click="generer" :disabled="generating" class="btn-primary">
          <DocumentChartBarIcon class="w-4 h-4 mr-1" />
          {{ generating ? 'Génération…' : 'Générer un état' }}
        </button>
      </template>
    </PageHeader>

    <div v-if="loading" class="text-slate-500">Chargement…</div>

    <template v-else>
      <!-- États générés -->
      <div class="card p-5 mb-6">
        <h2 class="text-lg font-semibold mb-4">États de réconciliation</h2>
        <table class="table">
          <thead><tr>
            <th>Date d'arrêté</th>
            <th class="text-right">Valeur compta</th>
            <th class="text-right">Valeur patrimoine</th>
            <th class="text-right">Écart</th>
            <th class="text-right">Lignes compta</th>
            <th class="text-right">Immos patrimoine</th>
          </tr></thead>
          <tbody>
            <tr v-if="etats.length === 0"><td colspan="6" class="text-center py-4 text-slate-400">Aucun état généré pour cet exercice</td></tr>
            <tr v-for="e in etats" :key="e.id">
              <td class="text-xs">{{ e.date_arrete }}</td>
              <td class="text-right tabular-nums">{{ fmt(e.valeur_brute_compta) }}</td>
              <td class="text-right tabular-nums">{{ fmt(e.valeur_brute_patrimoine) }}</td>
              <td class="text-right tabular-nums">
                <span :class="parseFloat(e.ecart) === 0 ? 'badge-success' : 'badge-warning'">
                  {{ fmt(e.ecart) }}
                </span>
              </td>
              <td class="text-right">{{ e.nombre_lignes_compta }}</td>
              <td class="text-right">{{ e.nombre_immo_patrimoine }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Écarts détaillés -->
      <div v-if="ecarts" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card p-5">
          <h3 class="font-semibold mb-3">Lignes comptables sans bien matché</h3>
          <div class="text-xs text-slate-500 mb-2">
            {{ ecarts.lignes_compta_sans_immo?.length || 0 }} ligne(s)
          </div>
          <div class="max-h-96 overflow-y-auto">
            <div v-for="l in ecarts.lignes_compta_sans_immo" :key="l.id"
                 class="p-2 border-b border-slate-100 text-sm">
              <div class="font-mono text-xs text-slate-500">{{ l.numero_immobilisation_compta }}</div>
              <div>{{ l.libelle }}</div>
              <div class="text-xs text-slate-500">{{ fmt(l.valeur_origine) }} XAF</div>
            </div>
            <div v-if="!ecarts.lignes_compta_sans_immo?.length" class="text-center py-4 text-slate-400 text-sm">
              Aucun écart
            </div>
          </div>
        </div>

        <div class="card p-5">
          <h3 class="font-semibold mb-3">Immobilisations sans ligne comptable</h3>
          <div class="text-xs text-slate-500 mb-2">
            {{ ecarts.immos_sans_ligne_compta?.length || 0 }} bien(s)
          </div>
          <div class="max-h-96 overflow-y-auto">
            <div v-for="i in ecarts.immos_sans_ligne_compta" :key="i.id"
                 class="p-2 border-b border-slate-100 text-sm">
              <div class="font-mono text-xs text-slate-500">{{ i.code_inventaire }}</div>
              <div>{{ i.libelle }}</div>
              <div class="text-xs text-slate-500">{{ fmt(i.valeur_acquisition) }} XAF</div>
            </div>
            <div v-if="!ecarts.immos_sans_ligne_compta?.length" class="text-center py-4 text-slate-400 text-sm">
              Aucun écart
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
