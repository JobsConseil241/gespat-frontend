<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('admin@gespat.local')
const password = ref('ChangeMe!2026')
const loading = ref(false)
const error = ref<string | null>(null)

async function submit() {
  loading.value = true
  error.value = null
  try {
    await auth.login(email.value, password.value)
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.push(redirect)
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Connexion impossible.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gespat-700 to-gespat-900 px-4">
    <div class="card w-full max-w-md p-8">
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gespat-100 mb-3">
          <svg class="w-9 h-9 text-gespat-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 11c0-1.105.895-2 2-2s2 .895 2 2-.895 2-2 2v2m-3 4h6a2 2 0 002-2V8a2 2 0 00-2-2h-6a2 2 0 00-2 2v8a2 2 0 002 2zM5 8h2v8H5V8z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-900">GESPAT</h1>
        <p class="text-sm text-slate-500 mt-1">Gestion du patrimoine</p>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label for="login-email" class="label">Email</label>
          <input id="login-email" v-model="email" type="email" required class="input" autocomplete="email">
        </div>

        <div>
          <label for="login-password" class="label">Mot de passe</label>
          <input id="login-password" v-model="password" type="password" required class="input" autocomplete="current-password">
        </div>

        <p v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
          {{ error }}
        </p>

        <button type="submit" :disabled="loading" class="btn-primary w-full">
          <span v-if="loading">Connexion…</span>
          <span v-else>Se connecter</span>
        </button>
      </form>

      <div class="mt-6 text-center text-xs text-slate-400">
        v1.0 · MRTECH — MEBODO Richard Aristide
      </div>
    </div>
  </div>
</template>
