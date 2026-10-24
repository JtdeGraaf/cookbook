// @vitest-environment jsdom
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18next from 'i18next'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { setUpTranslations } from '@/i18n/i18n'
import { EMPTY_SHOPPING_LIST } from '@/lib/shopping-list'
import { shoppingListStore } from '@/features/shopping/shopping-list-store'
import { makeRecipe } from '@/test/fixtures'
import { IngredientBox } from './IngredientBox'
import { useRecipeProgress } from './useRecipeProgress'

const carbonara = makeRecipe({ slug: 'carbonara', folderPath: 'mains/pasta' })

function CarbonaraBox() {
  const controls = useRecipeProgress(carbonara)
  return <IngredientBox recipe={carbonara} controls={controls} />
}

function renderCarbonaraBox() {
  const router = createRouter({
    routeTree: createRootRoute({ component: CarbonaraBox }),
    history: createMemoryHistory(),
  })
  render(<RouterProvider router={router} />)
}

beforeAll(async () => {
  await setUpTranslations('en')
})

afterEach(() => {
  cleanup()
  shoppingListStore.set(() => EMPTY_SHOPPING_LIST)
  window.localStorage.clear()
})

afterAll(async () => {
  await i18next.changeLanguage('en')
})

describe('IngredientBox', () => {
  it('puts the recipe on the shopping list from the ingredients and takes it off again', async () => {
    const user = userEvent.setup()
    renderCarbonaraBox()

    await user.click(await screen.findByRole('button', { name: 'Add to shopping list' }))

    const onList = screen.getByRole('button', { name: 'On the shopping list' })
    expect(onList).toHaveAttribute('aria-pressed', 'true')
    expect(shoppingListStore.get().recipePaths).toEqual(['mains/pasta/carbonara'])
    expect(screen.getByRole('link', { name: 'View list' })).toHaveAttribute('href', '/shopping-list')

    await user.click(onList)

    expect(screen.getByRole('button', { name: 'Add to shopping list' })).toHaveAttribute('aria-pressed', 'false')
    expect(shoppingListStore.get().recipePaths).toEqual([])
    expect(screen.queryByRole('link', { name: 'View list' })).toBeNull()
  })

  it('offers the shopping list in Dutch too', async () => {
    await i18next.changeLanguage('nl')
    const user = userEvent.setup()
    renderCarbonaraBox()

    await user.click(await screen.findByRole('button', { name: 'Op de boodschappenlijst zetten' }))

    expect(screen.getByRole('button', { name: 'Staat op de boodschappenlijst' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('link', { name: 'Bekijk lijst' })).toBeTruthy()
  })
})
