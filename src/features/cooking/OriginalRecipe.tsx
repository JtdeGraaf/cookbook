import type { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import type { Recipe } from '@/lib/book'
import { sourceLinkText } from '@/lib/links'

/** "Original recipe: Albert Heijn", linking to the recipe this one is based on. Nothing for our own recipes. */
export function OriginalRecipe({ recipe }: { recipe: Recipe }) {
  const { source } = recipe
  if (!source) return null
  return (
    <p className="spread__source">
      <Trans
        i18nKey="recipe.originalRecipe"
        values={{ name: sourceLinkText(source) }}
        components={{ original: <SourceLink url={source.url} /> }}
      />
    </p>
  )
}

function SourceLink({ url, children }: { url: string; children?: ReactNode }) {
  const { t } = useTranslation()
  return (
    <a href={url} target="_blank" rel="noreferrer" className="spread__source-link">
      {children}
      <Icon name="external" size={16} />
      <span className="visually-hidden"> ({t('recipe.opensInNewTab')})</span>
    </a>
  )
}
