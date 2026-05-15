<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { lotsEtiquettesApi, immosApi, sitesApi } from '@/api/endpoints'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { PlusIcon, PrinterIcon, DocumentArrowDownIcon } from '@heroicons/vue/24/outline'

const lots = ref<any[]>([])
const loading = ref(true)
const showForm = ref(false)
const sites = ref<any[]>([])
const candidates = ref<any[]>([])
const filterSiteId = ref('')

const form = reactive({
  libelle: '', format_etiquette: 'A4_avery_24', immobilisation_ids: [] as number[],
})

async function load() {
  loading.value = true
  try {
    const { data } = await lotsEtiquettesApi.list()
    lots.value = data.data.data || data.data
  } finally { loading.value = false }
}

onMounted(async () => {
  await load()
  const s = await sitesApi.list({ per_page: 100 })
  sites.value = s.data.data
})

async function loadCandidates() {
  const params: any = { per_page: 50, statut: 'actif' }
  if (filterSiteId.value) params.site_id = filterSiteId.value
  const { data } = await immosApi.list(params)
  candidates.value = data.data
}

watch(filterSiteId, loadCandidates)

async function openForm() {
  await loadCandidates()
  form.libelle = `Lot ${new Date().toISOString().slice(0, 10)}`
  form.immobilisation_ids = []
  showForm.value = true
}

async function save() {
  if (form.immobilisation_ids.length === 0) { alert('Sélectionnez au moins une immobilisation'); return }
  await lotsEtiquettesApi.create(form)
  showForm.value = false
  await load()
}

function downloadPdf(lotId: number) {
  // fetch + blob pour passer le Bearer
  fetch(lotsEtiquettesApi.pdfUrl(lotId), {
    headers: { Authorization: `Bearer ${localStorage.getItem('gespat_token')}` },
  }).then(r => r.blob()).then(blob => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.target = '_blank'
    a.click()
  })
}

async function marquerImprime(lotId: number) {
  await lotsEtiquettesApi.marquerImprime(lotId)
  await load()
}
</script>

<template>
  <div>
    <PageHeader title="Étiquettes" subtitle="Lots d'étiquettes QR + code-barres, génération PDF Avery A4">
      <template #actions>
        <button @click="openForm" class="btn-primary">
          <PlusIcon class="w-4 h-4 mr-1" /> Nouveau lot
        </button>
      </template>
    </PageHeader>

    <div class="card overflow-hidden">
      <table class="table">
        <thead><tr>
          <th>Libellé</th><th>Format</th><th class="text-right">Nb étiquettes</th>
          <th>Généré le</th><th>Imprimé le</th><th></th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="6" class="text-center py-8 text-slate-500">Chargement…</td></tr>
          <tr v-else-if="lots.length === 0"><td colspan="6"><EmptyState message="Aucun lot." /></td></tr>
          <tr v-for="l in lots" :key="l.id">
            <td class="font-medium">{{ l.libelle }}</td>
            <td><span class="badge-gray">{{ l.format_etiquette }}</span></td>
            <td class="text-right">{{ l.nombre_etiquettes }}</td>
            <td class="text-xs">{{ l.genere_le?.substring(0, 16).replace('T', ' ') || '—' }}</td>
            <td class="text-xs">
              <span v-if="l.imprime_le" class="badge-success">{{ l.imprime_le.substring(0, 10) }}</span>
              <span v-else class="badge-info">Non imprimé</span>
            </td>
            <td>
              <div class="flex gap-1 justify-end">
                <button @click="downloadPdf(l.id)" class="btn-secondary text-xs py-1" title="Télécharger PDF">
                  <DocumentArrowDownIcon class="w-4 h-4" />
                </button>
                <button v-if="!l.imprime_le" @click="marquerImprime(l.id)" class="btn-secondary text-xs py-1"
                        title="Marquer comme imprimé">
                  <PrinterIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal création -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
           @click.self="showForm = false">
        <div class="card w-full max-w-2xl p-6 max-h-[90vh] flex flex-col">
          <h3 class="text-lg font-semibold mb-4">Nouveau lot d'étiquettes</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div><label class="label">Libellé</label><input v-model="form.libelle" required class="input"></div>
            <div>
              <label class="label">Format</label>
              <select v-model="form.format_etiquette" class="input">
                <option value="A4_avery_24">A4 Avery 24 (70×37 mm)</option>
                <option value="A4_avery_30">A4 Avery 30 (70×29.7 mm)</option>
                <option value="62x29">Rouleau 62×29 mm</option>
                <option value="38x90">Rouleau 38×90 mm</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label class="label">Filtrer par site</label>
            <select v-model="filterSiteId" class="input">
              <option value="">Tous les sites</option>
              <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.code }} — {{ s.libelle }}</option>
            </select>
          </div>

          <div class="flex-1 overflow-y-auto border border-slate-200 rounded p-2 space-y-1 mb-4">
            <div class="text-xs text-slate-500 px-2 pb-2">
              {{ form.immobilisation_ids.length }} sélectionné(s) sur {{ candidates.length }}
            </div>
            <label v-for="i in candidates" :key="i.id"
                   class="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded">
              <input type="checkbox" :value="i.id" v-model="form.immobilisation_ids">
              <span class="text-xs font-mono">{{ i.code_inventaire }}</span>
              <span class="text-sm flex-1">{{ i.libelle }}</span>
              <span class="badge-gray text-xs">{{ i.site?.code }}</span>
            </label>
          </div>

          <div class="flex justify-end gap-2">
            <button class="btn-secondary" @click="showForm = false">Annuler</button>
            <button class="btn-primary" @click="save">Générer le lot</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
