import { allRecipes, folderTrail, type Book, type Recipe } from './book'
import type { LocalizedText } from './recipe-rules'

/** Where a word was found decides how high the recipe ranks. */
const FIELD_WEIGHTS = { title: 10, tag: 5, ingredient: 4, folder: 2, summary: 1 } as const

type FieldKind = keyof typeof FIELD_WEIGHTS

type SearchField = { kind: FieldKind; text: string; source: LocalizedText }

export type SearchEntry = { recipe: Recipe; fields: SearchField[] }

export type SearchHit = { recipe: Recipe; matchedIngredients: LocalizedText[] }

/** Both languages go into one index, so "eieren" and "eggs" both find the shakshuka. */
export function buildSearchIndex(book: Book): SearchEntry[] {
  return allRecipes(book).map((recipe) => ({
    recipe,
    fields: [
      ...fieldsFor('title', [recipe.title]),
      ...fieldsFor('tag', recipe.tags),
      ...fieldsFor(
        'ingredient',
        recipe.ingredients.map((ingredient) => ingredient.name),
      ),
      ...fieldsFor(
        'folder',
        folderTrail(book, recipe.folderPath).map((folder) => folder.title),
      ),
      ...fieldsFor('summary', [recipe.summary]),
    ],
  }))
}

function fieldsFor(kind: FieldKind, texts: LocalizedText[]): SearchField[] {
  return texts.flatMap((source) => [
    { kind, text: normalize(source.en), source },
    { kind, text: normalize(source.nl), source },
  ])
}

/** Every word of the query must appear somewhere in the recipe. Best matches first. */
export function searchRecipes(index: SearchEntry[], query: string): SearchHit[] {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const scored = index.flatMap((entry) => {
    const wordScores = words.map((word) => bestScore(entry.fields, word))
    if (wordScores.some((score) => score === 0)) return []
    const matchedIngredients = unique(
      entry.fields
        .filter((field) => field.kind === 'ingredient' && words.some((word) => field.text.includes(word)))
        .map((field) => field.source),
    )
    const score = wordScores.reduce((sum, wordScore) => sum + wordScore, 0)
    return [{ hit: { recipe: entry.recipe, matchedIngredients }, score }]
  })

  return scored
    .sort((a, b) => b.score - a.score || a.hit.recipe.title.en.localeCompare(b.hit.recipe.title.en))
    .map(({ hit }) => hit)
}

function bestScore(fields: SearchField[], word: string): number {
  return fields.reduce(
    (best, field) => (field.text.includes(word) ? Math.max(best, FIELD_WEIGHTS[field.kind]) : best),
    0,
  )
}

/** Lowercase without accents, so "creme" finds "crème" and "smeuig" finds "smeuïg". */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)]
}
