import { techniquesInStep, type Step } from '@/lib/book'
import { useLanguage, useLocalized } from '@/features/settings/useLanguage'
import type { TechniqueNotesControls } from './useTechniqueNotes'

type TechniqueNotesProps = { step: Step; notes: TechniqueNotesControls }

/** The explanations of a step's cooking terms, each hidden until its (i) button opens it. */
export function TechniqueNotes({ step, notes }: TechniqueNotesProps) {
  const { language } = useLanguage()
  const localized = useLocalized()

  return techniquesInStep(step, language).map((technique) => (
    <p key={technique.id} id={notes.noteId(technique.id)} className="technique-note" hidden={!notes.isOpen(technique.id)}>
      <strong className="technique-note__name">{localized(technique.name)}</strong> {localized(technique.explanation)}
    </p>
  ))
}
