import { describe, expect, it } from 'vitest'
import { parseLanguage, pickStartingLanguage } from './language'

describe('pickStartingLanguage', () => {
  it('opens a shared link in the language it was shared in', () => {
    expect(pickStartingLanguage({ linked: 'nl', saved: 'en', hostname: 'cookbook.graaf.dev', browserLanguages: ['en'] })).toBe(
      'nl',
    )
  })

  it('uses the language the reader picked before', () => {
    expect(pickStartingLanguage({ linked: null, saved: 'en', hostname: 'kookboek.graaf.dev', browserLanguages: ['nl'] })).toBe('en')
  })

  it('opens in Dutch on kookboek.graaf.dev', () => {
    expect(pickStartingLanguage({ linked: null, saved: null, hostname: 'kookboek.graaf.dev', browserLanguages: ['en-US'] })).toBe(
      'nl',
    )
  })

  it('follows the browser on cookbook.graaf.dev', () => {
    expect(pickStartingLanguage({ linked: null, saved: null, hostname: 'cookbook.graaf.dev', browserLanguages: ['nl-BE', 'en'] })).toBe(
      'nl',
    )
  })

  it('falls back to English when the browser speaks neither language', () => {
    expect(pickStartingLanguage({ linked: null, saved: null, hostname: 'cookbook.graaf.dev', browserLanguages: ['de-DE', 'fr'] })).toBe(
      'en',
    )
  })
})

describe('parseLanguage', () => {
  it('accepts only known languages', () => {
    expect(parseLanguage('nl')).toBe('nl')
    expect(parseLanguage('de')).toBeNull()
    expect(parseLanguage(42)).toBeNull()
  })
})
