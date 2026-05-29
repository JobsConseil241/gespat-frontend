import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

vi.mock('@/api/endpoints', () => ({
  dashboardApi: {
    kpi: vi.fn(),
    parCategorie: vi.fn(),
    parSite: vi.fn(),
    parStatut: vi.fn(),
  },
}))

// Stub Chart.js (qui requiert canvas indisponible en jsdom)
vi.mock('@/components/ChartCard.vue', () => ({
  default: { template: '<div class="chart-stub" />' },
}))

import DashboardPage from './DashboardPage.vue'
import { dashboardApi } from '@/api/endpoints'

const stubKpi = {
  biens: { total: 42, actifs: 38, sortis: 4 },
  valorisation: { valeur_brute_acquisition: 1500000, vnc_totale_exercice_courant: 900000, devise: 'XAF' },
  inventaire: { campagnes_en_cours: 2 },
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(dashboardApi.kpi as any).mockResolvedValue({ data: { data: stubKpi } })
    ;(dashboardApi.parCategorie as any).mockResolvedValue({ data: { data: [
      { code: 'MAT-INF', libelle: 'Matériel informatique', nombre: 12, valeur_brute: 800000 },
    ] } })
    ;(dashboardApi.parSite as any).mockResolvedValue({ data: { data: [
      { code: 'SIEGE', libelle: 'Siège', nombre: 30, valeur_brute: 1200000 },
    ] } })
    ;(dashboardApi.parStatut as any).mockResolvedValue({ data: { data: [
      { statut: 'actif', nombre: 38, valeur_brute: 1400000 },
    ] } })
  })

  it('affiche les KPI après chargement', async () => {
    const w = mount(DashboardPage)
    expect(w.text()).toContain('Chargement…')

    await flushPromises()

    expect(w.text()).toContain('Total biens')
    expect(w.text()).toContain('42')      // total
    expect(w.text()).toContain('38')      // actifs
    expect(w.text()).toContain('4')       // sortis (cherche surtout 4)
    expect(w.text()).toContain('XAF')
  })

  it('affiche la valorisation formatée en français', async () => {
    const w = mount(DashboardPage)
    await flushPromises()

    // 1 500 000 avec espace insécable d'Intl.NumberFormat fr-FR
    expect(w.text()).toMatch(/1[\s  ]500[\s  ]000/)
    expect(w.text()).toMatch(/900[\s  ]000/)
  })

  it('appelle les 4 endpoints en parallèle au montage', async () => {
    mount(DashboardPage)
    await flushPromises()
    expect(dashboardApi.kpi).toHaveBeenCalledOnce()
    expect(dashboardApi.parCategorie).toHaveBeenCalledOnce()
    expect(dashboardApi.parSite).toHaveBeenCalledOnce()
    expect(dashboardApi.parStatut).toHaveBeenCalledOnce()
  })

  it('affiche le détail par catégorie dans le tableau', async () => {
    const w = mount(DashboardPage)
    await flushPromises()

    expect(w.text()).toContain('MAT-INF')
    expect(w.text()).toContain('Matériel informatique')
  })

  it('affiche le nombre de campagnes en cours', async () => {
    const w = mount(DashboardPage)
    await flushPromises()
    expect(w.text()).toContain('Campagnes en cours')
    expect(w.text()).toContain('2')
  })
})
