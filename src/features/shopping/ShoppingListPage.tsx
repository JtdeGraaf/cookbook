import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookLink } from '@/components/BookLink'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Icon } from '@/components/Icon'
import { Tick } from '@/components/Tick'
import { ServingsStepper } from '@/features/cooking/ServingsStepper'
import { useQuantityLabel } from '@/features/cooking/useQuantityText'
import { useLocalized } from '@/features/settings/useLanguage'
import { useCopyShoppingList } from './useCopyShoppingList'
import { useShoppingList } from './useShoppingList'
import '@/features/cooking/cooking.css'
import './shopping.css'

/** Every ingredient for the recipes on the list, added together, to tick off in the shop. */
export function ShoppingListPage() {
  const { t } = useTranslation()
  const localized = useLocalized()
  const quantityLabel = useQuantityLabel()
  const shopping = useShoppingList()
  const { copy, copied } = useCopyShoppingList(shopping.items)
  const [askingToClear, setAskingToClear] = useState(false)
  const checked = shopping.list.checkedItems

  if (shopping.recipes.length === 0) {
    return (
      <section className="shopping shopping--empty">
        <h1 className="shopping__title">{t('shopping.title')}</h1>
        <p className="shopping__empty">{t('shopping.empty')}</p>
        <p className="shopping__hint">{t('shopping.emptyHint')}</p>
      </section>
    )
  }

  return (
    <section className="shopping">
      <header className="shopping__head">
        <h1 className="shopping__title">{t('shopping.title')}</h1>
        <div className="shopping__actions">
          <button type="button" className="button" onClick={() => void copy()}>
            <Icon name={copied ? 'check' : 'list'} />
            <span aria-live="polite">{copied ? t('shopping.copied') : t('shopping.copy')}</span>
          </button>
          <button type="button" className="clear-ticks" onClick={() => setAskingToClear(true)}>
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
                <ServingsStepper servings={servings} onChange={(next) => shopping.changeServings(recipe, next)} />
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

        <section className="shopping__items" aria-labelledby="shopping-items">
          <h2 id="shopping-items" className="shopping__subtitle">
            {t('shopping.toBuy')}
          </h2>
          <p className="shopping__progress numbers">
            {t('shopping.progress', { checked: checked.length, total: shopping.items.length })}
          </p>
          <ul className="shopping__item-list">
            {shopping.items.map((item) => (
              <li key={item.key}>
                <label className="ingredient-line shopping-item">
                  <Tick checked={checked.includes(item.key)} onChange={() => shopping.toggleItem(item.key)} />
                  <span className="ingredient-line__name">
                    {localized(item.name)}
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
