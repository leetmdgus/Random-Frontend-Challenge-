import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { createWorkshop } from '../api/workshops'
import ErrorBox from '../components/ErrorBox'
import Field from '../components/Field'
import { CATEGORIES, CATEGORY_ICON, CATEGORY_LABEL } from '../labels'
import type { WorkshopInput } from '../types'

// 숫자 입력칸은 문자열로 들고 있다가 보낼 때 숫자로 바꿉니다. (빈 칸은 NaN → 서버 검증에 걸림)
type FormState = Omit<WorkshopInput, 'durationMinutes' | 'price' | 'capacity'> & {
  durationMinutes: string
  price: string
  capacity: string
}

const EMPTY: FormState = {
  title: '',
  category: 'CERAMICS',
  description: '',
  hostName: '',
  place: '',
  startsAt: '',
  durationMinutes: '120',
  price: '',
  capacity: '6',
}

const toNumber = (s: string) => (s.trim() === '' ? NaN : Number(s))

// 화면에서는 일부러 입력값을 검사하지 않습니다. 서버가 돌려준 검증 에러를 입력칸 아래에 보여 줍니다.
export default function HostNewPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState<unknown>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))
  const fieldErrors = error instanceof ApiError ? error.fieldErrors : {}
  const hasFieldErrors = Object.keys(fieldErrors).length > 0

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const created = await createWorkshop({
        ...form,
        durationMinutes: toNumber(form.durationMinutes),
        price: toNumber(form.price),
        capacity: toNumber(form.capacity),
      })
      navigate(`/host/workshops/${created.id}`)
    } catch (err) {
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="narrow">
      <h1 className="page-title">클래스 열기</h1>
      <p className="muted">한 번 열면 한 회차짜리 클래스가 만들어져요. 같은 수업을 여러 날 하려면 날짜마다 따로 열어 주세요.</p>

      <form className="form sheet" onSubmit={submit} noValidate>
        <Field label="클래스 이름" error={fieldErrors.title}>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="물레로 빚는 나의 첫 머그컵" />
        </Field>

        <Field label="카테고리" error={fieldErrors.category} group>
          <div className="chips">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c}
                className={`chip ${form.category === c ? 'active' : ''}`}
                onClick={() => set('category', c)}
              >
                {CATEGORY_ICON[c]} {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </Field>

        <div className="row-2">
          <Field label="호스트(공방) 이름" error={fieldErrors.hostName}>
            <input value={form.hostName} onChange={(e) => set('hostName', e.target.value)} placeholder="흙과손" />
          </Field>
          <Field label="장소" error={fieldErrors.place}>
            <input value={form.place} onChange={(e) => set('place', e.target.value)} placeholder="서울 마포구 망원동 …" />
          </Field>
        </div>

        <div className="row-2">
          <Field label="시작 일시" error={fieldErrors.startsAt}>
            <input type="datetime-local" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} />
          </Field>
          <Field label="진행 시간" error={fieldErrors.durationMinutes} hint="분">
            <input type="number" value={form.durationMinutes} onChange={(e) => set('durationMinutes', e.target.value)} />
          </Field>
        </div>

        <div className="row-2">
          <Field label="1인 가격" error={fieldErrors.price} hint="원, 무료는 0">
            <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="45000" />
          </Field>
          <Field label="정원" error={fieldErrors.capacity} hint="명">
            <input type="number" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} />
          </Field>
        </div>

        <Field label="소개" error={fieldErrors.description} hint={`${form.description.length}/1000`}>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="무엇을 만들고, 무엇을 준비해 오면 되는지 알려 주세요."
          />
        </Field>

        {error != null && (hasFieldErrors ? <p className="form-error">입력값을 다시 확인해 주세요.</p> : <ErrorBox error={error} />)}

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? '여는 중…' : '클래스 열기'}
        </button>
      </form>
    </section>
  )
}
