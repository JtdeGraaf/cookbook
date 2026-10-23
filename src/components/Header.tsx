import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { PageKind } from '@/features/book/usePageKind'
import { SearchField } from '@/features/search/SearchField'
import { LanguageSwitch } from '@/features/settings/LanguageSwitch'
import { ThemeSwitch } from '@/features/settings/ThemeSwitch'
import { ShoppingListLink } from '@/features/shopping/ShoppingListLink'
import { Icon } from './Icon'

/** On the cover the masthead is the title, so the header shows only the round book mark. */
export function Header({ pageKind }: { pageKind: PageKind }) {
  const { t } = useTranslation()
  return (
    <header className="running-head">
      <div className="running-head__inner">
        <Link to="/" className="running-head__title" data-mark-only={pageKind === 'cover'} aria-label={t('header.home')}>
          <span className="running-head__mark" aria-hidden="true" />
          <span className="running-head__name">{t('book.title')}</span>
        </Link>
        <SearchField />
        <div className="running-head__settings">
          <Link to="/search" search={{ q: '' }} className="icon-button search-shortcut" aria-label={t('header.searchLabel')}>
            <Icon name="search" />
          </Link>
          <ShoppingListLink />
          <LanguageSwitch />
          <ThemeSwitch />
        </div>
      </div>
    </header>
  )
}
