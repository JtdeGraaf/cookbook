import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { z } from 'zod'
import type { Book, Chapter, Picture, Recipe, Step } from '../src/lib/book.ts'
import { CHAPTER_COLORS, RESERVED_CHAPTER_NAMES, type ChapterColor } from '../src/lib/recipe-rules.ts'
import {
  chapterFileSchema,
  findCrossReferenceProblems,
  listImageFiles,
  recipeFileSchema,
  slugSchema,
  type ChapterFile,
  type RecipeFile,
} from '../src/lib/recipe-file.ts'

/** Absolute path of an image on disk; the Vite plugin turns it into an optimized image import. */
export type ImagePath = string

export class RecipeFolderError extends Error {
  readonly problems: string[]

  constructor(problems: string[]) {
    super(`The recipes folder has ${problems.length} problem(s):\n\n${problems.map((p) => `- ${p}`).join('\n')}`)
    this.problems = problems
  }
}

/** Reads and checks every chapter and recipe under `root`. Throws one error listing every problem found. */
export function readRecipeFolder(root: string): Book<ImagePath> {
  const problems: string[] = []
  const chapters: (Omit<Chapter<ImagePath>, 'color'> & { color: ChapterColor | null; order: number | null })[] = []

  for (const chapterSlug of listFolders(root)) {
    const chapterFolder = join(root, chapterSlug)
    const where = relative(root, chapterFolder)
    if (!slugSchema.safeParse(chapterSlug).success) {
      problems.push(`${where}: folder name must be lowercase letters, digits and dashes.`)
      continue
    }
    if ((RESERVED_CHAPTER_NAMES as readonly string[]).includes(chapterSlug)) {
      problems.push(`${where}: "${chapterSlug}" is taken by a page of the app; pick another chapter name.`)
      continue
    }

    const chapterFile = readChapterFile(chapterFolder, root, problems)
    const recipeFolders = listFolders(chapterFolder)
    if (recipeFolders.length === 0) problems.push(`${where}: chapter has no recipes.`)
    const recipes = recipeFolders.flatMap((recipeSlug) => {
      const recipe = readRecipe(join(chapterFolder, recipeSlug), chapterSlug, recipeSlug, root, problems)
      return recipe ? [recipe] : []
    })

    chapters.push({
      slug: chapterSlug,
      title: chapterFile?.title ?? { en: titleFromSlug(chapterSlug), nl: titleFromSlug(chapterSlug) },
      intro: chapterFile?.intro ?? null,
      color: chapterFile?.color ?? null,
      order: chapterFile?.order ?? null,
      recipes,
    })
  }

  if (chapters.length === 0) problems.push('No chapters found. Add a folder like recipes/mains/my-recipe/recipe.json.')
  if (problems.length > 0) throw new RecipeFolderError(problems)

  // Chapters without a colour take the next one in line, by their place in the book.
  return {
    chapters: sortChapters(chapters).map(({ order: _order, color, ...chapter }, index) => ({
      ...chapter,
      color: color ?? CHAPTER_COLORS[index % CHAPTER_COLORS.length],
    })),
  }
}

function readChapterFile(chapterFolder: string, root: string, problems: string[]): ChapterFile | null {
  const path = join(chapterFolder, 'chapter.json')
  if (!existsSync(path)) return null
  return parseJsonFile(path, chapterFileSchema, root, problems)
}

function readRecipe(
  folder: string,
  chapterSlug: string,
  recipeSlug: string,
  root: string,
  problems: string[],
): Recipe<ImagePath> | null {
  const where = relative(root, folder)
  if (!slugSchema.safeParse(recipeSlug).success) {
    problems.push(`${where}: folder name must be lowercase letters, digits and dashes.`)
    return null
  }
  const path = join(folder, 'recipe.json')
  if (!existsSync(path)) {
    problems.push(`${where}: missing recipe.json.`)
    return null
  }
  const file = parseJsonFile(path, recipeFileSchema, root, problems)
  if (!file) return null

  const fileProblems = [
    ...findCrossReferenceProblems(file),
    ...listImageFiles(file)
      .filter((image) => !existsSync(join(folder, image)))
      .map((image) => `image "${image}" not found next to recipe.json.`),
  ]
  if (fileProblems.length > 0) {
    problems.push(...fileProblems.map((problem) => `${relative(root, path)}: ${problem}`))
    return null
  }
  return toRecipe(file, folder, chapterSlug, recipeSlug)
}

function toRecipe(file: RecipeFile, folder: string, chapterSlug: string, recipeSlug: string): Recipe<ImagePath> {
  const toPicture = (image: RecipeFile['cover']): Picture<ImagePath> => ({
    file: join(folder, image.file),
    alt: image.alt,
    credit: image.credit ?? null,
  })
  const toStep = (step: RecipeFile['cook'][number]): Step<ImagePath> => ({
    text: step.text,
    ingredientIds: step.ingredients ?? [],
    timer: step.timer ?? null,
    tip: step.tip ?? null,
    image: step.image ? toPicture(step.image) : null,
  })
  return {
    slug: recipeSlug,
    chapterSlug,
    title: file.title,
    summary: file.summary,
    servings: file.servings,
    prepMinutes: file.prepMinutes,
    cookMinutes: file.cookMinutes,
    tags: file.tags ?? [],
    cover: toPicture(file.cover),
    ingredients: file.ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      quantity:
        ingredient.amount !== undefined && ingredient.unit !== undefined
          ? { amount: ingredient.amount, unit: ingredient.unit }
          : null,
      note: ingredient.note ?? null,
    })),
    prep: file.prep.map(toStep),
    cook: file.cook.map(toStep),
  }
}

function parseJsonFile<T>(path: string, schema: z.ZodType<T>, root: string, problems: string[]): T | null {
  const where = relative(root, path)
  let json: unknown
  try {
    json = JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    problems.push(`${where}: not valid JSON (${(error as Error).message}).`)
    return null
  }
  const result = schema.safeParse(json)
  if (!result.success) {
    problems.push(`${where}:\n${indent(z.prettifyError(result.error))}`)
    return null
  }
  return result.data
}

/** Chapters with an order come first, low to high; the rest follow by folder name. */
function sortChapters<T extends { slug: string; order: number | null }>(chapters: T[]): T[] {
  return [...chapters].sort((a, b) => {
    if (a.order !== null && b.order !== null) return a.order - b.order
    if (a.order !== null) return -1
    if (b.order !== null) return 1
    return a.slug.localeCompare(b.slug)
  })
}

function listFolders(path: string): string[] {
  return readdirSync(path)
    .filter((name) => statSync(join(path, name)).isDirectory())
    .sort()
}

function titleFromSlug(slug: string): string {
  const words = slug.replace(/-/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function indent(text: string): string {
  return text
    .split('\n')
    .map((line) => `    ${line}`)
    .join('\n')
}
