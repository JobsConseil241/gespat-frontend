<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { comptaApi, immosApi } from '@/api/endpoints'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import EmptyState from '@/components/EmptyState.vue'
import { ArrowLeftIcon, BoltIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const importId = Number(route.params.id)

const lignes = ref<any[]>([])
const meta = ref<any>(null)
const loading = ref(true)
const running = ref(false)
const stats = ref<any>(null)
const statutFilter = ref('')
const page = ref(1)

const matchingDialog = ref<{ ligne: any | null; candidates: any[]; search: string }>({
  ligne: null, candidates: [], search: '',
})

const fmt = (v: number | string | null) => v == null ? '—' : new Intl.NumberFormat('fr-FR').format(typeof v === 'string' ? parseFloat(v) : v)

async function load() {
  loading.value = true
  try {
    const params: any = { page: page.value }
    if (statutFilter.value) params.statut = statutFilter.value
    const { data } = await comptaApi.lignes(importId, params)
    lignes.value = data.data.data || data.data
    meta.value = data.data.meta || data.meta
  } finally { loading.value = false }
}

onMounted(load)

async function lancerMatching() {
  running.value = true
  try {
    const { data } = await comptaApi.executerMatching(importId)
    stats.value = data.data.statistiques
    await load()
  } finally { running.value = false }
}

async function openMatching(ligne: any) {
  matchingDialog.value.ligne = ligne
  matchingDialog.value.search = ligne.libelle || ''
  await searchImmos()
}

async function searchImmos() {
  if (matchingDialog.value.search.length < 2) { matchingDialog.value.candidates = []; return }
  const { data } = await immosApi.list({ search: matchingDialog.value.search, per_page: 10 })
  matchingDialog.value.candidates = data.data
}

async function applyMatching(immoId: number) {
  if (!matchingDialog.value.ligne) return
  await comptaApi.matcherManuel(matchingDialog.value.ligne.id, immoId)
  matchingDialog.value.ligne = null
  await load()
}
</script>

<template>
  <div>
    <button @click="router.back()" class="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4">
      <ArrowLeftIcon class="w-4 h-4" /> Retour
    </button>

    <PageHeader :title="`Import #${importId} — Matching`"
                subtitle="Mise en correspondance des lignes comptables avec les biens du patrimoine">
      <template #actions>
        <button @click="lancerMatching" :disabled="running" class="btn-primary">
          <BoltIcon class="w-4 h-4 mr-1" />
          {{ running ? 'Matching…' : 'Lancer le matching auto' }}
        </button>
      </template>
    </PageHeader>

    <div v-if="stats" class="card p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
      <div class="text-center">
        <div class="text-2xl font-bold text-emerald-700">{{ stats.certain }}</div>
        <div class="text-xs text-slate-500">Matchs certains</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-blue-700">{{ stats.probable }}</div>
        <div class="text-xs text-slate-500">Matchs probables</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-amber-700">{{ stats.multiple }}</div>
        <div class="text-xs text-slate-500">Multiples</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-red-700">{{ stats.non_trouve }}</div>
        <div class="text-xs text-slate-500">Non trouvés</div>
      </div>
    </div>

    <div class="card p-4 mb-4">
      <select v-model="statutFilter" @change="page = 1; load()" class="input max-w-xs">
        <option value="">Tous les statuts</option>
        <option value="non_traite">Non traité</option>
        <option value="matche_auto">Matché auto</option>
        <option value="matche_manuel">Matché manuel</option>
        <option value="multiple">Multiple</option>
        <option value="non_trouve">Non trouvé</option>
      </select>
    </div>

    <div class="card overflow-hidden">
      <table class="table">
        <thead><tr>
          <th>N° compta</th><th>Libellé</th><th>Compte</th>
          <th class="text-right">Valeur</th><th>Bien matché</th><th>Score</th><th>Statut</th><th></th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="8" class="text-center py-8 text-slate-500">Chargement…</td></tr>
          <tr v-else-if="lignes.length === 0"><td colspan="8"><EmptyState message="Aucune ligne." /></td></tr>
          <tr v-for="l in lignes" :key="l.id">
            <td class="font-mono text-xs">{{ l.numero_immobilisation_compta || '—' }}</td>
            <td class="text-sm">{{ l.libelle }}</td>
            <td class="font-mono text-xs">{{ l.compte || '—' }}</td>
            <td class="text-right tabular-nums">{{ fmt(l.valeur_origine) }}</td>
            <td class="text-xs">
              <div v-if="l.immobilisation" class="font-mono">{{ l.immobilisation.code_inventaire }}</div>
              <div v-else class="text-slate-400">—</div>
            </td>
            <td>
              <span v-if="l.score_matching != null" class="badge-info">{{ l.score_matching }}</span>
            </td>
            <td><StatusBadge :value="l.statut_matching" /></td>
            <td>
              <button v-if="l.statut_matching !== 'matche_auto'"
                      @click="openMatching(l)" class="btn-secondary text-xs py-1">
                Matcher
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal matching manuel -->
    <Teleport to="body">
      <div v-if="matchingDialog.ligne" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
           @click.self="matchingDialog.ligne = null">
        <div class="card w-full max-w-2xl p-6">
          <h3 class="text-lg font-semibold">Matcher la ligne comptable</h3>
          <p class="text-sm text-slate-500 mt-1">
            <strong>{{ matchingDialog.ligne.libelle }}</strong> — {{ fmt(matchingDialog.ligne.valeur_origine) }} XAF
          </p>

          <input v-model="matchingDialog.search" @input="searchImmos"
                 placeholder="Recherche immobilisation (code, libellé, série…)" class="input mt-4">

          <div class="mt-3 max-h-96 overflow-y-auto border border-slate-200 rounded">
            <div v-if="matchingDialog.candidates.length === 0" class="text-center py-6 text-slate-400 text-sm">
              Aucun candidat
            </div>
            <button v-for="c in matchingDialog.candidates" :key="c.id"
                    @click="applyMatching(c.id)"
                    class="w-full text-left px-3 py-2 border-b border-slate-100 hover:bg-slate-50">
              <div class="font-mono text-xs">{{ c.code_inventaire }}</div>
              <div class="font-medium text-sm">{{ c.libelle }}</div>
              <div class="text-xs text-slate-500">
                {{ c.categorie?.code }} · {{ c.site?.code }} · {{ fmt(c.valeur_acquisition) }} XAF
              </div>
            </button>
          </div>

          <div class="flex justify-end mt-4">
            <button @click="matchingDialog.ligne = null" class="btn-secondary">Annuler</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
