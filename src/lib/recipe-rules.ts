/** Fixed lists and limits shared by the recipe files and the app. Kept free of Zod so the app bundle stays small. */

export const LANGUAGES = ['en', 'nl'] as const

export const UNITS = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'piece', 'clove', 'pinch', 'slice', 'sprig', 'can'] as const

export const CHAPTER_COLORS = ['tomato', 'matcha', 'yolk', 'plum', 'sea'] as const

export const MIN_SERVINGS = 1
export const MAX_SERVINGS = 24

/** Chapter folders may not use these names: they are pages of the app. */
export const RESERVED_CHAPTER_NAMES = ['search'] as const

export type Language = (typeof LANGUAGES)[number]
export type Unit = (typeof UNITS)[number]
export type ChapterColor = (typeof CHAPTER_COLORS)[number]

/** The same text in English and Dutch. */
export type LocalizedText = Record<Language, string>
