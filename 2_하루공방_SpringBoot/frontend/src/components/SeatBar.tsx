import type { Workshop } from '../types'

export default function SeatBar({ workshop }: { workshop: Workshop }) {
  const { capacity, reservedCount } = workshop
  const remaining = Math.max(0, capacity - reservedCount)
  const ratio = Math.min(1, reservedCount / capacity)
  return (
    <div className="seats">
      <div className="seats-track" aria-hidden>
        <div className="seats-fill" style={{ width: `${ratio * 100}%` }} />
      </div>
      <span className="seats-text">
        {remaining > 0 ? (
          <>
            <strong>{remaining}석</strong> 남음 · 정원 {capacity}명
          </>
        ) : (
          <>정원 {capacity}명 모두 찼어요</>
        )}
      </span>
    </div>
  )
}
