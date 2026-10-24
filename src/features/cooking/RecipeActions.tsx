import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import type { Recipe } from '@/lib/book'
import { FavouriteButton } from '@/features/favourites/FavouriteButton'
import { useShoppingList } from '@/features/shopping/useShoppingList'
import { useShareRecipe } from './useShareRecipe'

type RecipeActionsProps = { recipe: Recipe; servings: number }

/**
 * The small row of things to do with a recipe besides cooking it. Favourite and Shopping list are toggles that
 * show their state the same way; the list uses the recipe's own servings, so there is nothing to keep in step.
 */
export function RecipeActions({ recipe, servings }: RecipeActionsProps) {
  const { t } = useTranslation()
  const shopping = useShoppingList()
  const { share, copied } = useShareRecipe(recipe, servings)
  const onList = shopping.isOnList(recipe)
  return (
    <div className="recipe-actions">
      <FavouriteButton recipePath={recipe.path} />
      <button
        type="button"
        className="recipe-actions__button"
        aria-pressed={onList}
        onClick={() => (onList ? shopping.remove(recipe) : shopping.add(recipe))}
      >
        <Icon name={onList ? 'check' : 'basket'} size={20} />
        {t('recipe.shoppingList')}
      </button>
      <button type="button" className="recipe-actions__button" onClick={() => void share()}>
        <Icon name={copied ? 'check' : 'share'} size={20} />
        <span aria-live="polite">{copied ? t('recipe.linkCopied') : t('recipe.share')}</span>
      </button>
      <button type="button" className="recipe-actions__button" onClick={() => window.print()}>
        <Icon name="print" size={20} />
        {t('recipe.print')}
      </button>
    </div>
  )
}
