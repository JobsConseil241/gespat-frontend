// Setup global pour Vitest — exécuté avant chaque fichier de test.
import { vi } from 'vitest'

// localStorage mock minimal pour jsdom
const store: Record<string, string> = {}
const localStorageMock = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = String(v) },
  removeItem: (k: string) => { delete store[k] },
  clear: () => { for (const k of Object.keys(store)) delete store[k] },
}
vi.stubGlobal('localStorage', localStorageMock)

// matchMedia (utilisé par certaines libs)
vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
  matches: false, addListener: vi.fn(), removeListener: vi.fn(),
  addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
}))
