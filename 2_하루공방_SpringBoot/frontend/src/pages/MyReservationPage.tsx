import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { cancelMyReservation, fetchMyReservation } from '../api/reservations'
import ErrorBox from '../components/ErrorBox'
import Field from '../components/Field'
import {
  CATEGORY_ICON,
  RESERVATION_STATUS_LABEL,
  formatDateTime,
  formatPrice,
  formatStartsAt,
} from '../labels'
import type { ReservationDetail } from '../types'

export default function MyReservationPage() {
  const [params] = useSearchParams()
  // 예약 완료 화면에서 넘어오면 코드가 미리 채워집니다. 전화번호는 URL 에 담지 않습니다.
  const [code, setCode] = useState(params.get('code') ?? '')
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState<ReservationDetail | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [busy, setBusy] = useState(false)

  const lookup = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      setResult(await fetchMyReservation(code, phone))
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  const cancel = async () => {
    if (!result || !confirm('예약을 취소할까요? 취소한 자리는 다른 사람이 예약할 수 있어요.')) return
    setBusy(true)
    setError(null)
    try {
      setResult(await cancelMyReservation(code, phone))
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  const fieldErrors = error instanceof ApiError ? error.fieldErrors : {}

  return (
    <section className="narrow">
      <h1 className="page-title">내 예약</h1>
      <p className="muted">예약할 때 받은 코드와 휴대폰 번호를 입력하세요.</p>

      <form className="form lookup" onSubmit={lookup} noValidate>
        <Field label="예약 코드" error={fieldErrors.code}>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="HR-XXXXX" autoCapitalize="characters" />
        </Field>
        <Field label="휴대폰 번호" error={fieldErrors.phone}>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" inputMode="tel" />
        </Field>
        <button className="btn btn-primary" disabled={busy}>
          {busy && !result ? '찾는 중…' : '예약 찾기'}
        </button>
      </form>

      {error != null && Object.keys(fieldErrors).length === 0 && <ErrorBox error={error} />}

      {result && (
        <div className={`ticket ${result.status === 'CANCELED' ? 'ticket-canceled' : ''}`}>
          <div className={`ticket-side cat-${result.workshop.category.toLowerCase()}`}>
            <span aria-hidden>{CATEGORY_ICON[result.workshop.category]}</span>
          </div>
          <div className="ticket-body">
            <span className={`badge badge-${result.status.toLowerCase()}`}>{RESERVATION_STATUS_LABEL[result.status]}</span>
            <h2>
              <Link to={`/workshops/${result.workshop.id}`}>{result.workshop.title}</Link>
            </h2>
            <p className="muted">
              {formatStartsAt(result.workshop.startsAt)} · {result.workshop.place}
            </p>
            <dl className="info info-sm">
              <dt>예약 코드</dt>
              <dd className="mono">{result.code}</dd>
              <dt>예약자</dt>
              <dd>
                {result.name} · {result.phone}
              </dd>
              <dt>인원</dt>
              <dd>{result.headcount}명</dd>
              <dt>결제 예정</dt>
              <dd>{formatPrice(result.workshop.price * result.headcount)}</dd>
              {result.memo && (
                <>
                  <dt>요청사항</dt>
                  <dd>{result.memo}</dd>
                </>
              )}
              <dt>신청</dt>
              <dd>{formatDateTime(result.createdAt)}</dd>
              {result.canceledAt && (
                <>
                  <dt>취소</dt>
                  <dd>{formatDateTime(result.canceledAt)}</dd>
                </>
              )}
            </dl>
            {/* 이미 취소됐거나 시작한 클래스여도 버튼을 숨기지 않습니다. 서버가 막는지 확인해 보세요. */}
            <button className="btn btn-danger" onClick={cancel} disabled={busy}>
              예약 취소
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
