<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { planCodifApi, codificationApi, categoriesApi, sitesApi } from '@/api/endpoints'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { PlusIcon, CheckBadgeIcon } from '@heroicons/vue/24/outline'

const plans = ref<any[]>([])
const loading = ref(true)
const showForm = ref(false)
const showPreview = ref(false)
const sites = ref<any[]>([])
const categories = ref<any[]>([])
const preview = ref<string | null>(null)

const form = reactive({
  code: '', libelle: '', format: '{ORG}-{CAT}-{SITE}-{ANNEE}-{SEQ:05d}',
  separateur: '-', mode_sequentiel: 'annuel', actif: false,
})

const previewForm = reactive({ categorie_id: '', site_id: '' })

async function load() {
  loading.value = true
  try {
    const { data } = await planCodifApi.list()
    plans.value = data.data
  } finally { loading.value = false }
}

onMounted(async () => {
  await load()
  const [s, c] = await Promise.all([sitesApi.list({ per_page: 100 }), categoriesApi.list({ per_page: 100 })])
  sites.value = s.data.data
  categories.value = c.data.data
})

async function save() {
  await planCodifApi.create(form)
  showForm.value = false
  await load()
}

async function activer(plan: any) {
  if (!confirm(`Activer le plan ${plan.code} ? Tous les nouveaux biens utiliseront ce format.`)) return
  await planCodifApi.activer(plan.id)
  await load()
}

async function previewCode() {
  if (!previewForm.categorie_id || !previewForm.site_id) return
  const { data } = await codificationApi.previsualiser(
    Number(previewForm.categorie_id), Number(previewForm.site_id),
  )
  preview.value = data.data.code_inventaire
}
</script>

<template>
  <div>
    <PageHeader title="Plans de codification"
                subtitle="Format des codes inventaire — tokens : {ORG} {CAT} {SITE} {ANNEE} {MOIS} {SEQ:Nd}">
      <template #actions>
        <button @click="showPreview = true" class="btn-secondary">Simuler un code</button>
        <button @click="showForm = true" class="btn-primary">
          <PlusIcon class="w-4 h-4 mr-1" /> Nouveau plan
        </button>
      </template>
    </PageHeader>

    <div class="card overflow-hidden">
      <table class="table">
        <thead><tr>
          <th>Code</th><th>Libellé</th><th>Format</th><th>Mode séquentiel</th><th>Actif</th><th></th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="6" class="text-center py-8 text-slate-500">Chargement…</td></tr>
          <tr v-else-if="plans.length === 0"><td colspan="6"><EmptyState message="Aucun plan défini." /></td></tr>
          <tr v-for="p in plans" :key="p.id">
            <td><span class="badge-info font-mono">{{ p.code }}</span></td>
            <td class="font-medium">{{ p.libelle }}</td>
            <td><code class="text-xs bg-slate-100 px-2 py-0.5 rounded">{{ p.format }}</code></td>
            <td><span class="badge-gray">{{ p.mode_sequentiel }}</span></td>
            <td>
              <span v-if="p.actif" class="badge-success flex items-center gap-1 w-fit">
                <CheckBadgeIcon class="w-3 h-3" /> Actif
              </span>
              <span v-else class="badge-gray">Inactif</span>
            </td>
            <td>
              <button v-if="!p.actif" @click="activer(p)" class="btn-secondary text-xs py-1">Activer</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal création plan -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
           @click.self="showForm = false">
        <div class="card w-full max-w-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Nouveau plan de codification</h3>
          <form @submit.prevent="save" class="space-y-3">
            <div><label class="label">Code *</label><input v-model="form.code" required class="input font-mono"></div>
            <div><label class="label">Libellé *</label><input v-model="form.libelle" required class="input"></div>
            <div>
              <label class="label">Format *</label>
              <input v-model="form.format" required class="input font-mono">
              <p class="text-xs text-slate-500 mt-1">
                Tokens : {ORG} {CAT} {SITE} {ANNEE} {MOIS} {SEQ:05d}
              </p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="label">Séparateur</label><input v-model="form.separateur" class="input"></div>
              <div>
                <label class="label">Mode séquentiel</label>
                <select v-model="form.mode_sequentiel" class="input">
                  <option value="annuel">Annuel</option>
                  <option value="global">Global</option>
                  <option value="par_categorie">Par catégorie</option>
                  <option value="par_site">Par site</option>
                </select>
              </div>
            </div>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="form.actif"> Activer immédiatement
            </label>
            <div class="flex justify-end gap-2 mt-4">
              <button type="button" class="btn-secondary" @click="showForm = false">Annuler</button>
              <button type="submit" class="btn-primary">Créer</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal preview -->
    <Teleport to="body">
      <div v-if="showPreview" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
           @click.self="showPreview = false; preview = null">
        <div class="card w-full max-w-md p-6">
          <h3 class="text-lg font-semibold mb-4">Simulation du prochain code</h3>
          <div class="space-y-3">
            <div><label class="label">Catégorie</label>
              <select v-model="previewForm.categorie_id" @change="previewCode" class="input">
                <option value="">— Choisir —</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.code }} — {{ c.libelle }}</option>
              </select>
            </div>
            <div><label class="label">Site</label>
              <select v-model="previewForm.site_id" @change="previewCode" class="input">
                <option value="">— Choisir —</option>
                <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.code }} — {{ s.libelle }}</option>
              </select>
            </div>
            <div v-if="preview" class="bg-blue-50 border border-blue-200 rounded p-4 text-center">
              <div class="text-xs text-blue-700 mb-1">Prochain code généré :</div>
              <code class="text-lg font-mono font-bold text-blue-900">{{ preview }}</code>
            </div>
          </div>
          <div class="flex justify-end mt-4">
            <button class="btn-secondary" @click="showPreview = false; preview = null">Fermer</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
