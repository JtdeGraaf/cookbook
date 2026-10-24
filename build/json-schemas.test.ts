import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { chapterJsonSchema, recipeJsonSchema, techniqueJsonSchema } from './json-schemas.ts'

describe('committed JSON Schemas', () => {
  it('match the recipe file schema; run `npm run schemas` if this fails', () => {
    expect(readFileSync('schemas/recipe.schema.json', 'utf8')).toBe(recipeJsonSchema())
    expect(readFileSync('schemas/chapter.schema.json', 'utf8')).toBe(chapterJsonSchema())
    expect(readFileSync('schemas/techniques.schema.json', 'utf8')).toBe(techniqueJsonSchema())
  })
})
