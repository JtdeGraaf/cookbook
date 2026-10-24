/**
 * The starting recipe.json for a new recipe in `folderPath` (like "mains/pasta"). It passes every build check, so
 * the site keeps building while you fill it in. Used by `npm run new-recipe` and the "Add a recipe" link.
 */
export function recipeTemplate(folderPath: string): string {
  // From recipes/<folders>/<recipe>/recipe.json back up to the repository root.
  const depth = folderPath.split('/').filter(Boolean).length + 2
  const recipe = {
    $schema: `${'../'.repeat(depth)}schemas/recipe.schema.json`,
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
