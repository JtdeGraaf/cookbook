import { describe, expect, it } from 'vitest'
import { recipeFileSchema } from './recipe-file'
import { recipeTemplate } from './recipe-template'
import { makeRecipe } from '@/test/fixtures'
import { editRecipeUrl, newRecipeUrl, parseServingsParam, shareRecipeUrl } from './links'

const carbonara = makeRecipe({ slug: 'carbonara', folderPath: 'mains/pasta' })

describe('GitHub links', () => {
  it('opens the recipe.json of a recipe in the GitHub editor', () => {
    expect(editRecipeUrl(carbonara)).toBe(
      'https://github.com/JtdeGraaf/cookbook/edit/main/recipes/mains/pasta/carbonara/recipe.json',
    )
  })

  it('opens a new recipe.json in the right folder, filled with the template', () => {
    const url = new URL(newRecipeUrl('mains/pasta'))

    expect(url.pathname).toBe('/JtdeGraaf/cookbook/new/main/recipes/mains/pasta')
    expect(url.searchParams.get('filename')).toBe('new-recipe/recipe.json')
    expect(url.searchParams.get('value')).toBe(recipeTemplate('mains/pasta'))
  })
})

describe('recipeTemplate', () => {
  it('passes the recipe checks, so the site keeps building while it is filled in', () => {
    expect(recipeFileSchema.safeParse(JSON.parse(recipeTemplate('mains/pasta'))).success).toBe(true)
  })

  it('points $schema back up to the repository root', () => {
    expect(JSON.parse(recipeTemplate('mains/pasta')).$schema).toBe('../../../../schemas/recipe.schema.json')
    expect(JSON.parse(recipeTemplate('desserts')).$schema).toBe('../../../schemas/recipe.schema.json')
  })
})

describe('shared servings', () => {
  it('builds a link that opens the recipe for a number of people', () => {
    expect(shareRecipeUrl('https://cookbook.graaf.dev', carbonara, 6)).toBe(
      'https://cookbook.graaf.dev/mains/pasta/carbonara?servings=6',
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
