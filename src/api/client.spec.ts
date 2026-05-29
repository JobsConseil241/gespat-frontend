import { describe, it, expect, beforeEach, vi } from 'vitest'

// Reset window.location pour vérifier la redirection 401
const origLocation = window.location
beforeEach(() => {
  localStorage.clear()
  // @ts-expect-error — reset jsdom location
  delete window.location
  ;(window as any).location = { href: '', pathname: '/' }
  vi.resetModules()
})

describe('api client', () => {
  it('attache le Bearer token à chaque requête si présent', async () => {
    localStorage.setItem('gespat_token', 'tok-xyz')

    const { default: api } = await import('./client')
    const config: any = { headers: {} }
    // Récupère le premier handler request des intercepteurs
    const handler = (api.interceptors.request as any).handlers[0].fulfilled
    const out = await handler(config)
    expect(out.headers.Authorization).toBe('Bearer tok-xyz')
  })

  it('ne met pas Authorization si pas de token', async () => {
    const { default: api } = await import('./client')
    const config: any = { headers: {} }
    const handler = (api.interceptors.request as any).handlers[0].fulfilled
    const out = await handler(config)
    expect(out.headers.Authorization).toBeUndefined()
  })

  it('sur 401 efface token, user et redirige vers /login', async () => {
    localStorage.setItem('gespat_token', 'old')
    localStorage.setItem('gespat_user', JSON.stringify({ id: 1 }))
    ;(window as any).location.pathname = '/dashboard'

    const { default: api } = await import('./client')
    const errorHandler = (api.interceptors.response as any).handlers[0].rejected
    const err = { response: { status: 401 } }
    await expect(errorHandler(err)).rejects.toBe(err)

    expect(localStorage.getItem('gespat_token')).toBeNull()
    expect(localStorage.getItem('gespat_user')).toBeNull()
    expect(window.location.href).toContain('/login')
  })

  it('sur 401 depuis /login ne redirige pas (évite la boucle)', async () => {
    localStorage.setItem('gespat_token', 'old')
    ;(window as any).location.pathname = '/login'
    ;(window as any).location.href = ''

    const { default: api } = await import('./client')
    const errorHandler = (api.interceptors.response as any).handlers[0].rejected
    await expect(errorHandler({ response: { status: 401 } })).rejects.toBeTruthy()
    expect(window.location.href).toBe('')
  })

  it('propage les erreurs non-401 sans toucher localStorage', async () => {
    localStorage.setItem('gespat_token', 'tok')
    const { default: api } = await import('./client')
    const errorHandler = (api.interceptors.response as any).handlers[0].rejected
    await expect(errorHandler({ response: { status: 500 } })).rejects.toBeTruthy()
    expect(localStorage.getItem('gespat_token')).toBe('tok')
  })
})

// Restore
afterAll(() => {
  ;(window as any).location = origLocation
})

// helper afterAll if vitest doesn't expose it
function afterAll(fn: () => void) {
  ;(globalThis as any).__cleanups = (globalThis as any).__cleanups ?? []
  ;(globalThis as any).__cleanups.push(fn)
}
