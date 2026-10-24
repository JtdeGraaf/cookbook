// @vitest-environment jsdom
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import i18next from 'i18next'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { setUpTranslations } from '@/i18n/i18n'
import { EMPTY_SHOPPING_LIST } from '@/lib/shopping-list'
import { ShoppingListPage } from './ShoppingListPage'
import { shoppingListStore } from './shopping-list-store'

function renderShoppingList() {
  const router = createRouter({
    routeTree: createRootRoute({ component: ShoppingListPage }),
    history: createMemoryHistory(),
  })
  render(<RouterProvider router={router} />)
}

function giveClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
}

beforeAll(async () => {
  await setUpTranslations('en')
})

afterEach(async () => {
  cleanup()
  Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
  shoppingListStore.set(() => EMPTY_SHOPPING_LIST)
  window.localStorage.clear()
  await i18next.changeLanguage('en')
})

describe('ShoppingListPage Copy list', () => {
  it('copies one line per thing to buy and says so', async () => {
    const writeText = vi.fn((_text: string) => Promise.resolve())
    giveClipboard(writeText)
    shoppingListStore.set(() => ({ recipePaths: ['mains/pasta/carbonara'] }))
    renderShoppingList()

    fireEvent.click(await screen.findByRole('button', { name: 'Copy list' }))

    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument()
    const lines = writeText.mock.calls[0][0].split('\n')
    expect(lines.length).toBe(screen.getAllByRole('checkbox').length)
    expect(lines.every((line) => line.startsWith('- '))).toBe(true)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('says it couldn’t copy and offers the list to copy by hand when the clipboard is refused', async () => {
    const writeText = vi.fn((_text: string) => Promise.reject(new DOMException('Denied', 'NotAllowedError')))
    giveClipboard(writeText)
    shoppingListStore.set(() => ({ recipePaths: ['mains/pasta/carbonara'] }))
    renderShoppingList()

    fireEvent.click(await screen.findByRole('button', { name: 'Copy list' }))

    expect(await screen.findByRole('button', { name: 'Couldn’t copy' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Copy the list yourself:' })).toHaveValue(writeText.mock.calls[0][0])
  })

  it('offers the list to copy by hand, in Dutch, when the browser has no clipboard', async () => {
    await i18next.changeLanguage('nl')
    shoppingListStore.set(() => ({ recipePaths: ['mains/pasta/carbonara'] }))
    renderShoppingList()

    fireEvent.click(await screen.findByRole('button', { name: 'Lijst kopiëren' }))

    expect(await screen.findByRole('button', { name: 'Kopiëren lukte niet' })).toBeInTheDocument()
    const field = screen.getByRole('textbox', { name: 'Kopieer de lijst zelf:' })
    expect((field as HTMLTextAreaElement).value.split('\n').length).toBe(screen.getAllByRole('checkbox').length)
  })
})
