import { describe, expect, it } from 'vitest'
import { pageKindFor } from './page-kind'

describe('pageKindFor', () => {
  it('knows the cover', () => {
    expect(pageKindFor('/')).toBe('cover')
  })

  it('treats every page inside a recipe as a recipe page', () => {
    expect(pageKindFor('/mains/carbonara')).toBe('recipe')
    expect(pageKindFor('/mains/carbonara/cook/2')).toBe('recipe')
  })

  it('treats chapters and search as other pages', () => {
    expect(pageKindFor('/mains')).toBe('other')
    expect(pageKindFor('/search')).toBe('other')
  })
})
