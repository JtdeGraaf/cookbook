import { useId } from 'react'
import './copy-by-hand.css'

type CopyByHandProps = { label: string; text: string; multiline?: boolean }

/** A read-only field holding text the clipboard refused, selected on focus so the reader can copy it themselves. */
export function CopyByHand({ label, text, multiline = false }: CopyByHandProps) {
  const id = useId()
  const selectAll = (event: { currentTarget: HTMLInputElement | HTMLTextAreaElement }) => event.currentTarget.select()
  return (
    <div className="copy-by-hand">
      <label htmlFor={id} className="copy-by-hand__label">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className="copy-by-hand__field"
          value={text}
          readOnly
          rows={Math.min(text.split('\n').length, 8)}
          onFocus={selectAll}
        />
      ) : (
        <input id={id} className="copy-by-hand__field" value={text} readOnly onFocus={selectAll} />
      )}
    </div>
  )
}
