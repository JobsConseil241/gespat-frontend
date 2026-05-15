<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { campagnesApi } from '@/api/endpoints'
import type { Campagne } from '@/types'
import { ArrowLeftIcon, ClipboardDocumentCheckIcon, PlayIcon, LockClosedIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const campagne = ref<Campagne | null>(null)
const avancement = ref<any>(null)
const fiches = ref<any[]>([])
const loading = ref(true)
const action = ref<string | null>(null)

const statutVariants: Record<string, string> = {
  preparation: 'badge-info',
  en_cours: 'badge-warning',
  cloturee: 'badge-gray',
  annulee: 'badge-danger',
}

const fmt = (v: number | string | null) => v == null ? '—' : new Intl.NumberFormat('fr-FR').format(typeof v === 'string' ? parseFloat(v) : v)

const tauxAvancement = computed(() => avancement.value?.taux_avancement_pct ?? 0)

async function loadAll() {
  const id = Number(route.params.id)
  loading.value = true
  try {
    const [c, av, f] = await Promise.all([
      campagnesApi.get(id),
      campagnesApi.avancement(id).catch(() => ({ data: { data: null } })),
      campagnesApi.fiches(id, { per_page: 20 }).catch(() => ({ data: { data: [] } })),
    ])
    campagne.value = c.data.data
    avancement.value = av.data.data
    fiches.value = (f.data as any).data || []
  } finally {
    loading.value = false
  }
}

async function genererFiches() {
  if (!campagne.value) return
  action.value = 'generation'
  try {
    await campagnesApi.generateFiches(campagne.value.id)
    await loadAll()
  } finally {
    action.value = null
  }
}

async function cloturer() {
  if (!campagne.value || !confirm('Clôturer définitivement cette campagne ?')) return
  action.value = 'cloture'
  try {
    await campagnesApi.cloturer(campagne.value.id)
    await loadAll()
  } finally {
    action.value = null
  }
}

onMounted(loadAll)

const statutFicheVariants: Record<string, string> = {
  a_inventorier: 'badge-gray',
  vu_conforme: 'badge-success',
  vu_ecart: 'badge-warning',
  non_trouve: 'badge-danger',
  decouverte: 'badge-info',
  litige: 'badge-danger',
}
</script>

<template>
  <div v-if="loading" class="text-slate-500">Chargement…</div>

  <div v-else-if="campagne">
    <button @click="router.back()" class="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4">
      <ArrowLeftIcon class="w-4 h-4" /> Retour
    </button>

    <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold">{{ campagne.libelle }}</h1>
        <div class="flex items-center gap-2 mt-2">
          <span class="font-mono text-sm bg-slate-100 px-2 py-1 rounded">{{ campagne.code }}</span>
          <span class="badge-info">{{ campagne.type }}</span>
          <span :class="statutVariants[campagne.statut] || 'badge-gray'">{{ campagne.statut }}</span>
        </div>
      </div>

      <div class="flex gap-2">
        <button v-if="campagne.statut === 'preparation'"
                @click="genererFiches" :disabled="action === 'generation'"
                class="btn-primary">
          <PlayIcon class="w-4 h-4 mr-2" />
          {{ action === 'generation' ? 'Génération…' : 'Démarrer la campagne' }}
        </button>
        <button v-if="campagne.statut === 'en_cours'"
                @click="cloturer" :disabled="action === 'cloture'"
                class="btn-danger">
          <LockClosedIcon class="w-4 h-4 mr-2" />
          {{ action === 'cloture' ? 'Clôture…' : 'Clôturer la campagne' }}
        </button>
      </div>
    </div>

    <!-- Avancement -->
    <div v-if="avancement && avancement.total > 0" class="card p-5 mb-6">
      <div class="flex items-center gap-3 mb-3">
        <ClipboardDocumentCheckIcon class="w-6 h-6 text-slate-500" />
        <h2 class="text-lg font-semibold">Avancement</h2>
        <span class="ml-auto text-2xl font-bold text-gespat-700">{{ tauxAvancement }}%</span>
      </div>
      <div class="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden">
        <div class="bg-gradient-to-r from-gespat-500 to-emerald-500 h-full transition-all duration-500"
             :style="{ width: `${tauxAvancement}%` }"></div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        <div class="text-center p-2 rounded bg-slate-50">
          <div class="text-xl font-bold">{{ fmt(avancement.total) }}</div>
          <div class="text-xs text-slate-500 mt-1">Total fiches</div>
        </div>
        <div v-for="(count, statut) in avancement.par_statut" :key="statut"
             class="text-center p-2 rounded bg-slate-50">
          <div class="text-xl font-bold">{{ fmt(count) }}</div>
          <div class="text-xs text-slate-500 mt-1">{{ statut }}</div>
        </div>
      </div>
    </div>

    <!-- Périmètre -->
    <div class="card p-5 mb-6">
      <h2 class="text-lg font-semibold mb-3">Périmètre</h2>
      <div class="text-sm space-y-1">
        <div><strong>Période :</strong> {{ campagne.date_debut_prevue }} → {{ campagne.date_fin_prevue }}</div>
        <div v-if="campagne.perimetre?.sites?.length">
          <strong>Sites :</strong> {{ campagne.perimetre.sites.join(', ') }}
        </div>
        <div v-if="campagne.perimetre?.categories?.length">
          <strong>Catégories :</strong> {{ campagne.perimetre.categories.join(', ') }}
        </div>
        <div v-if="campagne.description" class="text-slate-600 mt-2">{{ campagne.description }}</div>
      </div>
    </div>

    <!-- Fiches récentes -->
    <div class="card overflow-hidden">
      <div class="px-5 py-3 border-b border-slate-200 bg-slate-50">
        <h2 class="font-semibold">Fiches d'inventaire ({{ fiches.length }} affichées)</h2>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Code attendu</th>
            <th>Statut</th>
            <th>État constaté</th>
            <th>Inventorié le</th>
            <th>Version</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="fiches.length === 0">
            <td colspan="5" class="text-center py-6 text-slate-400">Aucune fiche — démarrez la campagne pour générer.</td>
          </tr>
          <tr v-for="f in fiches" :key="f.id">
            <td class="font-mono text-xs">{{ f.code_attendu || '—' }}</td>
            <td><span :class="statutFicheVariants[f.statut] || 'badge-gray'">{{ f.statut }}</span></td>
            <td>{{ f.etat_constate || '—' }}</td>
            <td class="text-xs">{{ f.inventorie_at?.substring(0, 16).replace('T', ' ') || '—' }}</td>
            <td class="text-xs">v{{ f.version }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
