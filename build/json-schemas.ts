import { z } from 'zod'
import { chapterFileSchema, dishFileSchema, drinkFileSchema, techniqueFileSchema } from '../src/lib/recipe-file.ts'

/**
 * JSON Schema files so editors autocomplete and check recipe.json, chapter.json and techniques.json while typing. A
 * dish's recipe.json points at recipe.schema.json, a drink's at drink.schema.json.
 */

export function recipeJsonSchema(): string {
  return toJsonText(dishFileSchema, 'Cookbook recipe')
}

export function drinkJsonSchema(): string {
  return toJsonText(drinkFileSchema, 'Cookbook drink')
}

export function chapterJsonSchema(): string {
  return toJsonText(chapterFileSchema, 'Cookbook chapter')
}

export function techniqueJsonSchema(): string {
  return toJsonText(techniqueFileSchema, 'Cookbook techniques')
}

function toJsonText(schema: z.ZodType, title: string): string {
  const jsonSchema = z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' })
  return JSON.stringify({ ...jsonSchema, title }, null, 2) + '\n'
}
