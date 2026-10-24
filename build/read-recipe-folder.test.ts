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

const toastTechnique = { name: { en: 'Toast', nl: 'Roosteren' }, explanation: both('Brown it in the toaster.') }

/** A recipe whose only cooking step has this text. */
function recipeWithCookText(en: string, nl: string): Record<string, unknown> {
  return { ...validRecipe(), cook: [{ text: { en, nl } }] }
}

let root: string

function addTechniques(techniques: unknown) {
  writeFileSync(join(root, 'techniques.json'), JSON.stringify(techniques))
}

function addRecipe(folder: string, slug: string, recipe: unknown, images: string[] = ['cover.jpg']) {
  const recipeFolder = join(root, folder, slug)
  mkdirSync(recipeFolder, { recursive: true })
  writeFileSync(join(recipeFolder, 'recipe.json'), JSON.stringify(recipe))
  for (const image of images) writeFileSync(join(recipeFolder, image), '')
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

    expect(book.chapters.map((chapter) => chapter.slug)).toContain('mains')
    expect(book.chapters.flatMap((chapter) => chapter.recipes).length).toBeGreaterThanOrEqual(1)
  })

  it('takes the chapter from the folder the recipe sits in', () => {
    addRecipe('quick-bites', 'toast', validRecipe())

    const [chapter] = readRecipeFolder(root).chapters

    expect(chapter.slug).toBe('quick-bites')
    expect(chapter.title).toEqual({ en: 'Quick bites', nl: 'Quick bites' })
    expect(chapter.recipes[0]).toMatchObject({ path: 'quick-bites/toast', folderPath: 'quick-bites' })
  })

  it('reads folders inside chapters as sections, at any depth', () => {
    addRecipe('mains/pasta/fresh', 'tagliatelle', validRecipe())
    addRecipe('mains', 'stew', validRecipe())

    const [mains] = readRecipeFolder(root).chapters

    expect(mains.recipes.map((recipe) => recipe.path)).toEqual(['mains/stew'])
    expect(mains.folders[0].path).toBe('mains/pasta')
    expect(mains.folders[0].folders[0].recipes[0]).toMatchObject({
      path: 'mains/pasta/fresh/tagliatelle',
      folderPath: 'mains/pasta/fresh',
    })
  })

  it('gives sections and their recipes the colour of their chapter', () => {
    addRecipe('mains/pasta', 'carbonara', validRecipe())
    writeFileSync(join(root, 'mains', 'chapter.json'), JSON.stringify({ title: both('Mains'), order: 1, color: 'plum' }))

    const [mains] = readRecipeFolder(root).chapters

    expect(mains.folders[0].color).toBe('plum')
    expect(mains.folders[0].recipes[0].color).toBe('plum')
  })

  it('accepts a recipe without a cover photo', () => {
    const { cover: _cover, ...withoutCover } = validRecipe()
    addRecipe('mains', 'toast', withoutCover, [])

    expect(readRecipeFolder(root).chapters[0].recipes[0].cover).toBeNull()
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
    expect(recipe.source).toBeNull()
    expect(recipe.cover?.credit).toBeNull()
    expect(recipe.cook[0]).toMatchObject({ ingredientIds: [], tip: null, image: null })
    expect(recipe.ingredients[0]).toMatchObject({ plural: null, note: null, pantry: false })
  })

  it('reads the plural name of an ingredient', () => {
    const bread = { id: 'bread', name: both('slice of bread'), plural: both('slices of bread'), amount: 1, unit: 'piece' }
    addRecipe('mains', 'toast', { ...validRecipe(), ingredients: [bread] })

    expect(readRecipeFolder(root).chapters[0].recipes[0].ingredients[0].plural).toEqual(both('slices of bread'))
  })

  it('reads where the recipe comes from, with or without a name', () => {
    addRecipe('mains', 'toast', { ...validRecipe(), source: { url: 'https://example.com/toast', name: 'Grandma' } })
    addRecipe('mains', 'tea', { ...validRecipe(), source: { url: 'https://example.com/tea' } })

    const [tea, toast] = readRecipeFolder(root).chapters[0].recipes

    expect(toast.source).toEqual({ url: 'https://example.com/toast', name: 'Grandma' })
    expect(tea.source).toEqual({ url: 'https://example.com/tea', name: null })
  })

  it('rejects a source that is not a web address', () => {
    addRecipe('mains', 'toast', { ...validRecipe(), source: { url: 'grandma’s notebook' } })
    addRecipe('mains', 'tea', { ...validRecipe(), source: { url: 'javascript:alert(1)' } })

    expect(problems()).toHaveLength(2)
    expect(problems().every((problem) => problem.includes('source.url'))).toBe(true)
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

  it('rejects an empty folder', () => {
    addRecipe('mains', 'toast', validRecipe())
    mkdirSync(join(root, 'mains', 'empty'))

    expect(problems()).toEqual(['mains/empty: folder has no recipes.'])
  })

  it('rejects folders inside a recipe folder', () => {
    addRecipe('mains', 'toast', validRecipe())
    mkdirSync(join(root, 'mains', 'toast', 'photos'))

    expect(problems()).toEqual(['mains/toast: a recipe folder cannot hold other folders; move them next to it.'])
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

describe('readRecipeFolder with techniques', () => {
  const where = () => join('mains', 'toast', 'recipe.json')

  it('splits step text around marked techniques and keeps the plain words as text', () => {
    addTechniques({ toast: toastTechnique })
    addRecipe('mains', 'toast', recipeWithCookText('[[Toast|toast]] the bread.', 'Brood [[roosteren|toast]].'))

    const step = readRecipeFolder(root).chapters[0].recipes[0].cook[0]

    expect(step.text).toEqual({ en: 'Toast the bread.', nl: 'Brood roosteren.' })
    expect(step.pieces.en).toEqual([
      { kind: 'technique', text: 'Toast', technique: { id: 'toast', ...toastTechnique } },
      { kind: 'words', text: ' the bread.' },
    ])
  })

  it('rejects a technique that is not in techniques.json', () => {
    addTechniques({ toast: toastTechnique })
    addRecipe('mains', 'toast', recipeWithCookText('[[Grill|grill]] it.', '[[Grill|grill]] het.'))

    expect(problems()).toEqual([
      `${where()}: cook step 1 (en) uses unknown technique "grill"; add it to recipes/techniques.json.`,
      `${where()}: cook step 1 (nl) uses unknown technique "grill"; add it to recipes/techniques.json.`,
    ])
  })

  it('rejects any technique when there is no techniques.json', () => {
    addRecipe('mains', 'toast', recipeWithCookText('[[Toast|toast]] it.', 'Brood [[roosteren|toast]].'))

    expect(problems()).toHaveLength(2)
  })

  it('rejects English and Dutch text that mark different techniques', () => {
    addTechniques({ toast: toastTechnique })
    addRecipe('mains', 'toast', recipeWithCookText('[[Toast|toast]] it.', 'Rooster het brood.'))

    expect(problems()).toEqual([
      `${where()}: cook step 1 marks different techniques in English (toast) and Dutch (none).`,
    ])
  })

  it('rejects a broken mark', () => {
    addTechniques({ toast: toastTechnique })
    addRecipe('mains', 'toast', recipeWithCookText('[[Toast it.', 'Brood [[roosteren|toast]].'))

    expect(problems()).toEqual([
      `${where()}: cook step 1 (en) has a broken technique mark; write it as [[words|technique-id]].`,
    ])
  })

  it('rejects a technique id that is not a slug', () => {
    addTechniques({ 'Toast It': toastTechnique })
    addRecipe('mains', 'toast', validRecipe())

    expect(problems()[0]).toContain('Technique ids use lowercase letters')
  })

  it('rejects a technique without its Dutch explanation', () => {
    addTechniques({ toast: { ...toastTechnique, explanation: { en: 'Brown it.' } } })
    addRecipe('mains', 'toast', validRecipe())

    expect(problems()[0]).toContain('toast.explanation.nl')
  })
})
