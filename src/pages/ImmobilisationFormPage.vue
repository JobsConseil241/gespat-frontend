<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { immosApi, categoriesApi, sitesApi, codificationApi } from '@/api/endpoints'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const categories = ref<any[]>([])
const sites = ref<any[]>([])
const codePreview = ref<string | null>(null)
const submitting = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  libelle: '',
  description: '',
  categorie_id: '',
  site_id: '',
  date_acquisition: '',
  date_mise_en_service: '',
  valeur_acquisition: '',
  devise: 'XAF',
  duree_amortissement_mois: '',
  methode_amortissement: 'lineaire',
  etat_physique: 'neuf',
})

onMounted(async () => {
  const [c, s] = await Promise.all([categoriesApi.list({ per_page: 100 }), sitesApi.list({ per_page: 100 })])
  categories.value = c.data.data
  sites.value = s.data.data
})

// Prévisualisation auto du code
watch([() => form.categorie_id, () => form.site_id], async ([cat, site]) => {
  if (cat && site) {
    try {
      const { data } = await codificationApi.previsualiser(Number(cat), Number(site))
      codePreview.value = data.data.code_inventaire
    } catch { codePreview.value = null }
  } else {
    codePreview.value = null
  }
})

// Lors du choix d'une catégorie : préremplir durée et méthode
watch(() => form.categorie_id, (id) => {
  if (id) {
    const cat = categories.value.find((c) => c.id === Number(id))
    if (cat) {
      if (cat.duree_amortissement_defaut) form.duree_amortissement_mois = String(cat.duree_amortissement_defaut)
      if (cat.methode_amortissement_defaut) form.methode_amortissement = cat.methode_amortissement_defaut
    }
  }
})

async function submit() {
  submitting.value = true
  error.value = null
  try {
    const payload: any = { ...form }
    Object.keys(payload).forEach((k) => { if (payload[k] === '') payload[k] = null })
    payload.categorie_id = Number(payload.categorie_id)
    payload.site_id = Number(payload.site_id)
    if (payload.valeur_acquisition) payload.valeur_acquisition = Number(payload.valeur_acquisition)
    if (payload.duree_amortissement_mois) payload.duree_amortissement_mois = Number(payload.duree_amortissement_mois)

    const { data } = await immosApi.create(payload)
    router.push(`/immobilisations/${data.data.id}`)
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Erreur lors de la création.'
    if (e.response?.data?.errors) {
      error.value = Object.values(e.response.data.errors).flat().join(' ')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <button @click="router.back()" class="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4">
      <ArrowLeftIcon class="w-4 h-4" /> Retour
    </button>
    <h1 class="text-2xl font-bold mb-6">Nouvelle immobilisation</h1>

    <form @submit.prevent="submit" class="space-y-6 max-w-4xl">
      <div class="card p-5">
        <h2 class="text-lg font-semibold mb-4">Identification</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="label">Libellé *</label>
            <input v-model="form.libelle" required class="input" placeholder="Ex: Ordinateur portable Dell Latitude 5520">
          </div>
          <div>
            <label class="label">Catégorie *</label>
            <select v-model="form.categorie_id" required class="input">
              <option value="">— Choisir —</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.code }} — {{ c.libelle }}</option>
            </select>
          </div>
          <div>
            <label class="label">Site *</label>
            <select v-model="form.site_id" required class="input">
              <option value="">— Choisir —</option>
              <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.code }} — {{ s.libelle }}</option>
            </select>
          </div>
          <div v-if="codePreview" class="md:col-span-2 bg-blue-50 border border-blue-200 rounded p-3 text-sm">
            <strong class="text-blue-900">Code inventaire qui sera attribué :</strong>
            <code class="ml-2 font-mono text-blue-700">{{ codePreview }}</code>
          </div>
          <div class="md:col-span-2">
            <label class="label">Description</label>
            <textarea v-model="form.description" rows="2" class="input"></textarea>
          </div>
        </div>
      </div>

      <div class="card p-5">
        <h2 class="text-lg font-semibold mb-4">Acquisition & valorisation</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label">Date d'acquisition</label>
            <input v-model="form.date_acquisition" type="date" class="input">
          </div>
          <div>
            <label class="label">Date de mise en service</label>
            <input v-model="form.date_mise_en_service" type="date" class="input">
          </div>
          <div>
            <label class="label">Valeur d'acquisition</label>
            <input v-model="form.valeur_acquisition" type="number" min="0" step="0.01" class="input">
          </div>
          <div>
            <label class="label">Devise</label>
            <input v-model="form.devise" class="input" placeholder="XAF">
          </div>
        </div>
      </div>

      <div class="card p-5">
        <h2 class="text-lg font-semibold mb-4">Amortissement & état</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="label">Méthode d'amortissement</label>
            <select v-model="form.methode_amortissement" class="input">
              <option value="lineaire">Linéaire</option>
              <option value="degressif">Dégressif</option>
              <option value="unite_oeuvre">Unité d'œuvre</option>
              <option value="non_amortissable">Non amortissable</option>
            </select>
          </div>
          <div>
            <label class="label">Durée (mois)</label>
            <input v-model="form.duree_amortissement_mois" type="number" min="1" class="input">
          </div>
          <div>
            <label class="label">État physique</label>
            <select v-model="form.etat_physique" class="input">
              <option value="neuf">Neuf</option>
              <option value="bon">Bon</option>
              <option value="moyen">Moyen</option>
              <option value="mauvais">Mauvais</option>
              <option value="hors_service">Hors service</option>
            </select>
          </div>
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{{ error }}</p>

      <div class="flex justify-end gap-2">
        <button type="button" @click="router.back()" class="btn-secondary">Annuler</button>
        <button type="submit" :disabled="submitting" class="btn-primary">
          {{ submitting ? 'Création…' : 'Créer le bien' }}
        </button>
      </div>
    </form>
  </div>
</template>
