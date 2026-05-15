<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '@/api/client'
import PageHeader from '@/components/PageHeader.vue'
import { CalculatorIcon } from '@heroicons/vue/24/outline'

const exercice = ref(new Date().getFullYear())
const etat = ref<any>(null)
const loading = ref(false)
const calculating = ref(false)

const fmt = (v: number | string | null) => v == null ? '—' : new Intl.NumberFormat('fr-FR').format(typeof v === 'string' ? parseFloat(v) : v)

async function loadEtat() {
  loading.value = true
  try {
    const { data } = await api.get(`/amortissements/etat/${exercice.value}`)
    etat.value = data.data
  } finally { loading.value = false }
}

async function calculerTous() {
  if (!confirm(`Calculer les amortissements de tous les biens pour l'exercice ${exercice.value} ?`)) return
  calculating.value = true
  try {
    const { data } = await api.post('/amortissements/calculer-tous', { exercice_max: exercice.value })
    alert(`${data.data.traitees} immobilisation(s) traitée(s), ${data.data.lignes} ligne(s) écrites.`)
    await loadEtat()
  } finally { calculating.value = false }
}

async function validerExercice() {
  if (!confirm(`Valider tous les amortissements de l'exercice ${exercice.value} ? Ils seront verrouillés.`)) return
  const { data } = await api.post('/amortissements/valider', { exercice: exercice.value })
  alert(`${data.data.lignes_validees} ligne(s) validée(s).`)
  await loadEtat()
}

onMounted(loadEtat)
</script>

<template>
  <div>
    <PageHeader title="Amortissements" subtitle="Plan SYSCOHADA — calcul et validation par exercice" />

    <div class="card p-5 mb-6">
      <div class="flex flex-wrap items-end gap-3">
        <div>
          <label class="label">Exercice</label>
          <input v-model.number="exercice" type="number" class="input w-32" @change="loadEtat">
        </div>
        <button @click="calculerTous" :disabled="calculating" class="btn-primary">
          <CalculatorIcon class="w-4 h-4 mr-1" />
          {{ calculating ? 'Calcul…' : 'Calculer / Recalculer tous' }}
        </button>
        <button @click="validerExercice" class="btn-secondary">
          Valider l'exercice
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-slate-500">Chargement de l'état…</div>

    <div v-else-if="etat" class="card p-5">
      <h2 class="text-lg font-semibold mb-4">État synthétique de l'exercice {{ exercice }}</h2>
      <dl class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="border-l-4 border-gespat-500 pl-4">
          <dt class="text-sm text-slate-500">Immobilisations couvertes</dt>
          <dd class="text-2xl font-bold mt-1">{{ etat.nombre_immo ?? 0 }}</dd>
        </div>
        <div class="border-l-4 border-amber-500 pl-4">
          <dt class="text-sm text-slate-500">Total des dotations</dt>
          <dd class="text-2xl font-bold mt-1 text-amber-700">{{ fmt(etat.total_dotations) }}</dd>
          <div class="text-xs text-slate-400">XAF</div>
        </div>
        <div class="border-l-4 border-slate-500 pl-4">
          <dt class="text-sm text-slate-500">Cumul d'amortissement</dt>
          <dd class="text-2xl font-bold mt-1">{{ fmt(etat.total_cumul) }}</dd>
          <div class="text-xs text-slate-400">XAF</div>
        </div>
        <div class="border-l-4 border-emerald-500 pl-4">
          <dt class="text-sm text-slate-500">VNC totale fin d'exercice</dt>
          <dd class="text-2xl font-bold mt-1 text-emerald-700">{{ fmt(etat.total_vnc) }}</dd>
          <div class="text-xs text-slate-400">XAF</div>
        </div>
      </dl>

      <div class="mt-6 p-3 rounded bg-slate-50 border border-slate-200 text-sm">
        <strong>Validation :</strong> {{ etat.valides ?? 0 }} / {{ etat.nombre_immo ?? 0 }} ligne(s) validée(s).
      </div>
    </div>
  </div>
</template>
