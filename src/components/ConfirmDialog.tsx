import { useEffect, useRef } from 'react'
import './confirm-dialog.css'

type ConfirmDialogProps = {
  open: boolean
  title: string
  explanation: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}

/** Asks before anything that cannot be undone. Cancel has focus first, so Enter never destroys by accident. */
export function ConfirmDialog(props: ConfirmDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (props.open && !element.open) {
      element.showModal()
      cancelButton.current?.focus()
    }
    if (!props.open && element.open) element.close()
  }, [props.open])

  return (
    <dialog ref={dialog} className="confirm-dialog" onClose={props.onCancel} aria-labelledby="confirm-title">
      <h2 id="confirm-title" className="confirm-dialog__title">
        {props.title}
      </h2>
      <p className="confirm-dialog__text">{props.explanation}</p>
      <div className="confirm-dialog__actions">
        <button ref={cancelButton} type="button" className="button button--quiet" onClick={props.onCancel}>
          {props.cancelLabel}
        </button>
        <button type="button" className="button" onClick={props.onConfirm}>
          {props.confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
