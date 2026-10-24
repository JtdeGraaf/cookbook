// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import i18next from 'i18next'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { setUpTranslations } from '@/i18n/i18n'
import { both, makeIngredient, makeRecipe, makeStep } from '@/test/fixtures'
import { IngredientChips } from './IngredientChips'

const step = makeStep({ ingredientIds: ['salt', 'spaghetti'] })
const recipe = makeRecipe({
  slug: 'carbonara',
  servings: 1,
  ingredients: [
    makeIngredient({ id: 'salt', name: both('salt', 'zout'), quantity: null }),
    makeIngredient({ id: 'spaghetti', quantity: { amount: 150, unit: 'g' } }),
  ],
  cook: [step],
})

function chipTexts() {
  return screen.getAllByRole('listitem').map((chip) => chip.textContent)
}

beforeAll(async () => {
  await setUpTranslations('en')
})

afterEach(async () => {
  cleanup()
  await i18next.changeLanguage('en')
})

describe('IngredientChips', () => {
  it('puts the name first for a to-taste ingredient and the amount first otherwise', () => {
    render(<IngredientChips recipe={recipe} step={step} servings={2} />)

    expect(chipTexts()).toEqual(['salt, to taste', '300 g spaghetti'])
    expect(screen.getByText('to taste')).toHaveClass('chip__amount')
  })

  it('reads the same way in Dutch', async () => {
    await i18next.changeLanguage('nl')
    render(<IngredientChips recipe={recipe} step={step} servings={1} />)

    expect(chipTexts()).toEqual(['zout naar smaak', '150 g spaghetti'])
    expect(screen.getByText('naar smaak')).toHaveClass('chip__amount')
  })
})
