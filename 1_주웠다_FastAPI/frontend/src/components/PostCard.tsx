import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORY_LABEL, TYPE_LABEL } from '../labels'
import type { Post } from '../types'

// 카드마다 살짝 다른 기울기 (id 기준으로 고정)
const tilt = (id: number) => ((id * 37) % 7) - 3

export default function PostCard({ post }: { post: Post }) {
  const resolved = post.status === 'RESOLVED'
  return (
    <Link
      to={`/posts/${post.id}`}
      className={`note note-${post.type.toLowerCase()} ${resolved ? 'note-resolved' : ''}`}
      style={{ '--tilt': `${tilt(post.id) * 0.6}deg` } as CSSProperties}
    >
      <span className="tape" aria-hidden />
      <span className={`type-chip type-${post.type.toLowerCase()}`}>{TYPE_LABEL[post.type]}</span>
      <h3 className="note-title">{post.title}</h3>
      <p className="note-meta">📍 {post.place}</p>
      <p className="note-meta">🗓 {post.date}</p>
      <p className="note-cat">{CATEGORY_LABEL[post.category]}</p>
      {resolved && <span className="stamp">해결!</span>}
    </Link>
  )
}
