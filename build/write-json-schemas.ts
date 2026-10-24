import { writeFileSync } from 'node:fs'
import { recipeJsonSchema, chapterJsonSchema, techniqueJsonSchema } from './json-schemas.ts'

// Run with `npm run schemas` after changing src/lib/recipe-file.ts.
writeFileSync('schemas/recipe.schema.json', recipeJsonSchema())
writeFileSync('schemas/chapter.schema.json', chapterJsonSchema())
writeFileSync('schemas/techniques.schema.json', techniqueJsonSchema())
console.log('Wrote schemas/recipe.schema.json, schemas/chapter.schema.json and schemas/techniques.schema.json')
