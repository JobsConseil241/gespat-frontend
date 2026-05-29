import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from './StatusBadge.vue'

describe('StatusBadge', () => {
  it('applique la classe success pour actif', () => {
    const w = mount(StatusBadge, { props: { value: 'actif' } })
    expect(w.classes()).toContain('badge-success')
    expect(w.text()).toBe('actif')
  })

  it('applique la classe danger pour perdu/vole/detruit', () => {
    for (const v of ['perdu', 'vole', 'detruit']) {
      const w = mount(StatusBadge, { props: { value: v } })
      expect(w.classes()).toContain('badge-danger')
    }
  })

  it('applique warning pour en_maintenance et en_cours', () => {
    expect(mount(StatusBadge, { props: { value: 'en_maintenance' } }).classes()).toContain('badge-warning')
    expect(mount(StatusBadge, { props: { value: 'en_cours' } }).classes()).toContain('badge-warning')
  })

  it('gère les statuts matching comptable', () => {
    expect(mount(StatusBadge, { props: { value: 'matche_auto' } }).classes()).toContain('badge-success')
    expect(mount(StatusBadge, { props: { value: 'non_trouve' } }).classes()).toContain('badge-danger')
  })

  it('retombe sur badge-gray pour une valeur inconnue', () => {
    const w = mount(StatusBadge, { props: { value: 'valeur_bidon' } })
    expect(w.classes()).toContain('badge-gray')
  })
})
