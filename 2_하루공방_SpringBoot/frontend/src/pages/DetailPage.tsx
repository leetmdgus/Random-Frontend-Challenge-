import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { createReservation } from '../api/reservations'
import { fetchWorkshop } from '../api/workshops'
import ErrorBox from '../components/ErrorBox'
import Field from '../components/Field'
import NotFound from '../components/NotFound'
import SeatBar from '../components/SeatBar'
import {
  CATEGORY_ICON,
  CATEGORY_LABEL,
  WORKSHOP_STATE_LABEL,
  formatDuration,
  formatPrice,
  formatStartsAt,
  workshopState,
} from '../labels'
import type { Reservation, ReservationInput, Workshop } from '../types'

const EMPTY: ReservationInput = { name: '', phone: '', headcount: 1, memo: null }

export default function DetailPage() {
  const id = Number(useParams().id)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [error, setError] = useState<unknown>(null)

  const load = useCallback(() => {
    setError(null)
    return fetchWorkshop(id).then(setWorkshop).catch(setError)
  }, [id])

  useEffect(() => {
    setWorkshop(null)
    load()
  }, [load])

  if (error instanceof ApiError && error.status === 404) return <NotFound message="이 클래스는 찾을 수 없어요." />
  if (error) return <ErrorBox error={error} onRetry={load} />
  if (!workshop) return <p className="state">클래스를 불러오는 중…</p>

  const state = workshopState(workshop)

  return (
    <div className="detail">
      <article className="detail-main">
        <Link to="/" className="back">
          ← 클래스 목록
        </Link>
        <div className={`detail-cover cat-${workshop.category.toLowerCase()}`}>
          <span aria-hidden>{CATEGORY_ICON[workshop.category]}</span>
        </div>
        <p className="card-cat">
          {CATEGORY_LABEL[workshop.category]} · {workshop.hostName}
        </p>
        <h1 className="detail-title">{workshop.title}</h1>

        <dl className="info">
          <dt>일시</dt>
          <dd>{formatStartsAt(workshop.startsAt)}</dd>
          <dt>진행</dt>
          <dd>{formatDuration(workshop.durationMinutes)}</dd>
          <dt>장소</dt>
          <dd>{workshop.place}</dd>
          <dt>가격</dt>
          <dd>{formatPrice(workshop.price)} / 1인</dd>
        </dl>

        <p className="desc">{workshop.description || <span className="muted">소개가 없어요.</span>}</p>

        <Link to={`/host/workshops/${workshop.id}`} className="host-link">
          호스트이신가요? 예약자 명단 보기 →
        </Link>
      </article>

      <aside className="panel">
        <div className="panel-head">
          <span className={`badge badge-${state.toLowerCase()}`}>{WORKSHOP_STATE_LABEL[state]}</span>
          <SeatBar workshop={workshop} />
        </div>
        {/* 마감 · 지난 클래스여도 폼을 숨기지 않습니다. 서버가 막는지 확인해 보세요. */}
        <BookingForm workshop={workshop} onBooked={load} />
      </aside>
    </div>
  )
}

function BookingForm({ workshop, onBooked }: { workshop: Workshop; onBooked: () => void }) {
  const [form, setForm] = useState<ReservationInput>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [booked, setBooked] = useState<Reservation | null>(null)

  const set = <K extends keyof ReservationInput>(key: K, value: ReservationInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const fieldErrors = error instanceof ApiError ? error.fieldErrors : {}
  const hasFieldErrors = Object.keys(fieldErrors).length > 0

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      setBooked(await createReservation(workshop.id, form))
      setForm(EMPTY)
      onBooked()
    } catch (err) {
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (booked) {
    return (
      <div className="booked">
        <p className="booked-title">🎉 예약이 확정됐어요!</p>
        <p className="muted">예약 확인 · 취소에 필요하니 코드를 꼭 저장해 두세요.</p>
        <p className="code">{booked.code}</p>
        <button className="btn btn-sm" onClick={() => navigator.clipboard?.writeText(booked.code)}>
          코드 복사
        </button>
        <dl className="info info-sm">
          <dt>예약자</dt>
          <dd>{booked.name}</dd>
          <dt>연락처</dt>
          <dd>{booked.phone}</dd>
          <dt>인원</dt>
          <dd>{booked.headcount}명</dd>
          <dt>결제 예정</dt>
          <dd>{formatPrice(workshop.price * booked.headcount)} (현장 결제)</dd>
        </dl>
        <div className="row">
          <Link to={`/my?code=${booked.code}`} className="btn btn-primary">
            내 예약 보기
          </Link>
          <button className="btn" onClick={() => setBooked(null)}>
            한 번 더 예약
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <h2 className="panel-title">예약하기</h2>
      <Field label="이름" error={fieldErrors.name}>
        <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="홍길동" />
      </Field>
      <Field label="휴대폰 번호" error={fieldErrors.phone} hint="예약 조회 · 취소에 사용돼요">
        <input
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="010-1234-5678"
          inputMode="tel"
        />
      </Field>
      <Field label="인원" error={fieldErrors.headcount} hint="본인 포함, 최대 4명" group>
        <div className="stepper">
          <button type="button" onClick={() => set('headcount', form.headcount - 1)} aria-label="인원 줄이기">
            −
          </button>
          <span>{form.headcount}명</span>
          <button type="button" onClick={() => set('headcount', form.headcount + 1)} aria-label="인원 늘리기">
            +
          </button>
        </div>
      </Field>
      <Field label="요청사항" error={fieldErrors.memo} hint="선택">
        <textarea
          rows={3}
          value={form.memo ?? ''}
          onChange={(e) => set('memo', e.target.value || null)}
          placeholder="알레르기, 각인 문구 등"
        />
      </Field>

      <p className="total">
        합계 <strong>{formatPrice(workshop.price * Math.max(0, form.headcount))}</strong>
        <small> · 현장 결제</small>
      </p>

      {error != null && (hasFieldErrors ? <p className="form-error">입력값을 다시 확인해 주세요.</p> : <ErrorBox error={error} />)}

      <button className="btn btn-primary btn-block" disabled={submitting}>
        {submitting ? '예약하는 중…' : '예약 확정하기'}
      </button>
    </form>
  )
}
