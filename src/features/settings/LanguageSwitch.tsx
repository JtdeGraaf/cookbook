import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/lib/recipe-rules'
import { useLanguage } from './useLanguage'

export function LanguageSwitch() {
  const { t } = useTranslation()
  const { language, changeLanguage } = useLanguage()
  return (
    <div className="language-switch" role="group" aria-label={t('header.language')}>
      {LANGUAGES.map((option) => (
        <button
          key={option}
          type="button"
          className="language-switch__option"
          aria-pressed={option === language}
          lang={option}
          title={t(`languages.${option}`)}
          onClick={() => changeLanguage(option)}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
