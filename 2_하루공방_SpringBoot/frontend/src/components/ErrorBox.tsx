import { ApiError } from '../api/client'

interface Props {
  error: unknown
  onRetry?: () => void
}

export default function ErrorBox({ error, onRetry }: Props) {
  const status = error instanceof ApiError ? error.status : 0
  const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했어요.'
  return (
    <div className="error-box" role="alert">
      <span className="error-status">{status ? status : '!'}</span>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-sm" onClick={onRetry}>
          다시 시도
        </button>
      )}
    </div>
  )
}
