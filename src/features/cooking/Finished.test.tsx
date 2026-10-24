// @vitest-environment jsdom
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { cleanup, render, screen } from '@testing-library/react'
import i18next from 'i18next'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { setUpTranslations } from '@/i18n/i18n'
import { EMPTY_JOURNAL } from '@/lib/journal'
import { EMPTY_SHOPPING_LIST } from '@/lib/shopping-list'
import { shoppingListStore } from '@/features/shopping/shopping-list-store'
import { both, makeRecipe } from '@/test/fixtures'
import { finishCooking } from './finish-cooking'
import { Finished } from './Finished'
import { journalStore } from './journal-store'

const carbonara = makeRecipe({ slug: 'carbonara', folderPath: 'mains/pasta', title: both('Carbonara') })

function renderDonePage() {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => <Finished recipe={carbonara} /> }),
    history: createMemoryHistory(),
  })
  render(<RouterProvider router={router} />)
}

beforeAll(async () => {
  await setUpTranslations('en')
})

afterEach(async () => {
  cleanup()
  shoppingListStore.set(() => EMPTY_SHOPPING_LIST)
  journalStore(carbonara.path).set(() => EMPTY_JOURNAL)
  window.localStorage.clear()
  await i18next.changeLanguage('en')
})

afterAll(async () => {
  await i18next.changeLanguage('en')
})

describe('Finished', () => {
  it('says the recipe came off the shopping list and offers to put it back when it was on it', async () => {
    shoppingListStore.set(() => ({ recipePaths: [carbonara.path] }))

    finishCooking(carbonara)
    renderDonePage()

    expect(
      await screen.findByText(
        'That’s Carbonara done. The ticks and timers are cleared and it’s off the shopping list, ready for next time.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Put it back on the shopping list' })).toBeInTheDocument()
  })

  it('leaves the shopping list out and offers to add the recipe when it was never on it', async () => {
    finishCooking(carbonara)
    renderDonePage()

    expect(
      await screen.findByText('That’s Carbonara done. The ticks and timers are cleared, ready for next time.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add to shopping list' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Put it back on the shopping list' })).toBeNull()
  })

  it('tells it the same way in Dutch', async () => {
    await i18next.changeLanguage('nl')

    finishCooking(carbonara)
    renderDonePage()

    expect(
      await screen.findByText('Carbonara is klaar. De vinkjes en kookwekkers zijn gewist, klaar voor de volgende keer.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Op de boodschappenlijst zetten' })).toBeInTheDocument()
  })
})
