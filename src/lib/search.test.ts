import { describe, expect, it } from 'vitest'
import { both, makeBook, makeFolder, makeIngredient, makeRecipe } from '@/test/fixtures'
import { buildSearchIndex, searchRecipes } from './search'

const shakshuka = makeRecipe({
  slug: 'shakshuka',
  folderPath: 'breakfast',
  title: both('Shakshuka'),
  tags: [both('vegetarian', 'vegetarisch')],
  ingredients: [makeIngredient({ id: 'eggs', name: both('egg', 'ei'), plural: both('eggs', 'eieren') })],
})
const stamppot = makeRecipe({
  slug: 'kale-stamppot',
  title: both('Kale stamppot', 'Boerenkoolstamppot'),
  summary: both('Mashed and smeuïg'),
  ingredients: [makeIngredient({ id: 'kale', name: both('kale', 'boerenkool') })],
})
const eggPasta = makeRecipe({
  slug: 'egg-pasta',
  folderPath: 'mains/pasta',
  title: both('Egg pasta', 'Eierpasta'),
})
const index = buildSearchIndex(
  makeBook([
    makeFolder({ path: 'breakfast', title: both('Breakfast', 'Ontbijt'), recipes: [shakshuka] }),
    makeFolder({
      path: 'mains',
      title: both('Mains', 'Hoofdgerechten'),
      recipes: [stamppot],
      folders: [makeFolder({ path: 'mains/pasta', title: both('Pasta'), recipes: [eggPasta] })],
    }),
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

  it('finds recipes by the name of any folder above them', () => {
    expect(slugs('ontbijt')).toEqual(['shakshuka'])
    expect(slugs('hoofdgerechten')).toEqual(['egg-pasta', 'kale-stamppot'])
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
    expect(hit.matchedIngredients).toEqual([both('egg', 'ei')])
  })

  it('finds an ingredient by its plural name and reports it once, by its plain name', () => {
    const [hit] = searchRecipes(index, 'eieren')
    expect(hit.recipe.slug).toBe('shakshuka')
    expect(hit.matchedIngredients).toEqual([both('egg', 'ei')])
  })
})
