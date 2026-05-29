import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from './Pagination.vue'

describe('Pagination', () => {
  it('ne rend rien si une seule page', () => {
    const w = mount(Pagination, { props: { meta: { current_page: 1, last_page: 1, total: 5 } } })
    expect(w.text()).toBe('')
  })

  it('ne rend rien si meta est null', () => {
    const w = mount(Pagination, { props: { meta: null } })
    expect(w.text()).toBe('')
  })

  it('affiche les infos de page sur plusieurs pages', () => {
    const w = mount(Pagination, { props: { meta: { current_page: 2, last_page: 5, total: 120 } } })
    expect(w.text()).toContain('Page 2 / 5')
    expect(w.text()).toContain('120')
  })

  it('émet change(page-1) sur Précédent', async () => {
    const w = mount(Pagination, { props: { meta: { current_page: 3, last_page: 5, total: 100 } } })
    await w.findAll('button')[0].trigger('click')
    expect(w.emitted('change')?.[0]).toEqual([2])
  })

  it('émet change(page+1) sur Suivant', async () => {
    const w = mount(Pagination, { props: { meta: { current_page: 3, last_page: 5, total: 100 } } })
    await w.findAll('button')[1].trigger('click')
    expect(w.emitted('change')?.[0]).toEqual([4])
  })

  it('désactive Précédent sur la première page', () => {
    const w = mount(Pagination, { props: { meta: { current_page: 1, last_page: 5, total: 100 } } })
    expect(w.findAll('button')[0].attributes('disabled')).toBeDefined()
  })

  it('désactive Suivant sur la dernière page', () => {
    const w = mount(Pagination, { props: { meta: { current_page: 5, last_page: 5, total: 100 } } })
    expect(w.findAll('button')[1].attributes('disabled')).toBeDefined()
  })
})
