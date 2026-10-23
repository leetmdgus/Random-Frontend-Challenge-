export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

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

/**
 * 에러 응답 본문을 ApiError 로 바꿉니다.
 * FastAPI 기본 에러 형식 두 가지를 이해합니다.
 *   - { "detail": "메시지" }                                   (HTTPException)
 *   - { "detail": [{ "loc": [..., "필드"], "msg": "..." }] }    (요청 검증 실패)
 */
function toApiError(status: number, body: unknown): ApiError {
  const detail = (body as { detail?: unknown } | null)?.detail

  if (typeof detail === 'string') return new ApiError(status, detail)

  if (Array.isArray(detail)) {
    const fieldErrors: Record<string, string> = {}
    for (const item of detail) {
      const loc: unknown[] = Array.isArray(item?.loc) ? item.loc : []
      const field = String(loc[loc.length - 1] ?? '_')
      fieldErrors[field] ??= String(item?.msg ?? '올바르지 않은 값이에요.')
    }
    return new ApiError(status, '입력값을 다시 확인해 주세요.', fieldErrors)
  }

  return new ApiError(status, `요청을 처리하지 못했어요. (HTTP ${status})`)
}

/** 아직 연결하지 않은 API 지점에서 호출됩니다. */
export function notConnected(name: string): never {
  throw new ApiError(0, `[${name}] 아직 백엔드와 연결되지 않았어요. src/api/posts.ts 의 TODO 를 채워 주세요.`)
}
