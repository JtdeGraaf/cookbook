import { z } from 'zod'
import { CHAPTER_COLORS, MAX_SERVINGS, MIN_SERVINGS, UNITS } from './recipe-rules.ts'

/** The shape of the hand-written JSON files under `recipes/`. Unknown keys are errors, so typos fail the build. */

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const slugSchema = z.string().regex(SLUG_PATTERN, 'Use lowercase letters, digits and single dashes, like "kale-stamppot".')

const text = z.string().trim().min(1)

export const localizedTextSchema = z
  .strictObject({ en: text, nl: text })
  .describe('The same text in English and Dutch.')

const imageFileName = z
  .string()
  .regex(/^[\w-]+\.(jpe?g|png|webp)$/i, 'An image file next to recipe.json, like "cover.jpg".')

export const creditSchema = z
  .strictObject({
    author: text,
    license: text.describe('Short licence name, like "CC BY-SA 4.0".'),
    source: z.url().describe('Where the image comes from.'),
  })
  .describe('Who made the photo. Required by most free licences.')

export const imageSchema = z.strictObject({
  file: imageFileName,
  alt: localizedTextSchema.describe('What the photo shows, for people who cannot see it.'),
  credit: creditSchema.optional().describe('Leave out for your own photos.'),
})

export const ingredientSchema = z
  .strictObject({
    id: slugSchema.describe('Short name that steps use to point at this ingredient, like "eggs".'),
    name: localizedTextSchema,
    amount: z.number().positive().optional().describe('Leave out together with unit for "to taste".'),
    unit: z.enum(UNITS).optional(),
    note: localizedTextSchema.optional().describe('Extra detail shown after the name, like "at room temperature".'),
    pantry: z
      .boolean()
      .optional()
      .describe('A kitchen staple you always have, like salt or water. Left off the shopping list.'),
  })
  .refine((ingredient) => (ingredient.amount === undefined) === (ingredient.unit === undefined), {
    message: 'Give amount and unit together, or leave both out for "to taste".',
  })

export const timerSchema = z.strictObject({
  minutes: z.number().positive().max(24 * 60),
  label: localizedTextSchema.describe('Short name shown on the running timer, like "Simmer sauce".'),
})

export const stepSchema = z.strictObject({
  text: localizedTextSchema,
  ingredients: z.array(slugSchema).optional().describe('Ids of the ingredients this step uses.'),
  timer: timerSchema.optional(),
  tip: localizedTextSchema.optional().describe('A short extra hint, shown as a "Point".'),
  image: imageSchema.optional(),
})

export const recipeFileSchema = z
  .strictObject({
    $schema: z.string().optional(),
    title: localizedTextSchema,
    summary: localizedTextSchema,
    servings: z.number().int().min(MIN_SERVINGS).max(MAX_SERVINGS).describe('How many people the amounts are written for.'),
    prepMinutes: z.number().int().min(0),
    cookMinutes: z.number().int().min(0),
    tags: z.array(localizedTextSchema).optional(),
    cover: imageSchema.optional().describe('The main photo. Leave out until you have one.'),
    ingredients: z.array(ingredientSchema).min(1),
    prep: z
      .array(stepSchema)
      .min(1)
      .describe('Mise en place: everything to do before anything goes on the heat.'),
    cook: z.array(stepSchema).min(1).describe('The cooking steps, done one at a time after all prep.'),
  })
  .describe('One recipe. The folders it sits in are its chapter and sections.')

export const chapterFileSchema = z
  .strictObject({
    $schema: z.string().optional(),
    title: localizedTextSchema,
    intro: localizedTextSchema.optional(),
    order: z.number().int().describe('Folders are sorted by this number, low first.'),
    color: z.enum(CHAPTER_COLORS).optional().describe('Colour of the chapter tab. Sections use their chapter colour unless given.'),
  })
  .describe('Optional details for a chapter or section folder.')

export type RecipeFile = z.infer<typeof recipeFileSchema>
export type ChapterFile = z.infer<typeof chapterFileSchema>

/** Mistakes the schema cannot see: steps pointing at ingredients that don't exist, duplicate ids. */
export function findCrossReferenceProblems(recipe: RecipeFile): string[] {
  const problems: string[] = []
  const ingredientIds = recipe.ingredients.map((ingredient) => ingredient.id)
  const seen = new Set<string>()
  for (const id of ingredientIds) {
    if (seen.has(id)) problems.push(`Ingredient id "${id}" is used twice.`)
    seen.add(id)
  }
  const phases = [
    ['prep', recipe.prep],
    ['cook', recipe.cook],
  ] as const
  for (const [phase, steps] of phases) {
    steps.forEach((step, index) => {
      for (const id of step.ingredients ?? []) {
        if (!seen.has(id)) problems.push(`${phase} step ${index + 1} uses unknown ingredient "${id}".`)
      }
    })
  }
  return problems
}

/** Every image file a recipe points at, cover first. */
export function listImageFiles(recipe: RecipeFile): string[] {
  const stepImages = [...recipe.prep, ...recipe.cook].flatMap((step) => (step.image ? [step.image.file] : []))
  return recipe.cover ? [recipe.cover.file, ...stepImages] : stepImages
}
