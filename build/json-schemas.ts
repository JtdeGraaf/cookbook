import { z } from 'zod'
import { chapterFileSchema, recipeFileSchema, techniqueFileSchema } from '../src/lib/recipe-file.ts'

/** JSON Schema files so editors autocomplete and check recipe.json, chapter.json and techniques.json while typing. */

export function recipeJsonSchema(): string {
  return toJsonText(recipeFileSchema, 'Cookbook recipe')
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
