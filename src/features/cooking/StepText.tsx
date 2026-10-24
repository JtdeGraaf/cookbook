import type { Step } from '@/lib/book'
import { StepWords } from './StepWords'
import { TechniqueNotes } from './TechniqueNotes'
import { useTechniqueNotes } from './useTechniqueNotes'

type StepTextProps = { step: Step; className?: string }

/** A step's text, with the explanations of its cooking terms opening right under it. */
export function StepText({ step, className }: StepTextProps) {
  const notes = useTechniqueNotes()
  return (
    <div className="step-text">
      <p className={className}>
        <StepWords step={step} notes={notes} />
      </p>
      <TechniqueNotes step={step} notes={notes} />
    </div>
  )
}
