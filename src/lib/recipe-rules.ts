/** Fixed lists and limits shared by the recipe files and the app. Kept free of Zod so the app bundle stays small. */

export const LANGUAGES = ['en', 'nl'] as const

export const UNITS = [
  'g',
  'kg',
  'ml',
  'cl',
  'l',
  'tsp',
  'tbsp',
  'barspoon',
  'dash',
  'piece',
  'clove',
  'pinch',
  'slice',
  'sprig',
  'can',
] as const

export const CHAPTER_COLORS = ['tomato', 'matcha', 'yolk', 'plum', 'sea'] as const

/** How a drink is mixed. */
export const DRINK_METHODS = ['shaken', 'stirred', 'built', 'blended'] as const

/** The glass a drink is served in. */
export const GLASSES = ['coupe', 'nick-and-nora', 'martini', 'rocks', 'highball', 'wine', 'flute', 'mug'] as const

/** What goes in the glass with the drink: nothing ("up"), cubes, one large cube, or crushed ice. */
export const ICE_KINDS = ['none', 'cubes', 'large-cube', 'crushed'] as const

export const MIN_SERVINGS = 1
export const MAX_SERVINGS = 24

/** Chapter folders may not use these names: they are pages of the app. */
export const RESERVED_CHAPTER_NAMES = ['search', 'browse', 'shopping-list'] as const

export type Language = (typeof LANGUAGES)[number]
export type Unit = (typeof UNITS)[number]
export type ChapterColor = (typeof CHAPTER_COLORS)[number]
export type DrinkMethod = (typeof DRINK_METHODS)[number]
export type Glass = (typeof GLASSES)[number]
export type IceKind = (typeof ICE_KINDS)[number]

/** The same text in English and Dutch. */
export type LocalizedText = Record<Language, string>
