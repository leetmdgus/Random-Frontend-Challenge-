import type { Category, ReservationStatus, Workshop } from './types'

export const CATEGORY_LABEL: Record<Category, string> = {
  CERAMICS: '도자기',
  WOOD: '목공',
  CANDLE: '향초·디퓨저',
  LEATHER: '가죽',
  DRAWING: '드로잉',
}

export const CATEGORY_ICON: Record<Category, string> = {
  CERAMICS: '🏺',
  WOOD: '🪵',
  CANDLE: '🕯️',
  LEATHER: '👜',
  DRAWING: '🖌️',
}

export const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[]

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  CONFIRMED: '예약 확정',
  CANCELED: '취소됨',
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/** 2026-10-30T14:00 → 10월 30일 (금) 오후 2:00 */
export function formatStartsAt(startsAt: string): string {
  const d = new Date(startsAt)
  const time = d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]}) ${time}`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return [h && `${h}시간`, m && `${m}분`].filter(Boolean).join(' ')
}

export const formatPrice = (price: number) => (price === 0 ? '무료' : `${price.toLocaleString('ko-KR')}원`)

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })

export type WorkshopState = 'OPEN' | 'FULL' | 'ENDED'

/** 화면 표시용 상태. 예약 가능 여부의 최종 판단은 서버가 합니다. */
export function workshopState(w: Workshop): WorkshopState {
  if (new Date(w.startsAt).getTime() <= Date.now()) return 'ENDED'
  if (w.reservedCount >= w.capacity) return 'FULL'
  return 'OPEN'
}

export const WORKSHOP_STATE_LABEL: Record<WorkshopState, string> = {
  OPEN: '예약 가능',
  FULL: '마감',
  ENDED: '지난 클래스',
}
