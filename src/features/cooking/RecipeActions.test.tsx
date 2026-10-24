// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import i18next from 'i18next'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { setUpTranslations } from '@/i18n/i18n'
import { both, makeRecipe } from '@/test/fixtures'
import { RecipeActions } from './RecipeActions'

const carbonara = makeRecipe({ slug: 'carbonara', folderPath: 'mains/pasta', title: both('Carbonara') })

function giveClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
}

beforeAll(async () => {
  await setUpTranslations('en')
})

afterEach(async () => {
  cleanup()
  Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
  window.localStorage.clear()
  await i18next.changeLanguage('en')
})

describe('RecipeActions Share without a share sheet', () => {
  it('copies a link for the current servings and says so', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    giveClipboard(writeText)
    render(<RecipeActions recipe={carbonara} servings={4} />)

    fireEvent.click(screen.getByRole('button', { name: 'Share' }))

    expect(await screen.findByRole('button', { name: 'Link copied' })).toBeInTheDocument()
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/mains/pasta/carbonara?servings=4&lang=en`)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('says it couldn’t copy and offers the link to copy by hand when the clipboard is refused', async () => {
    giveClipboard(() => Promise.reject(new DOMException('Document is not focused.', 'NotAllowedError')))
    render(<RecipeActions recipe={carbonara} servings={4} />)

    fireEvent.click(screen.getByRole('button', { name: 'Share' }))

    expect(await screen.findByRole('button', { name: 'Couldn’t copy' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Copy the link yourself:' })).toHaveValue(
      `${window.location.origin}/mains/pasta/carbonara?servings=4&lang=en`,
    )
  })

  it('offers the link to copy by hand, in Dutch, when the browser has no clipboard', async () => {
    await i18next.changeLanguage('nl')
    render(<RecipeActions recipe={carbonara} servings={2} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delen' }))

    expect(await screen.findByRole('button', { name: 'Kopiëren lukte niet' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Kopieer de link zelf:' })).toHaveValue(
      `${window.location.origin}/mains/pasta/carbonara?servings=2&lang=nl`,
    )
  })

  it('drops the copy-by-hand field once a second try copies the link', async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>()
    writeText.mockRejectedValueOnce(new DOMException('Denied', 'NotAllowedError')).mockResolvedValueOnce(undefined)
    giveClipboard(writeText)
    render(<RecipeActions recipe={carbonara} servings={4} />)

    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Couldn’t copy' }))

    expect(await screen.findByRole('button', { name: 'Link copied' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
