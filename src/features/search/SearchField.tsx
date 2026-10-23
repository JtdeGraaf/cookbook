import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { useSearchField } from './useSearchField'

export function SearchField() {
  const { t } = useTranslation()
  const { input, query, changeQuery } = useSearchField()
  return (
    <form className="search-field" role="search" onSubmit={(event) => event.preventDefault()}>
      <label className="search-field__box">
        <span className="visually-hidden">{t('header.searchLabel')}</span>
        <Icon name="search" size={20} />
        <input
          ref={input}
          type="search"
          className="search-field__input"
          placeholder={t('header.searchPlaceholder')}
          value={query}
          onChange={(event) => changeQuery(event.target.value)}
          enterKeyHint="search"
          autoComplete="off"
        />
        <kbd className="search-field__key" aria-hidden="true">
          /
        </kbd>
      </label>
    </form>
  )
}
