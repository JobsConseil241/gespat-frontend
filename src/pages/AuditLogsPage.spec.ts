import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

vi.mock('@/api/endpoints', () => ({
  auditApi: {
    list: vi.fn(),
    stats: vi.fn(),
  },
}))

// Stub Chart.js
vi.mock('@/components/ChartCard.vue', () => ({
  default: { template: '<div class="chart-stub" />' },
}))

import AuditLogsPage from './AuditLogsPage.vue'
import { auditApi } from '@/api/endpoints'

describe('AuditLogsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(auditApi.list as any).mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            event: 'created',
            auditable_type: 'App\\Models\\Immobilisation',
            auditable_id: 42,
            created_at: '2026-05-15T10:00:00.000000Z',
            ip_address: '127.0.0.1',
            user_agent: 'curl/8.7.1',
            url: 'http://x/api/v1/immobilisations',
            old_values: [],
            new_values: { code_inventaire: 'XYZ-001', libelle: 'Test' },
            user: { id: 1, matricule: 'ADM-0001', nom: 'Admin', prenom: 'Sys', email: 'a@b.c' },
          },
        ],
        meta: { current_page: 1, last_page: 1, per_page: 50, total: 1 },
      },
    })
    ;(auditApi.stats as any).mockResolvedValue({
      data: { data: { par_action: [{ event: 'created', nb: 5 }], par_jour_30: [], total: 5 } },
    })
  })

  it('charge les logs et les stats au montage', async () => {
    mount(AuditLogsPage)
    await flushPromises()
    expect(auditApi.list).toHaveBeenCalledOnce()
    expect(auditApi.stats).toHaveBeenCalledOnce()
  })

  it('affiche le nom court de l\'entité (sans namespace)', async () => {
    const w = mount(AuditLogsPage)
    await flushPromises()
    // Le namespace App\Models\ est retiré
    expect(w.text()).toContain('Immobilisation')
    expect(w.text()).not.toContain('App\\Models\\Immobilisation')
  })

  it('affiche l\'utilisateur quand présent', async () => {
    const w = mount(AuditLogsPage)
    await flushPromises()
    expect(w.text()).toContain('Sys Admin')
    expect(w.text()).toContain('ADM-0001')
  })

  it('affiche "système" pour un audit sans utilisateur', async () => {
    ;(auditApi.list as any).mockResolvedValue({
      data: {
        data: [{
          id: 1, event: 'created', auditable_type: 'App\\Models\\X', auditable_id: 1,
          created_at: '2026-05-15T10:00:00Z', ip_address: '127.0.0.1', user_agent: 'x',
          url: 'x', old_values: [], new_values: {}, user: null,
        }],
        meta: { current_page: 1, last_page: 1, per_page: 50, total: 1 },
      },
    })

    const w = mount(AuditLogsPage)
    await flushPromises()
    expect(w.text()).toContain('système')
  })

  it('badge avec la couleur appropriée selon l\'event', async () => {
    ;(auditApi.list as any).mockResolvedValue({
      data: {
        data: [
          { id: 1, event: 'created', auditable_type: 'X', auditable_id: 1, created_at: '2026-05-15T10:00:00Z', ip_address: '1', user_agent: '', url: '', old_values: [], new_values: {} },
          { id: 2, event: 'deleted', auditable_type: 'X', auditable_id: 2, created_at: '2026-05-15T10:00:00Z', ip_address: '1', user_agent: '', url: '', old_values: {}, new_values: {} },
        ],
        meta: { current_page: 1, last_page: 1, per_page: 50, total: 2 },
      },
    })

    const w = mount(AuditLogsPage)
    await flushPromises()
    expect(w.html()).toContain('badge-success') // created
    expect(w.html()).toContain('badge-danger')  // deleted
  })
})
