// @vitest-environment jsdom
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18next from 'i18next'
import type { ReactNode } from 'react'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { setUpTranslations } from '@/i18n/i18n'
import type { Step, Technique } from '@/lib/book'
import { both, makeRecipe, makeStep } from '@/test/fixtures'
import { PrepChecklist } from './PrepChecklist'
import { StepText } from './StepText'
import { useRecipeProgress } from './useRecipeProgress'

const chopFinely: Technique = {
  id: 'chop-finely',
  name: { en: 'Chop finely', nl: 'Fijnsnijden' },
  explanation: { en: 'Cut into tiny pieces.', nl: 'Snijd in heel kleine stukjes.' },
}

const chopTheOnion: Step = makeStep({
  text: { en: 'Peel the onion and chop it finely.', nl: 'Pel de ui en snijd hem fijn.' },
  pieces: {
    en: [
      { kind: 'words', text: 'Peel the onion and ' },
      { kind: 'technique', text: 'chop it finely', technique: chopFinely },
      { kind: 'words', text: '.' },
    ],
    nl: [
      { kind: 'words', text: 'Pel de ui en ' },
      { kind: 'technique', text: 'snijd hem fijn', technique: chopFinely },
      { kind: 'words', text: '.' },
    ],
  },
})

const soup = makeRecipe({ slug: 'soup', prep: [chopTheOnion, makeStep({ text: both('Heat the oven.') })] })

function SoupPrep() {
  const controls = useRecipeProgress(soup)
  return <PrepChecklist recipe={soup} controls={controls} />
}

function renderInRouter(component: () => ReactNode) {
  const router = createRouter({ routeTree: createRootRoute({ component }), history: createMemoryHistory() })
  render(<RouterProvider router={router} />)
}

beforeAll(async () => {
  await setUpTranslations('en')
})

afterEach(async () => {
  cleanup()
  window.localStorage.clear()
  await i18next.changeLanguage('en')
})

afterAll(async () => {
  await i18next.changeLanguage('en')
})

describe('StepText', () => {
  it('hides the explanation of a cooking term until its (i) button is pressed', async () => {
    const user = userEvent.setup()
    render(<StepText step={chopTheOnion} />)
    const button = screen.getByRole('button', { name: 'What does “chop it finely” mean?' })
    const explanation = screen.getByText('Cut into tiny pieces.', { exact: false })

    expect(screen.getByText('Peel the onion and', { exact: false })).toHaveTextContent('Peel the onion and chop it finely.')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(explanation).not.toBeVisible()
    expect(button).toHaveAttribute('aria-controls', explanation.id)

    await user.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(explanation).toBeVisible()
    expect(explanation).toHaveTextContent('Chop finely Cut into tiny pieces.')

    await user.click(button)

    expect(explanation).not.toBeVisible()
  })

  it('names the button and explains the term in Dutch', async () => {
    await i18next.changeLanguage('nl')
    const user = userEvent.setup()
    render(<StepText step={chopTheOnion} />)

    await user.click(screen.getByRole('button', { name: 'Wat betekent “snijd hem fijn”?' }))

    expect(screen.getByText('Snijd in heel kleine stukjes.', { exact: false })).toHaveTextContent(
      'Fijnsnijden Snijd in heel kleine stukjes.',
    )
  })
})

describe('PrepChecklist with cooking terms', () => {
  it('opens an explanation without ticking the task, and names the tick by its words only', async () => {
    const user = userEvent.setup()
    renderInRouter(SoupPrep)
    const tick = await screen.findByRole('checkbox', { name: 'Peel the onion and chop it finely.' })

    await user.click(screen.getByRole('button', { name: 'What does “chop it finely” mean?' }))

    expect(tick).not.toBeChecked()
    expect(screen.getByText('Cut into tiny pieces.', { exact: false })).toBeVisible()

    await user.click(screen.getByText('Peel the onion and', { exact: false }))

    expect(tick).toBeChecked()
  })
})
