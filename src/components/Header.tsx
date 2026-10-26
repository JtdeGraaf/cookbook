import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { SearchField } from '@/features/search/SearchField'
import { LanguageSwitch } from '@/features/settings/LanguageSwitch'
import { ThemeSwitch } from '@/features/settings/ThemeSwitch'
import { ShoppingListLink } from '@/features/shopping/ShoppingListLink'
import { SyncLink } from '@/features/sync/SyncLink'
import { Icon } from './Icon'

/** The running head: the same book mark home on every page, search, the shopping basket, sync and the settings. */
export function Header() {
  const { t } = useTranslation()
  return (
    <header className="running-head">
      <div className="running-head__inner">
        <Link to="/" activeOptions={{ exact: true }} className="running-head__title" aria-label={t('header.home')}>
          <span className="running-head__mark" aria-hidden="true" />
          <span className="running-head__name">{t('book.title')}</span>
        </Link>
        <SearchField />
        <div className="running-head__settings">
          <Link to="/search" search={{ q: '' }} className="icon-button search-shortcut" aria-label={t('header.searchLabel')}>
            <Icon name="search" />
          </Link>
          <ShoppingListLink />
          <SyncLink />
          <LanguageSwitch />
          <ThemeSwitch />
        </div>
      </div>
    </header>
  )
}
