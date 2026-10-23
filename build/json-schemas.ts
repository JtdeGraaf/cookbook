import { z } from 'zod'
import { chapterFileSchema, recipeFileSchema } from '../src/lib/recipe-file.ts'

/** JSON Schema files so editors autocomplete and check recipe.json and chapter.json while typing. */

export function recipeJsonSchema(): string {
  return toJsonText(recipeFileSchema, 'Cookbook recipe')
}

export function chapterJsonSchema(): string {
  return toJsonText(chapterFileSchema, 'Cookbook chapter')
}

function toJsonText(schema: z.ZodType, title: string): string {
  const jsonSchema = z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' })
  return JSON.stringify({ ...jsonSchema, title }, null, 2) + '\n'
}
