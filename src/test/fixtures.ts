import type { Book, Folder, Ingredient, Picture, Recipe, Step } from '@/lib/book'
import type { LocalizedText } from '@/lib/recipe-rules'

export function both(en: string, nl: string = en): LocalizedText {
  return { en, nl }
}

const picture: Picture = {
  file: { src: '/cover.webp', srcset: '/cover.webp 480w', w: 480, h: 320 },
  alt: both('A photo'),
  credit: null,
}

export function makeIngredient(overrides: Partial<Ingredient> & Pick<Ingredient, 'id'>): Ingredient {
  return { name: both(overrides.id), plural: null, quantity: { amount: 1, unit: 'piece' }, note: null, pantry: false, ...overrides }
}

export function makeStep(overrides: Partial<Step> = {}): Step {
  return { text: both('Do something'), ingredientIds: [], timer: null, tip: null, image: null, ...overrides }
}

/** A recipe in folder `folderPath` (default "mains"); its path is worked out from the two. */
export function makeRecipe(overrides: Partial<Recipe> & Pick<Recipe, 'slug'>): Recipe {
  const folderPath = overrides.folderPath ?? 'mains'
  return {
    path: `${folderPath}/${overrides.slug}`,
    folderPath,
    color: 'tomato',
    title: both(overrides.slug),
    summary: both('A summary'),
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 20,
    tags: [],
    cover: picture,
    source: null,
    ingredients: [makeIngredient({ id: 'salt' })],
    prep: [makeStep()],
    cook: [makeStep()],
    ...overrides,
  }
}

export function makeFolder(overrides: Partial<Folder> & Pick<Folder, 'path'>): Folder {
  const slug = overrides.path.split('/').at(-1) ?? overrides.path
  return { slug, title: both(slug), intro: null, color: 'tomato', folders: [], recipes: [], ...overrides }
}

export function makeBook(chapters: Folder[]): Book {
  return { chapters }
}
