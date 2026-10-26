import { describe, expect, it } from 'vitest'
import { both, makeBook, makeDrink, makeFolder, makeIngredient, makeRecipe, makeStep } from '@/test/fixtures'
import {
  allRecipes,
  findRecipe,
  folderTrail,
  hasSeveralChapters,
  nearestFolderOrRecipe,
  ingredientsForStep,
  numberPages,
  parentPaths,
  recipeViewPath,
  resolveBookPath,
  searchTermForMissingPage,
  splitGarnishes,
  techniquesInStep,
  type Technique,
} from './book'

const eggs = makeRecipe({ slug: 'eggs', folderPath: 'breakfast' })
const toast = makeRecipe({ slug: 'toast', folderPath: 'breakfast' })
const stew = makeRecipe({ slug: 'stew', folderPath: 'mains' })
const carbonara = makeRecipe({
  slug: 'carbonara',
  folderPath: 'mains/pasta',
  cook: [makeStep(), makeStep(), makeStep()],
})
const pasta = makeFolder({ path: 'mains/pasta', recipes: [carbonara] })
const book = makeBook([
  makeFolder({ path: 'breakfast', recipes: [eggs, toast] }),
  makeFolder({ path: 'mains', recipes: [stew], folders: [pasta] }),
])

describe('numberPages', () => {
  it('numbers pages like a printed book: folder opener, then two pages per recipe, then sections', () => {
    expect(Object.fromEntries(numberPages(book))).toEqual({
      breakfast: 2,
      'breakfast/eggs': 3,
      'breakfast/toast': 5,
      mains: 7,
      'mains/stew': 8,
      'mains/pasta': 10,
      'mains/pasta/carbonara': 11,
    })
  })
})

describe('finding things in the book', () => {
  it('finds recipes at any depth', () => {
    expect(findRecipe(book, 'mains/pasta/carbonara')?.slug).toBe('carbonara')
    expect(findRecipe(book, 'breakfast/carbonara')).toBeNull()
  })

  it('lists every recipe in book order, sections after their folder', () => {
    expect(allRecipes(book).map((recipe) => recipe.path)).toEqual([
      'breakfast/eggs',
      'breakfast/toast',
      'mains/stew',
      'mains/pasta/carbonara',
    ])
  })

  it('gives the folders from the chapter down for a path bar', () => {
    expect(folderTrail(book, 'mains/pasta').map((folder) => folder.path)).toEqual(['mains', 'mains/pasta'])
  })

  it('finds the deepest folder that exists on the way to a missing page', () => {
    expect(nearestFolderOrRecipe(book, 'mains/pasta/lasagne/prep')?.path).toBe('mains/pasta')
    expect(nearestFolderOrRecipe(book, 'nothing/here')).toBeNull()
  })

  it('leads back to the recipe when the missing page is below one', () => {
    expect(nearestFolderOrRecipe(book, 'mains/pasta/carbonara/cook/9')?.path).toBe('mains/pasta/carbonara')
    expect(nearestFolderOrRecipe(book, '/mains/pasta/carbonara/cook')?.path).toBe('mains/pasta/carbonara')
    expect(nearestFolderOrRecipe(book, 'mains/pasta/carbonara/extra/deep')?.path).toBe('mains/pasta/carbonara')
  })

  it('splits a path into its parents', () => {
    expect(parentPaths('mains/pasta/carbonara')).toEqual(['mains', 'mains/pasta', 'mains/pasta/carbonara'])
  })
})

describe('hasSeveralChapters', () => {
  it('is true for a book with two chapters', () => {
    expect(hasSeveralChapters(book)).toBe(true)
  })

  it('is false for a book with one chapter, however many sections it has', () => {
    expect(hasSeveralChapters(makeBook([makeFolder({ path: 'mains', recipes: [stew], folders: [pasta] })]))).toBe(false)
  })
})

describe('searchTermForMissingPage', () => {
  it('searches for the last part of the address that is not a folder', () => {
    expect(searchTermForMissingPage(book, '/mains/pasta/lasagne')).toBe('lasagne')
    expect(searchTermForMissingPage(book, 'nothing/here')).toBe('here')
  })

  it('turns dashes into spaces', () => {
    expect(searchTermForMissingPage(book, 'mains/pasta/pasta-pesto')).toBe('pasta pesto')
    expect(searchTermForMissingPage(book, 'mains/--green---curry-')).toBe('green curry')
  })

  it('skips the words and step numbers of a recipe page', () => {
    expect(searchTermForMissingPage(book, 'mains/pasta/pasta-pesto/prep')).toBe('pasta pesto')
    expect(searchTermForMissingPage(book, 'mains/pasta/lasagne/cook/2')).toBe('lasagne')
    expect(searchTermForMissingPage(book, 'mains/pasta/lasagne/Done')).toBe('lasagne')
  })

  it('decodes escaped letters and keeps broken escapes as typed', () => {
    expect(searchTermForMissingPage(book, 'mains/cr%C3%A8me-br%C3%BBl%C3%A9e')).toBe('crème brûlée')
    expect(searchTermForMissingPage(book, 'mains/50%-off')).toBe('50% off')
  })

  it('is empty when only folders and recipe page words are left', () => {
    expect(searchTermForMissingPage(book, 'mains/pasta/prep')).toBe('')
    expect(searchTermForMissingPage(book, 'cook/3')).toBe('')
    expect(searchTermForMissingPage(book, 'mains/---')).toBe('')
    expect(searchTermForMissingPage(book, '/')).toBe('')
  })
})

describe('resolveBookPath', () => {
  it('finds a folder', () => {
    expect(resolveBookPath(book, 'mains/pasta')).toMatchObject({ kind: 'folder', folder: { path: 'mains/pasta' } })
  })

  it('finds a recipe overview', () => {
    expect(resolveBookPath(book, 'mains/pasta/carbonara')).toMatchObject({ kind: 'recipe', view: { name: 'overview' } })
  })

  it('finds the prep, cooking steps and last page of a recipe', () => {
    expect(resolveBookPath(book, 'mains/pasta/carbonara/prep')).toMatchObject({ view: { name: 'prep' } })
    expect(resolveBookPath(book, 'mains/pasta/carbonara/cook/3')).toMatchObject({ view: { name: 'cook', stepNumber: 3 } })
    expect(resolveBookPath(book, 'mains/pasta/carbonara/done')).toMatchObject({ view: { name: 'done' } })
  })

  it('refuses steps that do not exist and unknown paths', () => {
    expect(resolveBookPath(book, 'mains/pasta/carbonara/cook/4')).toBeNull()
    expect(resolveBookPath(book, 'mains/pasta/carbonara/cook/1.5')).toBeNull()
    expect(resolveBookPath(book, 'mains/prep')).toBeNull()
    expect(resolveBookPath(book, 'nothing/here')).toBeNull()
  })

  it('finds a drink, which has only its own page', () => {
    const negroni = makeDrink({ slug: 'negroni', folderPath: 'cocktails' })
    const bar = makeBook([makeFolder({ path: 'cocktails', recipes: [negroni] })])

    expect(resolveBookPath(bar, 'cocktails/negroni')).toEqual({ kind: 'recipe', recipe: negroni, view: { name: 'overview' } })
    expect(resolveBookPath(bar, 'cocktails/negroni/prep')).toBeNull()
    expect(resolveBookPath(bar, 'cocktails/negroni/cook/1')).toBeNull()
    expect(resolveBookPath(bar, 'cocktails/negroni/done')).toBeNull()
  })

  it('round-trips every recipe view address', () => {
    const views = [{ name: 'overview' }, { name: 'prep' }, { name: 'cook', stepNumber: 2 }, { name: 'done' }] as const
    for (const view of views) {
      expect(resolveBookPath(book, recipeViewPath(carbonara, view))).toEqual({ kind: 'recipe', recipe: carbonara, view })
    }
  })
})

describe('splitGarnishes', () => {
  it('lists the garnishes after what goes in the glass, each in book order', () => {
    const gin = makeIngredient({ id: 'gin' })
    const peel = makeIngredient({ id: 'peel', garnish: true })
    const vermouth = makeIngredient({ id: 'vermouth' })

    expect(splitGarnishes([gin, peel, vermouth])).toEqual({ mixed: [gin, vermouth], garnishes: [peel] })
  })
})

describe('ingredientsForStep', () => {
  it('lists the ingredients a step uses, in the order of the step', () => {
    const recipe = makeRecipe({
      slug: 'soup',
      ingredients: [makeIngredient({ id: 'salt' }), makeIngredient({ id: 'leek' })],
    })

    const step = makeStep({ ingredientIds: ['leek', 'salt'] })

    expect(ingredientsForStep(recipe, step).map((ingredient) => ingredient.id)).toEqual(['leek', 'salt'])
  })
})

describe('techniquesInStep', () => {
  it('lists each technique once, in the order the text uses them', () => {
    const chop: Technique = { id: 'chop-finely', name: both('Chop finely'), explanation: both('Small.') }
    const soften: Technique = { id: 'soften', name: both('Soften'), explanation: both('Gently.') }
    const step = makeStep({
      pieces: {
        en: [
          { kind: 'technique', text: 'Chop', technique: chop },
          { kind: 'words', text: ' and ' },
          { kind: 'technique', text: 'soften', technique: soften },
          { kind: 'technique', text: 'chop', technique: chop },
        ],
        nl: [{ kind: 'technique', text: 'Fruit', technique: soften }],
      },
    })

    expect(techniquesInStep(step, 'en').map((technique) => technique.id)).toEqual(['chop-finely', 'soften'])
    expect(techniquesInStep(step, 'nl').map((technique) => technique.id)).toEqual(['soften'])
  })
})
