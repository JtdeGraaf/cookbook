import { z } from 'zod'
import {
  CHAPTER_COLORS,
  DRINK_METHODS,
  GLASSES,
  ICE_KINDS,
  LANGUAGES,
  MAX_SERVINGS,
  MIN_SERVINGS,
  UNITS,
} from './recipe-rules.ts'
import { splitTechniqueMarks, techniqueIds } from './technique-marks.ts'

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

export const recipeSourceSchema = z
  .strictObject({
    url: z.url({ protocol: /^https?$/ }).describe('Web address of the original recipe.'),
    name: text.optional().describe('Who or where it is from, like "Albert Heijn". Leave out to show the website name.'),
  })
  .describe("Where this recipe comes from, if it is based on someone else's.")

const ingredientFields = {
  id: slugSchema.describe('Short name that steps use to point at this ingredient, like "eggs".'),
  name: localizedTextSchema.describe('For things you count, the name of one, like "egg".'),
  plural: localizedTextSchema
    .optional()
    .describe('The name for more than one, like "eggs". Leave out when the name never changes, like "garlic".'),
  amount: z.number().positive().optional().describe('Leave out together with unit for "to taste".'),
  unit: z.enum(UNITS).optional(),
  note: localizedTextSchema.optional().describe('Extra detail shown after the name, like "at room temperature".'),
  pantry: z
    .boolean()
    .optional()
    .describe('A kitchen staple you always have, like salt or water. Left off the shopping list.'),
  bottle: z
    .boolean()
    .optional()
    .describe('Bought by the bottle, like gin or white wine. The shopping list asks for a bottle, not an amount.'),
}

const AMOUNT_AND_UNIT_TOGETHER = {
  message: 'Give amount and unit together, or leave both out for "to taste".',
}

function hasAmountAndUnitTogether(ingredient: { amount?: number; unit?: string }): boolean {
  return (ingredient.amount === undefined) === (ingredient.unit === undefined)
}

export const ingredientSchema = z.strictObject(ingredientFields).refine(hasAmountAndUnitTogether, AMOUNT_AND_UNIT_TOGETHER)

export const drinkIngredientSchema = z
  .strictObject({
    ...ingredientFields,
    garnish: z.boolean().optional().describe('Goes on the drink at the end, like a lime wedge. Listed apart.'),
  })
  .refine(hasAmountAndUnitTogether, AMOUNT_AND_UNIT_TOGETHER)

export const timerSchema = z.strictObject({
  minutes: z.number().positive().max(24 * 60),
  label: localizedTextSchema.describe('Short name shown on the running timer, like "Simmer sauce".'),
})

export const stepSchema = z.strictObject({
  text: localizedTextSchema.describe(
    'Mark a cooking term with [[words|technique-id]], like "[[chop it finely|chop-finely]]", to explain it from techniques.json.',
  ),
  ingredients: z.array(slugSchema).optional().describe('Ids of the ingredients this step uses.'),
  timer: timerSchema.optional(),
  tip: localizedTextSchema.optional().describe('A short extra hint, shown as a "Point".'),
  image: imageSchema.optional(),
})

/** Drinks are made in one go, so their steps have no timers. */
export const drinkStepSchema = stepSchema.omit({ timer: true })

export const dishFileSchema = z
  .strictObject({
    $schema: z.string().optional(),
    title: localizedTextSchema,
    summary: localizedTextSchema,
    servings: z.number().int().min(MIN_SERVINGS).max(MAX_SERVINGS).describe('How many people the amounts are written for.'),
    prepMinutes: z.number().int().min(0),
    cookMinutes: z.number().int().min(0),
    tags: z.array(localizedTextSchema).optional(),
    cover: imageSchema.optional().describe('The main photo. Leave out until you have one.'),
    source: recipeSourceSchema.optional(),
    ingredients: z.array(ingredientSchema).min(1),
    prep: z
      .array(stepSchema)
      .min(1)
      .describe('Mise en place: everything to do before anything goes on the heat.'),
    cook: z.array(stepSchema).min(1).describe('The cooking steps, done one at a time after all prep.'),
  })
  .describe('One dish. The folders it sits in are its chapter and sections.')

export const drinkFileSchema = z
  .strictObject({
    $schema: z.string().optional(),
    kind: z.literal('drink'),
    title: localizedTextSchema,
    summary: localizedTextSchema,
    servings: z.number().int().min(MIN_SERVINGS).max(MAX_SERVINGS).describe('How many drinks the amounts are written for.'),
    tags: z.array(localizedTextSchema).optional(),
    cover: imageSchema.optional().describe('The main photo. Leave out until you have one.'),
    source: recipeSourceSchema.optional(),
    method: z.enum(DRINK_METHODS),
    glass: z.enum(GLASSES),
    ice: z.enum(ICE_KINDS).describe('What goes in the glass with the drink; "none" for a drink served up.'),
    ingredients: z.array(drinkIngredientSchema).min(1),
    steps: z
      .array(drinkStepSchema)
      .min(1)
      .describe('Everything from chilling the glass to the garnish, read on one page.'),
  })
  .describe('One drink. The folders it sits in are its chapter and sections.')

export const chapterFileSchema = z
  .strictObject({
    $schema: z.string().optional(),
    title: localizedTextSchema,
    intro: localizedTextSchema.optional(),
    order: z.number().int().describe('Folders are sorted by this number, low first.'),
    color: z.enum(CHAPTER_COLORS).optional().describe('Colour of the chapter tab. Sections use their chapter colour unless given.'),
  })
  .describe('Optional details for a chapter or section folder.')

export const techniqueSchema = z.strictObject({
  name: localizedTextSchema.describe('The technique as a short heading, like "Chop finely".'),
  explanation: localizedTextSchema.describe('How to do it, in one to three short sentences.'),
})

export const techniqueFileSchema = z
  .object({ $schema: z.string().optional() })
  .catchall(techniqueSchema)
  .superRefine((file, context) => {
    for (const id of Object.keys(file)) {
      if (id === '$schema' || slugSchema.safeParse(id).success) continue
      context.addIssue({ code: 'custom', path: [id], message: 'Technique ids use lowercase letters, digits and single dashes, like "chop-finely".' })
    }
  })
  .describe('Cooking techniques that steps explain behind an (i) button, by id.')

export type DishFile = z.infer<typeof dishFileSchema>
export type DrinkFile = z.infer<typeof drinkFileSchema>
export type RecipeFile = DishFile | DrinkFile
export type ChapterFile = z.infer<typeof chapterFileSchema>
export type TechniqueFile = z.infer<typeof techniqueFileSchema>

/**
 * Mistakes the schema cannot see: steps pointing at ingredients or techniques that don't exist, duplicate ids, broken
 * technique marks, and English and Dutch text explaining different techniques.
 */
export function findCrossReferenceProblems(recipe: RecipeFile, knownTechniqueIds: ReadonlySet<string>): string[] {
  const problems: string[] = []
  const ingredientIds = recipe.ingredients.map((ingredient) => ingredient.id)
  const seen = new Set<string>()
  for (const id of ingredientIds) {
    if (seen.has(id)) problems.push(`Ingredient id "${id}" is used twice.`)
    seen.add(id)
  }
  for (const [stepName, steps] of stepsByPhase(recipe)) {
    steps.forEach((step, index) => {
      for (const id of step.ingredients ?? []) {
        if (!seen.has(id)) problems.push(`${stepName} ${index + 1} uses unknown ingredient "${id}".`)
      }
      problems.push(...findTechniqueProblems(step.text, knownTechniqueIds).map((problem) => `${stepName} ${index + 1} ${problem}`))
    })
  }
  return problems
}

type StepFile = DishFile['cook'][number] | DrinkFile['steps'][number]

/** A dish's prep and cook steps, or a drink's one list, each with what a problem calls one of its steps. */
function stepsByPhase(recipe: RecipeFile): [string, StepFile[]][] {
  if ('kind' in recipe) return [['step', recipe.steps]]
  return [
    ['prep step', recipe.prep],
    ['cook step', recipe.cook],
  ]
}

function findTechniqueProblems(text: StepFile['text'], knownTechniqueIds: ReadonlySet<string>): string[] {
  const problems: string[] = []
  const idsByLanguage = LANGUAGES.map((language) => {
    const pieces = splitTechniqueMarks(text[language])
    if (!pieces) {
      problems.push(`(${language}) has a broken technique mark; write it as [[words|technique-id]].`)
      return null
    }
    const ids = techniqueIds(pieces)
    for (const id of ids.filter((id) => !knownTechniqueIds.has(id))) {
      problems.push(`(${language}) uses unknown technique "${id}"; add it to recipes/techniques.json.`)
    }
    return ids
  })
  const [english, dutch] = idsByLanguage
  if (english && dutch && [...english].sort().join() !== [...dutch].sort().join()) {
    problems.push(`marks different techniques in English (${english.join(', ') || 'none'}) and Dutch (${dutch.join(', ') || 'none'}).`)
  }
  return problems
}

/** Every image file a recipe points at, cover first. */
export function listImageFiles(recipe: RecipeFile): string[] {
  const steps = stepsByPhase(recipe).flatMap(([, phaseSteps]) => phaseSteps)
  const stepImages = steps.flatMap((step) => (step.image ? [step.image.file] : []))
  return recipe.cover ? [recipe.cover.file, ...stepImages] : stepImages
}
