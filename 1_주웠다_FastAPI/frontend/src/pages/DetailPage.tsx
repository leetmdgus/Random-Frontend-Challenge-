import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { changePostStatus, deletePost, fetchPost } from '../api/posts'
import ErrorBox from '../components/ErrorBox'
import { CATEGORY_LABEL, STATUS_LABEL, TYPE_LABEL } from '../labels'
import type { Post } from '../types'

const formatDateTime = (iso: string) => new Date(iso).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })

export default function DetailPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()

  const [post, setPost] = useState<Post | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [actionError, setActionError] = useState<unknown>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    setError(null)
    setPost(null)
    fetchPost(id).then(setPost).catch(setError)
  }, [id])

  useEffect(load, [load])

  if (error instanceof ApiError && error.status === 404) {
    return (
      <div className="state">
        <p className="big">🕳️ 이 글은 사라졌거나 처음부터 없었어요.</p>
        <Link to="/" className="btn">
          게시판으로
        </Link>
      </div>
    )
  }
  if (error) return <ErrorBox error={error} onRetry={load} />
  if (!post) return <p className="state">글을 불러오는 중…</p>

  const resolved = post.status === 'RESOLVED'

  const toggleStatus = async () => {
    setBusy(true)
    setActionError(null)
    try {
      setPost(await changePostStatus(post.id, resolved ? 'OPEN' : 'RESOLVED'))
    } catch (e) {
      setActionError(e)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!confirm('이 글을 게시판에서 뗄까요? 되돌릴 수 없어요.')) return
    setBusy(true)
    setActionError(null)
    try {
      await deletePost(post.id)
      navigate('/', { replace: true })
    } catch (e) {
      setActionError(e)
      setBusy(false)
    }
  }

  return (
    <article className={`detail note-${post.type.toLowerCase()} ${resolved ? 'note-resolved' : ''}`}>
      <span className="tape" aria-hidden />
      <Link to="/" className="back">
        ← 게시판
      </Link>

      <div className="detail-chips">
        <span className={`type-chip type-${post.type.toLowerCase()}`}>{TYPE_LABEL[post.type]}</span>
        <span className="chip">{CATEGORY_LABEL[post.category]}</span>
        <span className={`chip status-${post.status.toLowerCase()}`}>{STATUS_LABEL[post.status]}</span>
      </div>

      <h1 className="detail-title">{post.title}</h1>

      <dl className="detail-info">
        <dt>{post.type === 'FOUND' ? '주운 곳' : '잃어버린 곳'}</dt>
        <dd>📍 {post.place}</dd>
        <dt>{post.type === 'FOUND' ? '주운 날' : '잃어버린 날'}</dt>
        <dd>🗓 {post.date}</dd>
        <dt>연락 방법</dt>
        <dd>{post.contact ?? <span className="muted">적지 않음</span>}</dd>
      </dl>

      <p className="detail-desc">{post.description || <span className="muted">설명이 없어요.</span>}</p>

      <p className="detail-time muted">
        등록 {formatDateTime(post.createdAt)}
        {post.updatedAt !== post.createdAt && ` · 수정 ${formatDateTime(post.updatedAt)}`}
      </p>

      {resolved && <span className="stamp stamp-lg">해결!</span>}

      {actionError != null && <ErrorBox error={actionError} />}

      <div className="actions">
        <button className={`btn ${resolved ? '' : 'btn-primary'}`} onClick={toggleStatus} disabled={busy}>
          {resolved ? '↩️ 다시 찾는 중으로' : '🎉 주인/물건 찾았어요'}
        </button>
        <Link to={`/posts/${post.id}/edit`} className="btn">
          ✏️ 수정
        </Link>
        <button className="btn btn-danger" onClick={remove} disabled={busy}>
          🗑 삭제
        </button>
      </div>
    </article>
  )
}
