import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { fetchWorkshop, fetchWorkshopReservations } from '../api/workshops'
import ErrorBox from '../components/ErrorBox'
import NotFound from '../components/NotFound'
import SeatBar from '../components/SeatBar'
import { RESERVATION_STATUS_LABEL, formatDateTime, formatPrice, formatStartsAt } from '../labels'
import type { Reservation, Workshop } from '../types'

export default function HostWorkshopPage() {
  const id = Number(useParams().id)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [reservations, setReservations] = useState<Reservation[] | null>(null)
  const [error, setError] = useState<unknown>(null)

  const load = useCallback(() => {
    setError(null)
    setWorkshop(null)
    setReservations(null)
    Promise.all([fetchWorkshop(id), fetchWorkshopReservations(id)])
      .then(([w, rs]) => {
        setWorkshop(w)
        setReservations(rs)
      })
      .catch(setError)
  }, [id])

  useEffect(load, [load])

  if (error instanceof ApiError && error.status === 404) return <NotFound message="이 클래스는 찾을 수 없어요." />
  if (error) return <ErrorBox error={error} onRetry={load} />
  if (!workshop || !reservations) return <p className="state">명단을 불러오는 중…</p>

  const confirmed = reservations.filter((r) => r.status === 'CONFIRMED')
  const people = confirmed.reduce((sum, r) => sum + r.headcount, 0)

  return (
    <section>
      <Link to={`/workshops/${workshop.id}`} className="back">
        ← 클래스 페이지
      </Link>
      <p className="eyebrow">호스트 · 예약자 명단</p>
      <h1 className="page-title">{workshop.title}</h1>
      <p className="muted">
        {formatStartsAt(workshop.startsAt)} · {workshop.place}
      </p>

      <div className="stats">
        <div>
          <span>확정 예약</span>
          <strong>{confirmed.length}건</strong>
        </div>
        <div>
          <span>참여 인원</span>
          <strong>
            {people} / {workshop.capacity}명
          </strong>
        </div>
        <div>
          <span>예상 매출</span>
          <strong>{formatPrice(workshop.price * people)}</strong>
        </div>
      </div>
      <SeatBar workshop={workshop} />

      {reservations.length === 0 ? (
        <div className="state">
          <p className="state-icon">📭</p>
          <p className="state-title">아직 예약이 없어요.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>예약자</th>
                <th>연락처</th>
                <th>인원</th>
                <th>요청사항</th>
                <th>상태</th>
                <th>신청 시각</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r, i) => (
                <tr key={r.code} className={r.status === 'CANCELED' ? 'row-canceled' : ''}>
                  <td>{i + 1}</td>
                  <td>
                    {r.name}
                    <br />
                    <small className="mono muted">{r.code}</small>
                  </td>
                  <td>{r.phone}</td>
                  <td>{r.headcount}명</td>
                  <td>{r.memo ?? <span className="muted">-</span>}</td>
                  <td>
                    <span className={`badge badge-${r.status.toLowerCase()}`}>{RESERVATION_STATUS_LABEL[r.status]}</span>
                  </td>
                  <td>{formatDateTime(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
