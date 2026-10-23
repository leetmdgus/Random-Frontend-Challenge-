import { Link } from 'react-router-dom'
import { CATEGORY_ICON, CATEGORY_LABEL, WORKSHOP_STATE_LABEL, formatPrice, formatStartsAt, workshopState } from '../labels'
import type { Workshop } from '../types'
import SeatBar from './SeatBar'

export default function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const state = workshopState(workshop)
  return (
    <Link to={`/workshops/${workshop.id}`} className={`card state-${state.toLowerCase()}`}>
      <div className={`card-cover cat-${workshop.category.toLowerCase()}`}>
        <span className="card-icon" aria-hidden>
          {CATEGORY_ICON[workshop.category]}
        </span>
        {state !== 'OPEN' && <span className="card-flag">{WORKSHOP_STATE_LABEL[state]}</span>}
      </div>
      <div className="card-body">
        <p className="card-cat">
          {CATEGORY_LABEL[workshop.category]} · {workshop.hostName}
        </p>
        <h3 className="card-title">{workshop.title}</h3>
        <p className="card-when">{formatStartsAt(workshop.startsAt)}</p>
        <p className="card-where">{workshop.place}</p>
        <div className="card-foot">
          <span className="card-price">{formatPrice(workshop.price)}</span>
        </div>
        <SeatBar workshop={workshop} />
      </div>
    </Link>
  )
}
