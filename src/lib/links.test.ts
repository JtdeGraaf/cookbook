import { describe, expect, it } from 'vitest'
import { makeRecipe } from '@/test/fixtures'
import { parseServingsParam, shareRecipeUrl } from './links'

const carbonara = makeRecipe({ slug: 'carbonara', folderPath: 'mains/pasta' })

describe('shared servings', () => {
  it('builds a link that opens the recipe for a number of people, in the sender’s language', () => {
    expect(shareRecipeUrl('https://cookbook.graaf.dev', carbonara, 6, 'nl')).toBe(
      'https://cookbook.graaf.dev/mains/pasta/carbonara?servings=6&lang=nl',
    )
  })

  it('accepts only whole numbers of people within limits', () => {
    expect(parseServingsParam('6')).toBe(6)
    expect(parseServingsParam(6)).toBe(6)
    expect(parseServingsParam('0')).toBeNull()
    expect(parseServingsParam('2.5')).toBeNull()
    expect(parseServingsParam('lots')).toBeNull()
    expect(parseServingsParam(undefined)).toBeNull()
  })
})
