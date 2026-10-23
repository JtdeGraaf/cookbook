import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { recipeTemplate } from '../src/lib/recipe-template.ts'

// Usage: npm run new-recipe -- mains/pasta/lasagne
const path = process.argv[2]?.replace(/^recipes\//, '').replace(/\/+$/, '')
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

if (!path || !path.includes('/')) {
  console.error('Give the folder and the new recipe name, like: npm run new-recipe -- mains/pasta/lasagne')
  process.exit(1)
}
const badPart = path.split('/').find((part) => !SLUG.test(part))
if (badPart !== undefined) {
  console.error(`"${badPart}" must be lowercase letters, digits and dashes, like "kale-stamppot".`)
  process.exit(1)
}
const folder = join('recipes', path)
if (existsSync(folder)) {
  console.error(`${folder} already exists.`)
  process.exit(1)
}

mkdirSync(folder, { recursive: true })
writeFileSync(join(folder, 'recipe.json'), recipeTemplate(path.split('/').slice(0, -1).join('/')))
console.log(`Created ${join(folder, 'recipe.json')}.`)
console.log('Fill it in, put a photo next to it and add "cover": { "file": "cover.jpg", "alt": { ... } }.')
console.log('Run npm run dev to see it; a push to main publishes it.')
