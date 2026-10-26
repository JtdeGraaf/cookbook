// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import i18next from 'i18next'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { setUpTranslations } from '@/i18n/i18n'
import { ServingsStepper } from './ServingsStepper'

beforeAll(async () => {
  await setUpTranslations('en')
})

afterEach(() => {
  cleanup()
})

afterAll(async () => {
  await i18next.changeLanguage('en')
})

describe('ServingsStepper', () => {
  it('keeps the short labels on a recipe page', () => {
    render(<ServingsStepper kind="dish" servings={2} onChange={() => {}} />)

    expect(screen.getByRole('group', { name: 'Servings' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'One person fewer' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'One person more' })).toBeTruthy()
  })

  it('names the recipe when given one, so several steppers can be told apart', () => {
    render(<ServingsStepper kind="dish" servings={2} onChange={() => {}} recipeTitle="Spaghetti carbonara" />)

    expect(screen.getByRole('group', { name: 'Servings for Spaghetti carbonara' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'One person fewer for Spaghetti carbonara' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'One person more for Spaghetti carbonara' })).toBeTruthy()
  })

  it('names the recipe in Dutch too', async () => {
    await i18next.changeLanguage('nl')
    render(<ServingsStepper kind="dish" servings={2} onChange={() => {}} recipeTitle="Spaghetti carbonara" />)

    expect(screen.getByRole('group', { name: 'Personen voor Spaghetti carbonara' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Eén persoon minder voor Spaghetti carbonara' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Eén persoon meer voor Spaghetti carbonara' })).toBeTruthy()
  })

  it('counts drinks instead of people for a drink', async () => {
    await i18next.changeLanguage('en')
    render(<ServingsStepper kind="drink" servings={2} onChange={() => {}} recipeTitle="Negroni" />)

    expect(screen.getByRole('group', { name: 'Drinks of Negroni' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'One Negroni fewer' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'One Negroni more' })).toBeTruthy()
    expect(screen.getByText('2 drinks')).toBeTruthy()
  })

  it('counts glasses in Dutch', async () => {
    await i18next.changeLanguage('nl')
    render(<ServingsStepper kind="drink" servings={1} onChange={() => {}} />)

    expect(screen.getByRole('button', { name: 'Eén glas meer' })).toBeTruthy()
    expect(screen.getByText('1 glas')).toBeTruthy()
  })
})
