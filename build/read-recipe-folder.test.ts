import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { RecipeFolderError, readRecipeFolder } from './read-recipe-folder.ts'

const both = (text: string) => ({ en: text, nl: text })

function validRecipe(): Record<string, unknown> {
  return {
    title: both('Toast'),
    summary: both('Bread, but hot.'),
    servings: 1,
    prepMinutes: 1,
    cookMinutes: 3,
    cover: { file: 'cover.jpg', alt: both('Toast') },
    ingredients: [{ id: 'bread', name: both('bread'), amount: 1, unit: 'slice' }],
    prep: [{ text: both('Take out the bread.'), ingredients: ['bread'] }],
    cook: [{ text: both('Toast it.'), timer: { minutes: 3, label: both('Toast') } }],
  }
}

let root: string

function addRecipe(chapter: string, slug: string, recipe: unknown, images: string[] = ['cover.jpg']) {
  const folder = join(root, chapter, slug)
  mkdirSync(folder, { recursive: true })
  writeFileSync(join(folder, 'recipe.json'), JSON.stringify(recipe))
  for (const image of images) writeFileSync(join(folder, image), '')
}

function problems(): string[] {
  try {
    readRecipeFolder(root)
  } catch (error) {
    if (error instanceof RecipeFolderError) return error.problems
    throw error
  }
  return []
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'recipes-'))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

describe('readRecipeFolder', () => {
  it('reads every recipe in the real recipes folder', () => {
    const book = readRecipeFolder('recipes')

    expect(book.chapters.map((chapter) => chapter.slug)).toEqual(['breakfast', 'mains', 'desserts'])
    expect(book.chapters.flatMap((chapter) => chapter.recipes).length).toBeGreaterThanOrEqual(3)
  })

  it('takes the chapter from the folder the recipe sits in', () => {
    addRecipe('quick-bites', 'toast', validRecipe())

    const [chapter] = readRecipeFolder(root).chapters

    expect(chapter.slug).toBe('quick-bites')
    expect(chapter.title).toEqual({ en: 'Quick bites', nl: 'Quick bites' })
    expect(chapter.recipes[0].chapterSlug).toBe('quick-bites')
  })

  it('uses chapter.json for title and order', () => {
    addRecipe('b-chapter', 'toast', validRecipe())
    addRecipe('a-chapter', 'toast', validRecipe())
    writeFileSync(
      join(root, 'b-chapter', 'chapter.json'),
      JSON.stringify({ title: { en: 'Starters', nl: 'Voorgerechten' }, order: 1, color: 'sea' }),
    )

    const chapters = readRecipeFolder(root).chapters

    expect(chapters.map((chapter) => [chapter.slug, chapter.title.nl, chapter.color])).toEqual([
      ['b-chapter', 'Voorgerechten', 'sea'],
      ['a-chapter', 'A chapter', 'matcha'],
    ])
  })

  it('turns missing optional fields into null or empty lists', () => {
    addRecipe('mains', 'toast', validRecipe())

    const recipe = readRecipeFolder(root).chapters[0].recipes[0]

    expect(recipe.tags).toEqual([])
    expect(recipe.cover.credit).toBeNull()
    expect(recipe.cook[0]).toMatchObject({ ingredientIds: [], tip: null, image: null })
  })

  it('rejects a misspelt field', () => {
    addRecipe('mains', 'toast', { ...validRecipe(), sevings: 2 })

    expect(problems()).toHaveLength(1)
    expect(problems()[0]).toContain('sevings')
  })

  it('rejects text that is missing its Dutch version', () => {
    addRecipe('mains', 'toast', { ...validRecipe(), title: { en: 'Toast' } })

    expect(problems()[0]).toContain('title.nl')
  })

  it('rejects an amount without a unit', () => {
    addRecipe('mains', 'toast', { ...validRecipe(), ingredients: [{ id: 'bread', name: both('bread'), amount: 1 }] })

    expect(problems()[0]).toContain('Give amount and unit together')
  })

  it('rejects a recipe without prep steps', () => {
    addRecipe('mains', 'toast', { ...validRecipe(), prep: [] })

    expect(problems()[0]).toContain('prep')
  })

  it('rejects a step that uses an unknown ingredient', () => {
    addRecipe('mains', 'toast', {
      ...validRecipe(),
      cook: [{ text: both('Butter it.'), ingredients: ['butter'] }],
    })

    expect(problems()).toEqual([`${join('mains', 'toast', 'recipe.json')}: cook step 1 uses unknown ingredient "butter".`])
  })

  it('rejects an image that is not in the folder', () => {
    addRecipe('mains', 'toast', validRecipe(), [])

    expect(problems()).toEqual([`${join('mains', 'toast', 'recipe.json')}: image "cover.jpg" not found next to recipe.json.`])
  })

  it('rejects a recipe folder without recipe.json', () => {
    addRecipe('mains', 'toast', validRecipe())
    mkdirSync(join(root, 'mains', 'empty'))

    expect(problems()).toEqual([`${join('mains', 'empty')}: missing recipe.json.`])
  })

  it('rejects a chapter named after a page of the app', () => {
    addRecipe('search', 'toast', validRecipe())

    expect(problems()[0]).toContain('"search" is taken')
  })

  it('lists every problem at once', () => {
    addRecipe('mains', 'toast', { ...validRecipe(), servings: 0 })
    addRecipe('mains', 'jam', validRecipe(), [])

    expect(problems()).toHaveLength(2)
  })
})
