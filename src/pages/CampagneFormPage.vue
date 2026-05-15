<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { campagnesApi, sitesApi, categoriesApi } from '@/api/endpoints'
import PageHeader from '@/components/PageHeader.vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const sites = ref<any[]>([])
const categories = ref<any[]>([])
const submitting = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  code: '',
  libelle: '',
  description: '',
  type: 'partiel',
  date_debut_prevue: '',
  date_fin_prevue: '',
  perimetre_sites: [] as number[],
  perimetre_categories: [] as number[],
})

onMounted(async () => {
  const [s, c] = await Promise.all([sitesApi.list({ per_page: 100 }), categoriesApi.list({ per_page: 100 })])
  sites.value = s.data.data
  categories.value = c.data.data
  // Pré-remplir code
  form.code = `INV-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
})

async function submit() {
  submitting.value = true
  error.value = null
  try {
    const payload: any = {
      code: form.code,
      libelle: form.libelle,
      description: form.description || null,
      type: form.type,
      date_debut_prevue: form.date_debut_prevue,
      date_fin_prevue: form.date_fin_prevue,
      perimetre: {
        sites: form.perimetre_sites,
        categories: form.perimetre_categories,
      },
    }
    const { data } = await campagnesApi.create(payload)
    router.push(`/inventaire/campagnes/${data.data.id}`)
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Erreur de création.'
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

    <PageHeader title="Nouvelle campagne d'inventaire" subtitle="Planification, périmètre et type" />

    <form @submit.prevent="submit" class="space-y-6 max-w-4xl">
      <div class="card p-5">
        <h2 class="text-lg font-semibold mb-4">Identification</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label">Code campagne *</label>
            <input v-model="form.code" required class="input font-mono">
          </div>
          <div>
            <label class="label">Type *</label>
            <select v-model="form.type" required class="input">
              <option value="general_annuel">Général annuel</option>
              <option value="partiel">Partiel</option>
              <option value="tournant">Tournant</option>
              <option value="contradictoire">Contradictoire</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="label">Libellé *</label>
            <input v-model="form.libelle" required class="input">
          </div>
          <div class="md:col-span-2">
            <label class="label">Description</label>
            <textarea v-model="form.description" rows="2" class="input"></textarea>
          </div>
        </div>
      </div>

      <div class="card p-5">
        <h2 class="text-lg font-semibold mb-4">Période</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label">Date début prévue *</label>
            <input v-model="form.date_debut_prevue" type="date" required class="input">
          </div>
          <div>
            <label class="label">Date fin prévue *</label>
            <input v-model="form.date_fin_prevue" type="date" required class="input">
          </div>
        </div>
      </div>

      <div class="card p-5">
        <h2 class="text-lg font-semibold mb-4">Périmètre</h2>
        <p class="text-sm text-slate-500 mb-3">
          Sélectionnez les sites et catégories concernés. Si rien n'est sélectionné, la campagne couvrira tout le périmètre.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label">Sites</label>
            <div class="max-h-60 overflow-y-auto border border-slate-200 rounded p-2 space-y-1">
              <label v-for="s in sites" :key="s.id" class="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded">
                <input type="checkbox" :value="s.id" v-model="form.perimetre_sites">
                <span class="text-sm"><strong>{{ s.code }}</strong> — {{ s.libelle }}</span>
              </label>
            </div>
          </div>
          <div>
            <label class="label">Catégories</label>
            <div class="max-h-60 overflow-y-auto border border-slate-200 rounded p-2 space-y-1">
              <label v-for="c in categories" :key="c.id" class="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded">
                <input type="checkbox" :value="c.id" v-model="form.perimetre_categories">
                <span class="text-sm"><strong>{{ c.code }}</strong> — {{ c.libelle }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{{ error }}</p>

      <div class="flex justify-end gap-2">
        <button type="button" @click="router.back()" class="btn-secondary">Annuler</button>
        <button type="submit" :disabled="submitting" class="btn-primary">
          {{ submitting ? 'Création…' : 'Créer la campagne' }}
        </button>
      </div>
    </form>
  </div>
</template>
