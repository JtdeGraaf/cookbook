import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookLink } from '@/components/BookLink'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { Icon } from '@/components/Icon'
import { Tick } from '@/components/Tick'
import { usePageTitle } from '@/components/usePageTitle'
import type { ShoppingItem } from '@/lib/shopping-list'
import { ServingsStepper } from '@/features/cooking/ServingsStepper'
import { useNameForAmount, useQuantityLabel } from '@/features/cooking/useQuantityText'
import { useLocalized } from '@/features/settings/useLanguage'
import { useCopyShoppingList } from './useCopyShoppingList'
import { useShoppingList } from './useShoppingList'
import '@/features/cooking/cooking.css'
import './shopping.css'

/**
 * Everything to buy for the recipes on the list, added together. Ticking a line means you have it, the same tick
 * as on the recipe's own ingredient list.
 */
export function ShoppingListPage() {
  const { t } = useTranslation()
  const localized = useLocalized()
  const shopping = useShoppingList()
  const { copy, copied } = useCopyShoppingList(shopping.toBuy)
  const [askingToClear, setAskingToClear] = useState(false)
  usePageTitle(t('shopping.title'))

  if (shopping.recipes.length === 0) {
    return (
      <EmptyState
        title={t('shopping.empty')}
        hint={t('shopping.emptyHint')}
        action={
          <Link to="/" className="button">
            {t('shopping.emptyAction')}
          </Link>
        }
      />
    )
  }

  return (
    <section className="shopping">
      <header className="shopping__head">
        <h1 className="shopping__title">{t('shopping.title')}</h1>
        <div className="shopping__actions">
          <button type="button" className="button" onClick={() => void copy()} disabled={shopping.toBuy.length === 0}>
            <Icon name={copied ? 'check' : 'list'} />
            <span aria-live="polite">{copied ? t('shopping.copied') : t('shopping.copy')}</span>
          </button>
          <button type="button" className="text-button" onClick={() => setAskingToClear(true)}>
            <Icon name="undo" size={18} />
            {t('shopping.clear')}
          </button>
        </div>
      </header>

      <div className="shopping__layout">
        <section className="shopping__recipes" aria-labelledby="shopping-recipes">
          <h2 id="shopping-recipes" className="shopping__subtitle">
            {t('shopping.recipes')}
          </h2>
          <ul className="shopping__recipe-list">
            {shopping.recipes.map(({ recipe, servings }) => (
              <li key={recipe.path} className="shopping-recipe" data-color={recipe.color}>
                <BookLink path={recipe.path} className="shopping-recipe__title">
                  {localized(recipe.title)}
                </BookLink>
                <ServingsStepper
                  servings={servings}
                  onChange={(next) => shopping.changeServings(recipe, next)}
                  recipeTitle={localized(recipe.title)}
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={t('shopping.remove', { title: localized(recipe.title) })}
                  onClick={() => shopping.remove(recipe)}
                >
                  <Icon name="close" size={20} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="shopping__items" aria-labelledby="shopping-to-buy">
          <h2 id="shopping-to-buy" className="shopping__subtitle">
            {t('shopping.toBuy')}
          </h2>
          <p className="shopping__progress numbers" aria-live="polite">
            {shopping.toBuy.length === 0 ? t('shopping.allBought') : t('shopping.left', { count: shopping.toBuy.length })}
          </p>
          <ShoppingLines items={shopping.toBuy} onToggle={shopping.toggleItem} />

          {shopping.haveAlready.length > 0 && (
            <>
              <h3 className="shopping__have-title">{t('shopping.haveAlready')}</h3>
              <ShoppingLines items={shopping.haveAlready} onToggle={shopping.toggleItem} />
            </>
          )}
          {shopping.staples.length > 0 && (
            <p className="shopping__staples">
              {t('shopping.staples', { names: shopping.staples.map(localized).join(', ') })}
            </p>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={askingToClear}
        title={t('shopping.clearQuestion')}
        explanation={t('shopping.clearExplain')}
        confirmLabel={t('shopping.clear')}
        cancelLabel={t('shopping.cancel')}
        onConfirm={() => {
          shopping.clear()
          setAskingToClear(false)
        }}
        onCancel={() => setAskingToClear(false)}
      />
    </section>
  )
}

function ShoppingLines({ items, onToggle }: { items: ShoppingItem[]; onToggle: (item: ShoppingItem) => void }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const quantityLabel = useQuantityLabel()
  const nameFor = useNameForAmount()
  return (
    <ul className="shopping__item-list">
      {items.map((item) => (
        <li key={item.key}>
          <label className="ingredient-line shopping-item">
            <Tick checked={item.have} onChange={() => onToggle(item)} />
            <span className="ingredient-line__name">
              {nameFor(item, item.quantity)}
              {item.recipeTitles.length > 1 && (
                <span className="ingredient-line__note">
                  {t('shopping.forRecipes', { titles: item.recipeTitles.map(localized).join(', ') })}
                </span>
              )}
            </span>
            <span className="ingredient-line__leader" aria-hidden="true" />
            <span className="ingredient-line__amount numbers">{quantityLabel(item.quantity)}</span>
          </label>
        </li>
      ))}
    </ul>
  )
}
