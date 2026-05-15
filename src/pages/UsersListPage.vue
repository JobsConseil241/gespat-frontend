<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { usersApi, sitesApi, servicesApi } from '@/api/endpoints'
import PageHeader from '@/components/PageHeader.vue'
import Pagination from '@/components/Pagination.vue'
import EmptyState from '@/components/EmptyState.vue'
import { PlusIcon, KeyIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'

const users = ref<any[]>([])
const meta = ref<any>(null)
const sites = ref<any[]>([])
const services = ref<any[]>([])
const rolesList = ref<any[]>([])
const loading = ref(true)
const filters = reactive({ search: '', role: '', is_active: '', page: 1 })

const showForm = ref(false)
const showRoles = ref<any>(null)
const showPwd = ref<any>(null)
const editing = ref<any>(null)

const form = reactive<any>({
  matricule: '', nom: '', prenom: '', email: '', telephone: '',
  password: '', site_id: '', service_id: '', fonction: '',
  is_active: true, roles: [] as string[],
})
const pwdForm = reactive({ password: '' })
const rolesForm = ref<string[]>([])

async function load() {
  loading.value = true
  try {
    const params: any = { page: filters.page, per_page: 25 }
    if (filters.search) params.search = filters.search
    if (filters.role) params.role = filters.role
    if (filters.is_active !== '') params.is_active = filters.is_active
    const { data } = await usersApi.list(params)
    users.value = data.data
    meta.value = data.meta
  } finally { loading.value = false }
}

onMounted(async () => {
  const [s, srv, r] = await Promise.all([
    sitesApi.list({ per_page: 100 }),
    servicesApi.list({ per_page: 100 }),
    usersApi.roles(),
  ])
  sites.value = s.data.data
  services.value = srv.data.data
  rolesList.value = (r.data as any).data
  await load()
})

let t: number | undefined
watch(() => filters.search, () => { window.clearTimeout(t); t = window.setTimeout(() => { filters.page = 1; load() }, 300) })

function openCreate() {
  editing.value = null
  Object.assign(form, {
    matricule: '', nom: '', prenom: '', email: '', telephone: '',
    password: '', site_id: '', service_id: '', fonction: '',
    is_active: true, roles: [] as string[],
  })
  showForm.value = true
}

async function save() {
  const payload: any = { ...form }
  if (!payload.site_id) delete payload.site_id
  if (!payload.service_id) delete payload.service_id
  await usersApi.create(payload)
  showForm.value = false
  await load()
}

function openChangePwd(u: any) {
  showPwd.value = u
  pwdForm.password = ''
}

async function savePwd() {
  await usersApi.changePassword(showPwd.value.id, pwdForm.password)
  showPwd.value = null
  alert('Mot de passe mis à jour.')
}

function openRoles(u: any) {
  showRoles.value = u
  rolesForm.value = u.roles ? [...u.roles] : []
}

async function saveRoles() {
  await usersApi.assignRoles(showRoles.value.id, rolesForm.value)
  showRoles.value = null
  await load()
}
</script>

<template>
  <div>
    <PageHeader title="Utilisateurs" subtitle="Administration des comptes et des rôles">
      <template #actions>
        <button @click="openCreate" class="btn-primary">
          <PlusIcon class="w-4 h-4 mr-1" /> Nouvel utilisateur
        </button>
      </template>
    </PageHeader>

    <div class="card p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <input v-model="filters.search" placeholder="Rechercher matricule, nom, email…" class="input">
      <select v-model="filters.role" @change="filters.page = 1; load()" class="input">
        <option value="">Tous les rôles</option>
        <option v-for="r in rolesList" :key="r.id" :value="r.name">{{ r.name }}</option>
      </select>
      <select v-model="filters.is_active" @change="filters.page = 1; load()" class="input">
        <option value="">Tous les statuts</option>
        <option value="1">Actifs uniquement</option>
        <option value="0">Désactivés</option>
      </select>
    </div>

    <div class="card overflow-hidden">
      <table class="table">
        <thead><tr>
          <th>Matricule</th><th>Nom</th><th>Email</th>
          <th>Site/Service</th><th>Rôles</th><th>Statut</th><th></th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="7" class="text-center py-8 text-slate-500">Chargement…</td></tr>
          <tr v-else-if="users.length === 0"><td colspan="7"><EmptyState message="Aucun utilisateur." /></td></tr>
          <tr v-for="u in users" :key="u.id">
            <td class="font-mono text-xs">{{ u.matricule }}</td>
            <td>
              <div class="font-medium">{{ u.nom_complet }}</div>
              <div class="text-xs text-slate-500">{{ u.fonction || '—' }}</div>
            </td>
            <td class="text-sm">{{ u.email }}</td>
            <td class="text-xs">
              <span class="badge-gray mr-1">{{ u.site?.code || '—' }}</span>
              <span class="badge-info">{{ u.service?.code || '—' }}</span>
            </td>
            <td>
              <div class="flex flex-wrap gap-1">
                <span v-for="r in u.roles" :key="r" class="badge-info text-xs">{{ r }}</span>
                <span v-if="!u.roles?.length" class="text-xs text-slate-400">—</span>
              </div>
            </td>
            <td>
              <span :class="u.is_active ? 'badge-success' : 'badge-danger'">
                {{ u.is_active ? 'actif' : 'désactivé' }}
              </span>
            </td>
            <td>
              <div class="flex gap-1 justify-end">
                <button @click="openRoles(u)" title="Rôles" class="p-1 rounded text-blue-600 hover:bg-blue-50">
                  <ShieldCheckIcon class="w-4 h-4" />
                </button>
                <button @click="openChangePwd(u)" title="Mot de passe" class="p-1 rounded text-slate-600 hover:bg-slate-100">
                  <KeyIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :meta="meta" @change="(p) => { filters.page = p; load() }" />

    <!-- Modal création -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto"
           @click.self="showForm = false">
        <div class="card w-full max-w-2xl p-6">
          <h3 class="text-lg font-semibold mb-4">Nouvel utilisateur</h3>
          <form @submit.prevent="save" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label class="label">Matricule *</label><input v-model="form.matricule" required class="input"></div>
            <div><label class="label">Email *</label><input v-model="form.email" type="email" required class="input"></div>
            <div><label class="label">Nom *</label><input v-model="form.nom" required class="input"></div>
            <div><label class="label">Prénom *</label><input v-model="form.prenom" required class="input"></div>
            <div><label class="label">Téléphone</label><input v-model="form.telephone" class="input"></div>
            <div><label class="label">Fonction</label><input v-model="form.fonction" class="input"></div>
            <div>
              <label class="label">Site</label>
              <select v-model="form.site_id" class="input">
                <option value="">—</option>
                <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.code }}</option>
              </select>
            </div>
            <div>
              <label class="label">Service</label>
              <select v-model="form.service_id" class="input">
                <option value="">—</option>
                <option v-for="s in services" :key="s.id" :value="s.id">{{ s.code }}</option>
              </select>
            </div>
            <div class="md:col-span-2"><label class="label">Mot de passe *</label>
              <input v-model="form.password" type="password" required minlength="8" class="input">
            </div>
            <div class="md:col-span-2">
              <label class="label">Rôles</label>
              <div class="grid grid-cols-2 gap-2 p-2 border border-slate-200 rounded">
                <label v-for="r in rolesList" :key="r.id" class="flex items-center gap-2 text-sm">
                  <input type="checkbox" :value="r.name" v-model="form.roles">
                  {{ r.name }}
                </label>
              </div>
            </div>
            <div class="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" class="btn-secondary" @click="showForm = false">Annuler</button>
              <button type="submit" class="btn-primary">Créer</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal pwd -->
    <Teleport to="body">
      <div v-if="showPwd" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
           @click.self="showPwd = null">
        <div class="card w-full max-w-md p-6">
          <h3 class="text-lg font-semibold mb-2">Réinitialiser le mot de passe</h3>
          <p class="text-sm text-slate-500 mb-4">{{ showPwd.email }}</p>
          <form @submit.prevent="savePwd">
            <input v-model="pwdForm.password" type="password" required minlength="8"
                   class="input" placeholder="Nouveau mot de passe">
            <div class="flex justify-end gap-2 mt-4">
              <button type="button" @click="showPwd = null" class="btn-secondary">Annuler</button>
              <button type="submit" class="btn-primary">Mettre à jour</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal rôles -->
    <Teleport to="body">
      <div v-if="showRoles" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
           @click.self="showRoles = null">
        <div class="card w-full max-w-md p-6">
          <h3 class="text-lg font-semibold mb-2">Assigner des rôles</h3>
          <p class="text-sm text-slate-500 mb-4">{{ showRoles.nom_complet }}</p>
          <div class="space-y-2">
            <label v-for="r in rolesList" :key="r.id" class="flex items-center gap-2 p-2 rounded hover:bg-slate-50">
              <input type="checkbox" :value="r.name" v-model="rolesForm">
              <span class="font-medium">{{ r.name }}</span>
            </label>
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <button @click="showRoles = null" class="btn-secondary">Annuler</button>
            <button @click="saveRoles" class="btn-primary">Enregistrer</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
