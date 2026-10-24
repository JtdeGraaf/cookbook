import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { z } from 'zod'
import type { Book, Folder, Picture, Recipe, Step } from '../src/lib/book.ts'
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

/** A folder as read from disk, before colours are handed down from the chapter. */
type FolderOnDisk = Omit<Folder<ImagePath>, 'color' | 'folders' | 'recipes'> & {
  color: ChapterColor | null
  order: number | null
  folders: FolderOnDisk[]
  recipes: Omit<Recipe<ImagePath>, 'color'>[]
}

/**
 * Reads and checks every folder and recipe under `root`. A folder with a recipe.json is a recipe; any other folder
 * holds recipes or more folders. Throws one error listing every problem found.
 */
export function readRecipeFolder(root: string): Book<ImagePath> {
  const problems: string[] = []
  const chapters = listFolders(root).flatMap((slug) => {
    if ((RESERVED_CHAPTER_NAMES as readonly string[]).includes(slug)) {
      problems.push(`${slug}: "${slug}" is taken by a page of the app; pick another chapter name.`)
      return []
    }
    const chapter = readFolder(join(root, slug), slug, root, problems)
    return chapter ? [chapter] : []
  })

  if (chapters.length === 0 && problems.length === 0) {
    problems.push('No chapters found. Add a folder like recipes/mains/my-recipe/recipe.json.')
  }
  if (problems.length > 0) throw new RecipeFolderError(problems)

  // Chapters without a colour take the next one in line, by their place in the book.
  return {
    chapters: sortFolders(chapters).map((chapter, index) =>
      handDownColor(chapter, CHAPTER_COLORS[index % CHAPTER_COLORS.length]),
    ),
  }
}

function readFolder(absolutePath: string, path: string, root: string, problems: string[]): FolderOnDisk | null {
  const slug = path.split('/').at(-1) ?? path
  if (!slugSchema.safeParse(slug).success) {
    problems.push(`${path}: folder name must be lowercase letters, digits and dashes.`)
    return null
  }

  const children = listFolders(absolutePath)
  if (children.length === 0) {
    problems.push(`${path}: folder has no recipes.`)
    return null
  }

  const folderFile = readFolderFile(absolutePath, root, problems)
  const folders: FolderOnDisk[] = []
  const recipes: Omit<Recipe<ImagePath>, 'color'>[] = []
  for (const child of children) {
    const childPath = `${path}/${child}`
    const childAbsolutePath = join(absolutePath, child)
    if (!existsSync(join(childAbsolutePath, 'recipe.json'))) {
      const folder = readFolder(childAbsolutePath, childPath, root, problems)
      if (folder) folders.push(folder)
      continue
    }
    const recipe = readRecipe(childAbsolutePath, childPath, path, root, problems)
    if (recipe) recipes.push(recipe)
  }

  return {
    slug,
    path,
    title: folderFile?.title ?? { en: titleFromSlug(slug), nl: titleFromSlug(slug) },
    intro: folderFile?.intro ?? null,
    color: folderFile?.color ?? null,
    order: folderFile?.order ?? null,
    folders: sortFolders(folders),
    recipes,
  }
}

/** Folders without their own colour use the colour of the folder they sit in. */
function handDownColor(folder: FolderOnDisk, inherited: ChapterColor): Folder<ImagePath> {
  const color = folder.color ?? inherited
  return {
    slug: folder.slug,
    path: folder.path,
    title: folder.title,
    intro: folder.intro,
    color,
    folders: folder.folders.map((child) => handDownColor(child, color)),
    recipes: folder.recipes.map((recipe) => ({ ...recipe, color })),
  }
}

function readFolderFile(folder: string, root: string, problems: string[]): ChapterFile | null {
  const path = join(folder, 'chapter.json')
  if (!existsSync(path)) return null
  return parseJsonFile(path, chapterFileSchema, root, problems)
}

function readRecipe(
  folder: string,
  path: string,
  folderPath: string,
  root: string,
  problems: string[],
): Omit<Recipe<ImagePath>, 'color'> | null {
  const slug = path.split('/').at(-1) ?? path
  if (!slugSchema.safeParse(slug).success) {
    problems.push(`${path}: folder name must be lowercase letters, digits and dashes.`)
    return null
  }
  if (listFolders(folder).length > 0) {
    problems.push(`${path}: a recipe folder cannot hold other folders; move them next to it.`)
    return null
  }
  const filePath = join(folder, 'recipe.json')
  const file = parseJsonFile(filePath, recipeFileSchema, root, problems)
  if (!file) return null

  const fileProblems = [
    ...findCrossReferenceProblems(file),
    ...listImageFiles(file)
      .filter((image) => !existsSync(join(folder, image)))
      .map((image) => `image "${image}" not found next to recipe.json.`),
  ]
  if (fileProblems.length > 0) {
    problems.push(...fileProblems.map((problem) => `${relative(root, filePath)}: ${problem}`))
    return null
  }
  return toRecipe(file, folder, slug, path, folderPath)
}

function toRecipe(
  file: RecipeFile,
  folder: string,
  slug: string,
  path: string,
  folderPath: string,
): Omit<Recipe<ImagePath>, 'color'> {
  const toPicture = (image: NonNullable<RecipeFile['cover']>): Picture<ImagePath> => ({
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
    slug,
    path,
    folderPath,
    title: file.title,
    summary: file.summary,
    servings: file.servings,
    prepMinutes: file.prepMinutes,
    cookMinutes: file.cookMinutes,
    tags: file.tags ?? [],
    cover: file.cover ? toPicture(file.cover) : null,
    ingredients: file.ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      // Leaving it out means the name is the same for any amount, like "garlic".
      plural: ingredient.plural ?? null,
      quantity:
        ingredient.amount !== undefined && ingredient.unit !== undefined
          ? { amount: ingredient.amount, unit: ingredient.unit }
          : null,
      note: ingredient.note ?? null,
      // Leaving the flag out means it is a normal ingredient to buy.
      pantry: ingredient.pantry ?? false,
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

/** Folders with an order come first, low to high; the rest follow by folder name. */
function sortFolders<T extends { slug: string; order: number | null }>(folders: T[]): T[] {
  return [...folders].sort((a, b) => {
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
