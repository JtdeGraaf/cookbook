import { describe, expect, it } from 'vitest'
import { dishFileSchema, drinkFileSchema } from './recipe-file'
import { drinkTemplate, recipeTemplate } from './recipe-template'

describe('recipeTemplate', () => {
  it('passes the recipe checks, so the site keeps building while it is filled in', () => {
    expect(dishFileSchema.safeParse(JSON.parse(recipeTemplate('mains/pasta'))).success).toBe(true)
  })

  it('points $schema back up to the repository root', () => {
    expect(JSON.parse(recipeTemplate('mains/pasta')).$schema).toBe('../../../../schemas/recipe.schema.json')
    expect(JSON.parse(recipeTemplate('desserts')).$schema).toBe('../../../schemas/recipe.schema.json')
  })
})

describe('drinkTemplate', () => {
  it('passes the drink checks and points at the drink schema', () => {
    const drink = JSON.parse(drinkTemplate('cocktails'))

    expect(drinkFileSchema.safeParse(drink).success).toBe(true)
    expect(drink.$schema).toBe('../../../schemas/drink.schema.json')
  })
})
