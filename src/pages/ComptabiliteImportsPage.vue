<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { comptaApi } from '@/api/endpoints'
import PageHeader from '@/components/PageHeader.vue'
import { ArrowUpTrayIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const exercice = ref(new Date().getFullYear())
const source = ref('excel')
const file = ref<File | null>(null)
const uploading = ref(false)
const result = ref<any>(null)
const error = ref<string | null>(null)

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  file.value = target.files?.[0] || null
}

async function submit() {
  if (!file.value) return
  uploading.value = true
  error.value = null
  try {
    const formData = new FormData()
    formData.append('fichier', file.value)
    formData.append('exercice', String(exercice.value))
    formData.append('source', source.value)
    const { data } = await comptaApi.storeImport(formData)
    result.value = data.data
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Erreur lors de l\'import.'
  } finally {
    uploading.value = false
  }
}

function gotoMatching(importId: number) {
  router.push(`/comptabilite/imports/${importId}`)
}
</script>

<template>
  <div>
    <PageHeader title="Imports comptables"
                subtitle="Import des écritures d'immobilisations depuis Sage / Dolibarr / Excel" />

    <div class="card p-6 max-w-2xl">
      <h2 class="text-lg font-semibold mb-4">Nouvel import</h2>
      <form @submit.prevent="submit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="label">Exercice *</label>
            <input v-model.number="exercice" type="number" required class="input">
          </div>
          <div>
            <label class="label">Source</label>
            <select v-model="source" class="input">
              <option value="excel">Excel (.xlsx)</option>
              <option value="csv">CSV</option>
              <option value="sage">Sage (export)</option>
              <option value="dolibarr">Dolibarr (export)</option>
              <option value="manuel">Manuel</option>
            </select>
          </div>
        </div>

        <div>
          <label class="label">Fichier *</label>
          <input type="file" accept=".xlsx,.xls,.csv" required @change="onFileChange"
                 class="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0
                        file:text-sm file:font-medium file:bg-gespat-50 file:text-gespat-700
                        hover:file:bg-gespat-100">
          <p class="text-xs text-slate-500 mt-1">
            Format attendu : colonnes <code>numero, libelle, compte, date_acquisition,
            valeur_origine, cumul_amortissement, vnc, service, localisation</code>
          </p>
        </div>

        <p v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{{ error }}</p>

        <div v-if="result" class="bg-emerald-50 border border-emerald-200 rounded p-4">
          <strong class="text-emerald-900">Import réussi.</strong>
          <div class="text-sm mt-1">
            {{ result.lignes_count ?? result.nombre_lignes ?? 0 }} ligne(s) chargée(s).
          </div>
          <button @click="gotoMatching(result.id)" class="btn-primary mt-3">
            Lancer le matching →
          </button>
        </div>

        <div class="flex justify-end">
          <button type="submit" :disabled="uploading || !file" class="btn-primary">
            <ArrowUpTrayIcon class="w-4 h-4 mr-1" />
            {{ uploading ? 'Import en cours…' : 'Lancer l\'import' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
