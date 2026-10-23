import { Icon } from './Icon'

type TickProps = { checked: boolean; onChange: () => void; large?: boolean }

/** A round tick box in the chapter colour. Sits inside a <label> that carries the text. */
export function Tick({ checked, onChange, large = false }: TickProps) {
  return (
    <span className={large ? 'tick tick--large' : 'tick'}>
      <input type="checkbox" className="tick__input" checked={checked} onChange={onChange} />
      <span className="tick__mark" aria-hidden="true">
        <Icon name="check" size={large ? 20 : 16} />
      </span>
    </span>
  )
}
