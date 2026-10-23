import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { useShoppingList } from './useShoppingList'

/** The basket in the header, with how many recipes are on the list. */
export function ShoppingListLink() {
  const { t } = useTranslation()
  const { recipes } = useShoppingList()
  return (
    <Link
      to="/shopping-list"
      className="icon-button shopping-link"
      aria-label={t('header.shoppingListCount', { count: recipes.length })}
      title={t('header.shoppingList')}
    >
      <Icon name="basket" />
      {recipes.length > 0 && <span className="shopping-link__count numbers">{recipes.length}</span>}
    </Link>
  )
}
