import { writeFileSync } from 'node:fs'
import { recipeJsonSchema, chapterJsonSchema } from './json-schemas.ts'

// Run with `npm run schemas` after changing src/lib/recipe-file.ts.
writeFileSync('schemas/recipe.schema.json', recipeJsonSchema())
writeFileSync('schemas/chapter.schema.json', chapterJsonSchema())
console.log('Wrote schemas/recipe.schema.json and schemas/chapter.schema.json')
