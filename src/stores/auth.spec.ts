import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock du module endpoints AVANT import du store
vi.mock('@/api/endpoints', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
}))

import { useAuthStore } from './auth'
import { authApi } from '@/api/endpoints'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('démarre non authentifié sans token', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()
  })

  it('login stocke le token et l\'utilisateur', async () => {
    const fakeUser = {
      id: 1, matricule: 'ADM-0001', nom: 'Admin', prenom: 'Sys',
      nom_complet: 'Sys Admin', email: 'a@b.c', telephone: null,
      fonction: null, is_active: true, mfa_enabled: false, last_login_at: null,
      roles: ['super_admin'], permissions: ['users.view'],
    }
    ;(authApi.login as any).mockResolvedValue({ data: { token: 'tok-123', user: fakeUser } })

    const auth = useAuthStore()
    await auth.login('a@b.c', 'secret')

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user?.matricule).toBe('ADM-0001')
    expect(localStorage.getItem('gespat_token')).toBe('tok-123')
    expect(JSON.parse(localStorage.getItem('gespat_user')!).id).toBe(1)
  })

  it('can() vérifie les permissions', async () => {
    const auth = useAuthStore()
    ;(authApi.login as any).mockResolvedValue({
      data: { token: 't', user: { id: 1, roles: ['gestionnaire_patrimoine'], permissions: ['sites.view', 'immobilisations.create'] } },
    })
    await auth.login('x', 'y')

    expect(auth.can('sites.view')).toBe(true)
    expect(auth.can('immobilisations.create')).toBe(true)
    expect(auth.can('users.delete')).toBe(false)
  })

  it('isAdmin reflète le rôle super_admin', async () => {
    const auth = useAuthStore()
    ;(authApi.login as any).mockResolvedValue({
      data: { token: 't', user: { id: 1, roles: ['super_admin'], permissions: [] } },
    })
    await auth.login('x', 'y')
    expect(auth.isAdmin).toBe(true)
  })

  it('hasRole détecte un rôle assigné', async () => {
    const auth = useAuthStore()
    ;(authApi.login as any).mockResolvedValue({
      data: { token: 't', user: { id: 1, roles: ['comptable'], permissions: [] } },
    })
    await auth.login('x', 'y')
    expect(auth.hasRole('comptable')).toBe(true)
    expect(auth.hasRole('inventoriste')).toBe(false)
  })

  it('logout efface token et user', async () => {
    const auth = useAuthStore()
    ;(authApi.login as any).mockResolvedValue({ data: { token: 't', user: { id: 1, roles: [], permissions: [] } } })
    ;(authApi.logout as any).mockResolvedValue({})
    await auth.login('x', 'y')
    expect(auth.isAuthenticated).toBe(true)

    await auth.logout()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()
    expect(localStorage.getItem('gespat_token')).toBeNull()
  })

  it('logout reste robuste si l\'API échoue', async () => {
    const auth = useAuthStore()
    ;(authApi.login as any).mockResolvedValue({ data: { token: 't', user: { id: 1, roles: [], permissions: [] } } })
    ;(authApi.logout as any).mockRejectedValue(new Error('network'))
    await auth.login('x', 'y')

    await expect(auth.logout()).resolves.toBeUndefined()
    expect(auth.isAuthenticated).toBe(false)
  })
})
