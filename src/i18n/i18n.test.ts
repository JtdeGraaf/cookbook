import { describe, expect, it } from 'vitest'
import en from './locales/en/translation.json'
import nl from './locales/nl/translation.json'

/** Every text in a translation file as [dotted key, text] pairs. */
function flatten(tree: object, prefix = ''): [string, string][] {
  return Object.entries(tree).flatMap(([key, value]): [string, string][] => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof value === 'object' && value !== null ? flatten(value, path) : [[path, String(value)]]
  })
}

describe('translations', () => {
  it('have the same keys in English and Dutch', () => {
    const englishKeys = flatten(en).map(([key]) => key).sort()
    const dutchKeys = flatten(nl).map(([key]) => key).sort()

    expect(dutchKeys).toEqual(englishKeys)
  })

  it('leave no Dutch text empty where the English has text', () => {
    const dutch = new Map(flatten(nl))

    const missing = flatten(en)
      .filter(([key, text]) => text !== '' && dutch.get(key) === '')
      .map(([key]) => key)

    expect(missing).toEqual([])
  })
})
