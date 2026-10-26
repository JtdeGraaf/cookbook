/**
 * The starting recipe.json for a new dish in `folderPath` (like "mains/pasta"). It passes every build check, so
 * the site keeps building while you fill it in. Used by `npm run new-recipe` and the "Add a recipe" link.
 */
export function recipeTemplate(folderPath: string): string {
  const recipe = {
    $schema: schemaPath(folderPath, 'recipe.schema.json'),
    title: { en: 'New recipe', nl: 'Nieuw recept' },
    summary: { en: 'One or two sentences about the dish.', nl: 'Een of twee zinnen over het gerecht.' },
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 20,
    tags: [{ en: 'quick', nl: 'snel' }],
    ingredients: [
      { id: 'onion', name: { en: 'onion', nl: 'ui' }, plural: { en: 'onions', nl: 'uien' }, amount: 1, unit: 'piece' },
      { id: 'salt', name: { en: 'salt', nl: 'zout' } },
    ],
    prep: [{ text: { en: 'Chop the onion.', nl: 'Snipper de ui.' }, ingredients: ['onion'] }],
    cook: [
      {
        text: { en: 'Cook the onion until soft.', nl: 'Bak de ui zacht.' },
        ingredients: ['onion', 'salt'],
        timer: { minutes: 5, label: { en: 'Soften the onion', nl: 'Ui zacht bakken' } },
      },
    ],
  }
  return JSON.stringify(recipe, null, 2) + '\n'
}

/** The same for a drink: `npm run new-recipe -- cocktails/gimlet --drink`. */
export function drinkTemplate(folderPath: string): string {
  const drink = {
    $schema: schemaPath(folderPath, 'drink.schema.json'),
    kind: 'drink',
    title: { en: 'New drink', nl: 'Nieuw drankje' },
    summary: { en: 'One or two sentences about the drink.', nl: 'Een of twee zinnen over het drankje.' },
    servings: 1,
    method: 'shaken',
    glass: 'coupe',
    ice: 'none',
    ingredients: [
      { id: 'gin', bottle: true, name: { en: 'gin', nl: 'gin' }, amount: 5, unit: 'cl' },
      { id: 'lime', garnish: true, name: { en: 'lime wedge', nl: 'limoenpartje' }, amount: 1, unit: 'piece' },
    ],
    steps: [
      {
        text: { en: 'Shake the gin with ice and strain it into the glass.', nl: 'Shake de gin met ijs en zeef hem in het glas.' },
        ingredients: ['gin'],
      },
      { text: { en: 'Put the lime wedge on the rim.', nl: 'Zet het limoenpartje op de rand.' }, ingredients: ['lime'] },
    ],
  }
  return JSON.stringify(drink, null, 2) + '\n'
}

/** From recipes/<folders>/<recipe>/recipe.json back up to the repository root. */
function schemaPath(folderPath: string, schemaFile: string): string {
  const depth = folderPath.split('/').filter(Boolean).length + 2
  return `${'../'.repeat(depth)}schemas/${schemaFile}`
}
