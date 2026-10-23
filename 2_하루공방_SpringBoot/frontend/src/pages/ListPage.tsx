import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchWorkshops } from '../api/workshops'
import ErrorBox from '../components/ErrorBox'
import WorkshopCard from '../components/WorkshopCard'
import { CATEGORIES, CATEGORY_ICON, CATEGORY_LABEL } from '../labels'
import type { Category, Workshop } from '../types'

export default function ListPage() {
  // 필터는 URL 에 담아 새로고침 · 뒤로가기 · 공유 시에도 유지합니다.
  const [params, setParams] = useSearchParams()
  const category = (params.get('category') as Category) || undefined
  const onlyAvailable = params.get('available') === 'true'

  const [items, setItems] = useState<Workshop[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchWorkshops({ category, onlyAvailable: onlyAvailable || undefined })
      .then(setItems)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [category, onlyAvailable])

  useEffect(load, [load])

  const update = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  return (
    <section>
      <div className="hero">
        <h1>
          손으로 만드는
          <br />
          하루 한 가지.
        </h1>
        <p>동네 공방의 원데이 클래스를 둘러보고, 자리가 있을 때 바로 예약하세요.</p>
      </div>

      <div className="filters">
        <div className="chips" role="group" aria-label="카테고리">
          <button className={`chip ${!category ? 'active' : ''}`} onClick={() => update('category', undefined)}>
            전체
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => update('category', c)}>
              {CATEGORY_ICON[c]} {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => update('available', e.target.checked ? 'true' : undefined)}
          />
          <span className="toggle-ui" aria-hidden />
          예약 가능한 클래스만
        </label>
      </div>

      {error ? (
        <ErrorBox error={error} onRetry={load} />
      ) : !items ? (
        <p className="state">클래스를 불러오는 중…</p>
      ) : items.length === 0 ? (
        <div className="state">
          <p className="state-icon">🧺</p>
          <p className="state-title">조건에 맞는 클래스가 없어요.</p>
        </div>
      ) : (
        <>
          <p className="count">
            {items.length}개의 클래스 {loading && <span className="muted">· 새로고침 중…</span>}
          </p>
          <div className={`grid ${loading ? 'is-loading' : ''}`}>
            {items.map((w) => (
              <WorkshopCard key={w.id} workshop={w} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
