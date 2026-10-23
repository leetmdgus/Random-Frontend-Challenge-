export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/**
 * 화면에서 다루는 공통 에러.
 * - status: HTTP 상태 코드 (네트워크 오류 / 미연결은 0)
 * - fieldErrors: 폼 필드 이름 → 에러 메시지 (검증 실패 시)
 */
export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

/**
 * fetch 래퍼. 실제 백엔드를 연결할 때 사용하세요.
 * 204 No Content 응답은 undefined 를 반환합니다.
 */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
    })
  } catch {
    throw new ApiError(0, '서버에 연결할 수 없어요. 서버가 켜져 있는지, CORS 설정이 되어 있는지 확인해 주세요.')
  }

  if (res.status === 204) return undefined as T

  const body = await res.json().catch(() => null)
  if (!res.ok) throw toApiError(res.status, body)
  return body as T
}

type FieldErrorItem = { field?: unknown; message?: unknown; defaultMessage?: unknown }

/**
 * 에러 응답 본문을 ApiError 로 바꿉니다.
 * 에러 응답 형식은 직접 정하면 됩니다. 아래 형식들은 그대로 이해하고, 다르다면 이 함수를 고치세요.
 *
 *   메시지:      body.message  또는  body.detail (ProblemDetail)  또는  body.error
 *   필드 에러:   body.errors      = [{ field, message | defaultMessage }]
 *                body.fieldErrors = [{ field, message }]  또는  { 필드: 메시지 }
 */
function toApiError(status: number, body: unknown): ApiError {
  const b = (body ?? {}) as Record<string, unknown>
  const message = [b.message, b.detail, b.error].find((v): v is string => typeof v === 'string')

  const fieldErrors: Record<string, string> = {}
  const raw = b.errors ?? b.fieldErrors
  if (Array.isArray(raw)) {
    for (const item of raw as FieldErrorItem[]) {
      if (typeof item?.field !== 'string') continue
      fieldErrors[item.field] ??= String(item.message ?? item.defaultMessage ?? '올바르지 않은 값이에요.')
    }
  } else if (raw && typeof raw === 'object') {
    for (const [field, msg] of Object.entries(raw)) fieldErrors[field] = String(msg)
  }

  const hasFields = Object.keys(fieldErrors).length > 0
  return new ApiError(
    status,
    message ?? (hasFields ? '입력값을 다시 확인해 주세요.' : `요청을 처리하지 못했어요. (HTTP ${status})`),
    fieldErrors,
  )
}

/** 아직 연결하지 않은 API 지점에서 호출됩니다. */
export function notConnected(name: string): never {
  throw new ApiError(0, `[${name}] 아직 백엔드와 연결되지 않았어요. src/api/ 의 TODO 를 채워 주세요.`)
}
