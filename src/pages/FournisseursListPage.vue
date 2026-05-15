<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { fournisseursApi, fournisseursMutApi } from '@/api/endpoints'
import PageHeader from '@/components/PageHeader.vue'
import Pagination from '@/components/Pagination.vue'
import EmptyState from '@/components/EmptyState.vue'
import { PlusIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'

const items = ref<any[]>([])
const meta = ref<any>(null)
const loading = ref(true)
const filters = reactive({ search: '', page: 1 })
const showForm = ref(false)
const editing = ref<any>(null)

const form = reactive<any>({
  raison_sociale: '', niu: '', contact: '', ville: '', telephone: '', email: '',
})

async function load() {
  loading.value = true
  try {
    const { data } = await fournisseursApi.list({
      ...(filters.search && { search: filters.search }),
      page: filters.page, per_page: 25,
    })
    items.value = data.data
    meta.value = data.meta
  } finally { loading.value = false }
}

onMounted(load)
let t: number | undefined
watch(() => filters.search, () => { window.clearTimeout(t); t = window.setTimeout(() => { filters.page = 1; load() }, 300) })

function openCreate() {
  editing.value = null
  Object.assign(form, { raison_sociale: '', niu: '', contact: '', ville: '', telephone: '', email: '' })
  showForm.value = true
}

function openEdit(f: any) {
  editing.value = f
  Object.assign(form, { ...f })
  showForm.value = true
}

async function save() {
  if (editing.value) await fournisseursMutApi.update(editing.value.id, form)
  else await fournisseursMutApi.create(form)
  showForm.value = false
  await load()
}
</script>

<template>
  <div>
    <PageHeader title="Fournisseurs" subtitle="Carnet des fournisseurs et prestataires">
      <template #actions>
        <button @click="openCreate" class="btn-primary">
          <PlusIcon class="w-4 h-4 mr-1" /> Nouveau fournisseur
        </button>
      </template>
    </PageHeader>

    <div class="card p-4 mb-4">
      <input v-model="filters.search" placeholder="Recherche raison sociale, NIU, email…" class="input">
    </div>

    <div class="card overflow-hidden">
      <table class="table">
        <thead><tr>
          <th>Raison sociale</th><th>NIU</th><th>Ville</th><th>Téléphone</th><th>Email</th><th></th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="6" class="text-center py-8 text-slate-500">Chargement…</td></tr>
          <tr v-else-if="items.length === 0"><td colspan="6"><EmptyState message="Aucun fournisseur." /></td></tr>
          <tr v-for="f in items" :key="f.id">
            <td class="font-medium">{{ f.raison_sociale }}</td>
            <td class="font-mono text-xs">{{ f.niu || '—' }}</td>
            <td>{{ f.ville || '—' }}</td>
            <td>{{ f.telephone || '—' }}</td>
            <td class="text-slate-500">{{ f.email || '—' }}</td>
            <td class="text-right">
              <button @click="openEdit(f)" class="text-slate-500 hover:text-gespat-600">
                <PencilSquareIcon class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :meta="meta" @change="(p) => { filters.page = p; load() }" />

    <!-- Modal form -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
           @click.self="showForm = false">
        <div class="card w-full max-w-lg p-6">
          <h3 class="text-lg font-semibold mb-4">
            {{ editing ? 'Modifier fournisseur' : 'Nouveau fournisseur' }}
          </h3>
          <form @submit.prevent="save" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="md:col-span-2"><label class="label">Raison sociale *</label><input v-model="form.raison_sociale" required class="input"></div>
            <div><label class="label">NIU</label><input v-model="form.niu" class="input"></div>
            <div><label class="label">Contact</label><input v-model="form.contact" class="input"></div>
            <div><label class="label">Ville</label><input v-model="form.ville" class="input"></div>
            <div><label class="label">Téléphone</label><input v-model="form.telephone" class="input"></div>
            <div class="md:col-span-2"><label class="label">Email</label><input v-model="form.email" type="email" class="input"></div>
            <div class="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" class="btn-secondary" @click="showForm = false">Annuler</button>
              <button type="submit" class="btn-primary">{{ editing ? 'Enregistrer' : 'Créer' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
