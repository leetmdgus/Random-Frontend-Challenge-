import type { ReactNode } from 'react'

interface Props {
  label: ReactNode
  error?: string
  hint?: ReactNode
  /** 안에 버튼이 여러 개 있는 경우 true (label 로 감싸면 클릭이 첫 버튼으로 전달됨) */
  group?: boolean
  children: ReactNode
}

export default function Field({ label, error, hint, group, children }: Props) {
  const Tag = group ? 'div' : 'label'
  return (
    <Tag className={`field ${error ? 'has-error' : ''}`} role={group ? 'group' : undefined}>
      <span className="field-label">
        {label}
        {hint && <small>{hint}</small>}
      </span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </Tag>
  )
}
