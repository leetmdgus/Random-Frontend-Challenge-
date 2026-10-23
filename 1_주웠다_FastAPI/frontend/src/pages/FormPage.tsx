import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { createPost, fetchPost, updatePost } from '../api/posts'
import ErrorBox from '../components/ErrorBox'
import { CATEGORIES, CATEGORY_LABEL, TYPE_LABEL } from '../labels'
import type { PostInput, PostType } from '../types'

const EMPTY: PostInput = {
  type: 'FOUND',
  title: '',
  description: '',
  category: 'ETC',
  place: '',
  date: '',
  contact: null,
}

// 화면에서는 일부러 입력값 검증을 하지 않습니다.
// 잘못된 값도 그대로 서버로 보내고, 서버가 돌려준 검증 에러를 필드 아래에 보여 줍니다.
export default function FormPage() {
  const params = useParams()
  const editId = params.id ? Number(params.id) : null
  const navigate = useNavigate()

  const [form, setForm] = useState<PostInput>(EMPTY)
  const [loadError, setLoadError] = useState<unknown>(null)
  const [loading, setLoading] = useState(editId !== null)
  const [submitError, setSubmitError] = useState<ApiError | Error | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (editId === null) return
    fetchPost(editId)
      .then(({ type, title, description, category, place, date, contact }) =>
        setForm({ type, title, description, category, place, date, contact }),
      )
      .catch(setLoadError)
      .finally(() => setLoading(false))
  }, [editId])

  const set = <K extends keyof PostInput>(key: K, value: PostInput[K]) => setForm((f) => ({ ...f, [key]: value }))

  const fieldErrors = submitError instanceof ApiError ? submitError.fieldErrors : {}
  const err = (key: keyof PostInput) => fieldErrors[key] && <p className="field-error">{fieldErrors[key]}</p>

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      const saved = editId === null ? await createPost(form) : await updatePost(editId, form)
      navigate(`/posts/${saved.id}`, { replace: editId !== null })
    } catch (e) {
      setSubmitError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setSubmitting(false)
    }
  }

  if (loadError instanceof ApiError && loadError.status === 404) {
    return (
      <div className="state">
        <p className="big">🕳️ 수정할 글을 찾을 수 없어요.</p>
        <Link to="/" className="btn">
          게시판으로
        </Link>
      </div>
    )
  }
  if (loadError) return <ErrorBox error={loadError} />
  if (loading) return <p className="state">글을 불러오는 중…</p>

  const isFound = form.type === 'FOUND'

  return (
    <form className="paper-form" onSubmit={submit} noValidate>
      <Link to={editId === null ? '/' : `/posts/${editId}`} className="back">
        ← 취소
      </Link>
      <h1 className="form-title">{editId === null ? '게시판에 글 붙이기' : '글 고치기'}</h1>

      <fieldset className="type-toggle">
        <legend>어떤 글인가요?</legend>
        {(['FOUND', 'LOST'] as PostType[]).map((t) => (
          <label key={t} className={`type-option type-${t.toLowerCase()} ${form.type === t ? 'checked' : ''}`}>
            <input type="radio" name="type" checked={form.type === t} onChange={() => set('type', t)} />
            {t === 'FOUND' ? '🙋 ' : '😢 '}
            {TYPE_LABEL[t]}
          </label>
        ))}
        {err('type')}
      </fieldset>

      <label className="field">
        <span>제목</span>
        <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="예) 파란 키링 달린 자동차 키" />
        {err('title')}
      </label>

      <label className="field">
        <span>카테고리</span>
        <select value={form.category} onChange={(e) => set('category', e.target.value as PostInput['category'])}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
        {err('category')}
      </label>

      <div className="field-row">
        <label className="field">
          <span>{isFound ? '주운 곳' : '잃어버린 곳'}</span>
          <input value={form.place} onChange={(e) => set('place', e.target.value)} placeholder="예) 햇살아파트 103동 앞" />
          {err('place')}
        </label>
        <label className="field">
          <span>{isFound ? '주운 날' : '잃어버린 날'}</span>
          <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
          {err('date')}
        </label>
      </div>

      <label className="field">
        <span>
          설명 <small className="muted">({form.description.length}/500)</small>
        </span>
        <textarea
          rows={5}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="색, 모양, 특징 등을 적어 주세요."
        />
        {err('description')}
      </label>

      <label className="field">
        <span>
          연락 방법 <small className="muted">(선택)</small>
        </span>
        <input
          value={form.contact ?? ''}
          onChange={(e) => set('contact', e.target.value || null)}
          placeholder="예) 경비실에 맡겼어요 / 오픈채팅 링크"
        />
        {err('contact')}
      </label>

      {submitError && Object.keys(fieldErrors).length === 0 && <ErrorBox error={submitError} />}
      {Object.keys(fieldErrors).length > 0 && <p className="form-error">⚠️ {submitError?.message}</p>}

      <button className="btn btn-primary btn-lg" disabled={submitting}>
        {submitting ? '붙이는 중…' : editId === null ? '📌 게시판에 붙이기' : '💾 저장하기'}
      </button>
    </form>
  )
}
