import { writeFileSync } from 'node:fs'
import { recipeJsonSchema, drinkJsonSchema, chapterJsonSchema, techniqueJsonSchema } from './json-schemas.ts'

// Run with `npm run schemas` after changing src/lib/recipe-file.ts.
writeFileSync('schemas/recipe.schema.json', recipeJsonSchema())
writeFileSync('schemas/drink.schema.json', drinkJsonSchema())
writeFileSync('schemas/chapter.schema.json', chapterJsonSchema())
writeFileSync('schemas/techniques.schema.json', techniqueJsonSchema())
console.log('Wrote the recipe, drink, chapter and techniques schemas to schemas/')
