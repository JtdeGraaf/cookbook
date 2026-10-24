// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { setUpTranslations } from '@/i18n/i18n'
import { makeRecipe } from '@/test/fixtures'
import { OriginalRecipe } from './OriginalRecipe'

beforeAll(async () => {
  await setUpTranslations('en')
})

afterEach(() => {
  cleanup()
})

describe('OriginalRecipe', () => {
  it('links to the original recipe in a new tab, named by its website when it has no name', () => {
    const url = 'https://www.ah.nl/allerhande/recept/R-R424708/superromige-pasta-carbonara'
    render(<OriginalRecipe recipe={makeRecipe({ slug: 'carbonara', source: { url, name: null } })} />)

    const link = screen.getByRole('link', { name: /ah\.nl/ })
    expect(link).toHaveAttribute('href', url)
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('shows nothing for a recipe of our own', () => {
    const { container } = render(<OriginalRecipe recipe={makeRecipe({ slug: 'stew' })} />)

    expect(container).toBeEmptyDOMElement()
  })
})
