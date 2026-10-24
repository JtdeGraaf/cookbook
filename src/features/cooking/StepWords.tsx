import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import type { Step } from '@/lib/book'
import { splitBeforeLastWord } from '@/lib/technique-marks'
import { useLanguage } from '@/features/settings/useLanguage'
import type { TechniqueNotesControls } from './useTechniqueNotes'

type StepWordsProps = { step: Step; notes: TechniqueNotesControls }

/** The words of a step, with a small (i) button after each cooking term that opens its explanation. */
export function StepWords({ step, notes }: StepWordsProps) {
  const { t } = useTranslation()
  const { language } = useLanguage()

  return step.pieces[language].map((piece, index) => {
    if (piece.kind === 'words') return <Fragment key={index}>{piece.text}</Fragment>
    const { id } = piece.technique
    const [leadingWords, lastWord] = splitBeforeLastWord(piece.text)
    return (
      <Fragment key={index}>
        {leadingWords}
        <span className="technique">
          {lastWord}
          <button
            type="button"
            className="technique__button"
            aria-expanded={notes.isOpen(id)}
            aria-controls={notes.noteId(id)}
            aria-label={t('recipe.whatDoesTermMean', { term: piece.text })}
            onClick={() => notes.toggle(id)}
          >
            <Icon name="info" size={18} />
          </button>
        </span>
      </Fragment>
    )
  })
}
