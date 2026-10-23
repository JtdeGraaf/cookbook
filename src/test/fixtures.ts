import type { Book, Chapter, Ingredient, Picture, Recipe, Step } from '@/lib/book'
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
  return { name: both(overrides.id), quantity: { amount: 1, unit: 'piece' }, note: null, ...overrides }
}

export function makeStep(overrides: Partial<Step> = {}): Step {
  return { text: both('Do something'), ingredientIds: [], timer: null, tip: null, image: null, ...overrides }
}

export function makeRecipe(overrides: Partial<Recipe> & Pick<Recipe, 'slug'>): Recipe {
  return {
    chapterSlug: 'mains',
    title: both(overrides.slug),
    summary: both('A summary'),
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 20,
    tags: [],
    cover: picture,
    ingredients: [makeIngredient({ id: 'salt' })],
    prep: [makeStep()],
    cook: [makeStep()],
    ...overrides,
  }
}

export function makeChapter(overrides: Partial<Chapter> & Pick<Chapter, 'slug'>): Chapter {
  return { title: both(overrides.slug), intro: null, color: 'tomato', recipes: [], ...overrides }
}

export function makeBook(chapters: Chapter[]): Book {
  return { chapters }
}
