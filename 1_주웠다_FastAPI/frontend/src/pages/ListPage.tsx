import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchPosts } from '../api/posts'
import ErrorBox from '../components/ErrorBox'
import Pagination from '../components/Pagination'
import PostCard from '../components/PostCard'
import { CATEGORIES, CATEGORY_LABEL, SORT_LABEL, STATUS_LABEL, TYPE_LABEL } from '../labels'
import type { Category, PostListQuery, PostPage, PostStatus, PostType, SortOrder } from '../types'

const PAGE_SIZE = 8

// 검색 조건은 URL 에 담아 새로고침 · 뒤로가기 · 링크 공유 시에도 유지합니다.
function readQuery(params: URLSearchParams): PostListQuery {
  return {
    keyword: params.get('keyword') || undefined,
    type: (params.get('type') as PostType) || undefined,
    category: (params.get('category') as Category) || undefined,
    status: (params.get('status') as PostStatus) || undefined,
    sort: (params.get('sort') as SortOrder) || 'latest',
    page: Math.max(1, Number(params.get('page')) || 1),
    size: PAGE_SIZE,
  }
}

export default function ListPage() {
  const [params, setParams] = useSearchParams()
  const query = readQuery(params)
  const queryKey = params.toString()

  const [data, setData] = useState<PostPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)
  const [keywordInput, setKeywordInput] = useState(query.keyword ?? '')

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchPosts(readQuery(new URLSearchParams(queryKey)))
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [queryKey])

  useEffect(load, [load])
  useEffect(() => setKeywordInput(query.keyword ?? ''), [query.keyword])

  /** 조건 하나를 바꾸면 1페이지로 돌아갑니다. */
  const setFilter = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  const totalPages = data ? Math.ceil(data.total / data.size) : 0

  return (
    <section>
      <div className="tabs" role="tablist">
        {([undefined, 'FOUND', 'LOST'] as const).map((t) => (
          <button
            key={t ?? 'ALL'}
            role="tab"
            aria-selected={query.type === t}
            className={`tab ${query.type === t ? 'active' : ''}`}
            onClick={() => setFilter('type', t)}
          >
            {t ? TYPE_LABEL[t] : '전체'}
          </button>
        ))}
      </div>

      <div className="toolbar">
        <form
          className="search"
          onSubmit={(e) => {
            e.preventDefault()
            setFilter('keyword', keywordInput.trim() || undefined)
          }}
        >
          <input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="물건 이름, 장소로 검색"
            aria-label="검색어"
          />
          <button className="btn">검색</button>
        </form>

        <select value={query.category ?? ''} onChange={(e) => setFilter('category', e.target.value || undefined)} aria-label="카테고리">
          <option value="">모든 카테고리</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>

        <select value={query.status ?? ''} onChange={(e) => setFilter('status', e.target.value || undefined)} aria-label="상태">
          <option value="">모든 상태</option>
          {(Object.keys(STATUS_LABEL) as PostStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        <select value={query.sort} onChange={(e) => setFilter('sort', e.target.value === 'latest' ? undefined : e.target.value)} aria-label="정렬">
          {(Object.keys(SORT_LABEL) as SortOrder[]).map((s) => (
            <option key={s} value={s}>
              {SORT_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <ErrorBox error={error} onRetry={load} />
      ) : !data ? (
        <p className="state">게시판을 불러오는 중…</p>
      ) : (
        <>
          <p className="result-count">
            총 <strong>{data.total}</strong>건 {loading && <span className="muted">· 불러오는 중…</span>}
          </p>
          {data.items.length === 0 ? (
            <p className="state">조건에 맞는 글이 없어요. 🍂</p>
          ) : (
            <div className={`board ${loading ? 'is-loading' : ''}`}>
              {data.items.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
          <Pagination page={query.page} totalPages={totalPages} onChange={(p) => setFilter('page', p === 1 ? undefined : String(p))} />
        </>
      )}
    </section>
  )
}
