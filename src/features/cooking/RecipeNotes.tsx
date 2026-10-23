import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import type { Recipe } from '@/lib/book'
import { formatCookedDate } from '@/lib/journal'
import { editRecipeUrl } from '@/lib/links'
import { useLanguage } from '@/features/settings/useLanguage'
import { useRecipeJournal } from './useRecipeJournal'

/** The cook's own margin: how often they made it, notes for next time, and a way to fix the recipe itself. */
export function RecipeNotes({ recipe }: { recipe: Recipe }) {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { journal, changeNote } = useRecipeJournal(recipe)
  const lastCooked = journal.cookedOn[0]
  return (
    <section className="recipe-notes" aria-labelledby="notes-title">
      <h2 id="notes-title" className="recipe-notes__title">
        {t('recipe.notesTitle')}
      </h2>
      <p className="recipe-notes__cooked">
        {lastCooked
          ? t('recipe.cookedCount', { count: journal.cookedOn.length, date: formatCookedDate(lastCooked, language) })
          : t('recipe.neverCooked')}
      </p>
      <label className="recipe-notes__field">
        <span className="visually-hidden">{t('recipe.notesLabel')}</span>
        <textarea
          className="recipe-notes__input"
          rows={3}
          value={journal.note}
          placeholder={t('recipe.notesPlaceholder')}
          onChange={(event) => changeNote(event.target.value)}
        />
      </label>
      <a className="recipe-notes__edit" href={editRecipeUrl(recipe)} target="_blank" rel="noreferrer">
        <Icon name="pencil" size={18} />
        {t('recipe.editOnGithub')}
      </a>
    </section>
  )
}

