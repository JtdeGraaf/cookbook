import { Icon } from './Icon'
import '@/features/cooking/cooking.css'

type TickProps = { checked: boolean; onChange: () => void; large?: boolean; id?: string }

/** A round tick box in the chapter colour. Sits inside a <label> that carries the text. */
export function Tick({ checked, onChange, large = false, id }: TickProps) {
  return (
    <span className={large ? 'tick tick--large' : 'tick'}>
      <input type="checkbox" id={id} className="tick__input" checked={checked} onChange={onChange} />
      <span className="tick__mark" aria-hidden="true">
        <Icon name="check" size={large ? 20 : 16} />
      </span>
    </span>
  )
}
