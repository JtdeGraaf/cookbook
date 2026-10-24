import { describe, expect, it } from 'vitest'
import { recipeFileSchema } from './recipe-file'
import { recipeTemplate } from './recipe-template'

describe('recipeTemplate', () => {
  it('passes the recipe checks, so the site keeps building while it is filled in', () => {
    expect(recipeFileSchema.safeParse(JSON.parse(recipeTemplate('mains/pasta'))).success).toBe(true)
  })

  it('points $schema back up to the repository root', () => {
    expect(JSON.parse(recipeTemplate('mains/pasta')).$schema).toBe('../../../../schemas/recipe.schema.json')
    expect(JSON.parse(recipeTemplate('desserts')).$schema).toBe('../../../schemas/recipe.schema.json')
  })
})
