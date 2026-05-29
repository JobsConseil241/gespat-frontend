import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from './ConfirmDialog.vue'

describe('ConfirmDialog', () => {
  it('ne rend rien quand open=false', () => {
    mount(ConfirmDialog, { props: { open: false, message: 'Test' }, attachTo: document.body })
    expect(document.body.textContent).not.toContain('Test')
  })

  it('affiche le message et le titre par défaut quand open', () => {
    mount(ConfirmDialog, { props: { open: true, message: 'Supprimer ?' }, attachTo: document.body })
    expect(document.body.textContent).toContain('Supprimer ?')
    expect(document.body.textContent).toContain('Confirmation')
  })

  it('émet confirm au clic sur le bouton de confirmation', async () => {
    const w = mount(ConfirmDialog, {
      props: { open: true, message: 'X', confirmLabel: 'Valider' },
      attachTo: document.body,
    })
    const buttons = document.body.querySelectorAll('button')
    const confirmBtn = Array.from(buttons).find((b) => b.textContent?.includes('Valider'))!
    confirmBtn.click()
    await w.vm.$nextTick()
    expect(w.emitted('confirm')).toBeTruthy()
  })

  it('utilise la classe danger quand variant=danger', () => {
    mount(ConfirmDialog, {
      props: { open: true, message: 'X', variant: 'danger', confirmLabel: 'Suppr' },
      attachTo: document.body,
    })
    const btn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent?.includes('Suppr'))!
    expect(btn.className).toContain('btn-danger')
  })
})
