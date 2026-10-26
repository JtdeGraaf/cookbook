import type { Book, Dish, Drink, Folder, Ingredient, Picture, Step } from '@/lib/book'
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
  return {
    name: both(overrides.id),
    plural: null,
    quantity: { amount: 1, unit: 'piece' },
    note: null,
    pantry: false,
    bottle: false,
    garnish: false,
    ...overrides,
  }
}

/** A step whose text has no techniques unless `pieces` says otherwise. */
export function makeStep(overrides: Partial<Step> = {}): Step {
  const text = overrides.text ?? both('Do something')
  return {
    text,
    pieces: { en: [{ kind: 'words', text: text.en }], nl: [{ kind: 'words', text: text.nl }] },
    ingredientIds: [],
    timer: null,
    tip: null,
    image: null,
    ...overrides,
  }
}

/** A dish in folder `folderPath` (default "mains"); its path is worked out from the two. */
export function makeRecipe(overrides: Partial<Dish> & Pick<Dish, 'slug'>): Dish {
  const folderPath = overrides.folderPath ?? 'mains'
  return {
    kind: 'dish',
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

/** A drink in folder `folderPath` (default "cocktails"); its path is worked out from the two. */
export function makeDrink(overrides: Partial<Drink> & Pick<Drink, 'slug'>): Drink {
  const folderPath = overrides.folderPath ?? 'cocktails'
  return {
    kind: 'drink',
    path: `${folderPath}/${overrides.slug}`,
    folderPath,
    color: 'sea',
    title: both(overrides.slug),
    summary: both('A summary'),
    servings: 1,
    tags: [],
    cover: picture,
    source: null,
    method: 'stirred',
    glass: 'rocks',
    ice: 'large-cube',
    ingredients: [makeIngredient({ id: 'gin', quantity: { amount: 3, unit: 'cl' }, bottle: true })],
    steps: [makeStep()],
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
