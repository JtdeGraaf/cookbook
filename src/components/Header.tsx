import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { SearchField } from '@/features/search/SearchField'
import { LanguageSwitch } from '@/features/settings/LanguageSwitch'
import { ThemeSwitch } from '@/features/settings/ThemeSwitch'

export function Header() {
  const { t } = useTranslation()
  return (
    <header className="running-head">
      <div className="running-head__inner">
        <Link to="/" className="running-head__title" aria-label={t('header.home')}>
          {t('book.title')}
        </Link>
        <SearchField />
        <div className="running-head__settings">
          <LanguageSwitch />
          <ThemeSwitch />
        </div>
      </div>
    </header>
  )
}
