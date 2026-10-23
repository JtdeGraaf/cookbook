import { describe, expect, it } from 'vitest'
import { both, makeBook, makeChapter, makeIngredient, makeRecipe } from '@/test/fixtures'
import { buildSearchIndex, searchRecipes } from './search'

const shakshuka = makeRecipe({
  slug: 'shakshuka',
  title: both('Shakshuka'),
  tags: [both('vegetarian', 'vegetarisch')],
  ingredients: [makeIngredient({ id: 'eggs', name: both('eggs', 'eieren') })],
})
const stamppot = makeRecipe({
  slug: 'kale-stamppot',
  title: both('Kale stamppot', 'Boerenkoolstamppot'),
  summary: both('Mashed and smeuïg'),
  ingredients: [makeIngredient({ id: 'kale', name: both('kale', 'boerenkool') })],
})
const eggPasta = makeRecipe({
  slug: 'egg-pasta',
  title: both('Egg pasta', 'Eierpasta'),
})
const index = buildSearchIndex(
  makeBook([
    makeChapter({ slug: 'breakfast', title: both('Breakfast', 'Ontbijt'), recipes: [shakshuka] }),
    makeChapter({ slug: 'mains', title: both('Mains', 'Hoofdgerechten'), recipes: [stamppot, eggPasta] }),
  ]),
)

const slugs = (query: string) => searchRecipes(index, query).map((hit) => hit.recipe.slug)

describe('searchRecipes', () => {
  it('finds recipes by an ingredient in either language', () => {
    expect(slugs('eieren')).toEqual(['shakshuka'])
    expect(slugs('boerenkool')).toEqual(['kale-stamppot'])
  })

  it('ranks a title match above an ingredient match', () => {
    expect(slugs('egg')).toEqual(['egg-pasta', 'shakshuka'])
  })

  it('finds recipes by tag', () => {
    expect(slugs('vegetarisch')).toEqual(['shakshuka'])
  })

  it('finds recipes by chapter name', () => {
    expect(slugs('ontbijt')).toEqual(['shakshuka'])
  })

  it('needs every word of the query to match', () => {
    expect(slugs('eggs kale')).toEqual([])
    expect(slugs('kale mains')).toEqual(['kale-stamppot'])
  })

  it('ignores case and accents', () => {
    expect(slugs('SMEUIG')).toEqual(['kale-stamppot'])
  })

  it('returns nothing for an empty query', () => {
    expect(slugs('   ')).toEqual([])
  })

  it('reports which ingredients matched', () => {
    const [hit] = searchRecipes(index, 'eggs')
    expect(hit.recipe.slug).toBe('shakshuka')
    expect(hit.matchedIngredients).toEqual([both('eggs', 'eieren')])
  })
})
