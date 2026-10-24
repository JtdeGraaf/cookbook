import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import type { Recipe } from '@/lib/book'
import { useShoppingList } from '@/features/shopping/useShoppingList'

type ShoppingListToggleProps = { recipe: Recipe }

/** Puts the recipe on the shopping list from its ingredients, or takes it off, with a way to the list once it is on. */
export function ShoppingListToggle({ recipe }: ShoppingListToggleProps) {
  const { t } = useTranslation()
  const shopping = useShoppingList()
  const onList = shopping.isOnList(recipe)
  return (
    <div className="shopping-toggle">
      <button
        type="button"
        className="shopping-toggle__button"
        aria-pressed={onList}
        onClick={() => (onList ? shopping.remove(recipe) : shopping.add(recipe))}
      >
        <Icon name={onList ? 'check' : 'basket'} size={20} />
        {onList ? t('recipe.onShoppingList') : t('recipe.addToShoppingList')}
      </button>
      {onList && (
        <Link to="/shopping-list" className="text-button">
          {t('recipe.viewShoppingList')}
        </Link>
      )}
    </div>
  )
}
