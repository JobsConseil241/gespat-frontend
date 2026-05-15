import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '@/api/endpoints'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('gespat_token'))
  const user = ref<User | null>(
    localStorage.getItem('gespat_user') ? JSON.parse(localStorage.getItem('gespat_user')!) : null,
  )

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.roles?.includes('super_admin') ?? false)

  function can(permission: string): boolean {
    return user.value?.permissions?.includes(permission) ?? false
  }

  function hasRole(role: string): boolean {
    return user.value?.roles?.includes(role) ?? false
  }

  async function login(email: string, password: string) {
    const { data } = await authApi.login(email, password)
    token.value = data.token
    user.value = data.user
    localStorage.setItem('gespat_token', data.token)
    localStorage.setItem('gespat_user', JSON.stringify(data.user))
  }

  async function fetchMe() {
    const { data } = await authApi.me()
    user.value = data.data
    localStorage.setItem('gespat_user', JSON.stringify(data.data))
  }

  async function logout() {
    try { await authApi.logout() } catch { /* ignore */ }
    token.value = null
    user.value = null
    localStorage.removeItem('gespat_token')
    localStorage.removeItem('gespat_user')
  }

  return { token, user, isAuthenticated, isAdmin, can, hasRole, login, logout, fetchMe }
})
