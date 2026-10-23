// 화면이 사용하는 데이터 모양입니다.
// 백엔드 응답 모양이 다르면 이 타입을 바꾸기보다 src/api/ 에서 변환하는 것을 권장합니다.

export type Category = 'CERAMICS' | 'WOOD' | 'CANDLE' | 'LEATHER' | 'DRAWING'
export type ReservationStatus = 'CONFIRMED' | 'CANCELED'

/** 원데이 클래스 하나 (날짜 · 시간이 정해진 1회짜리 수업) */
export interface Workshop {
  id: number
  title: string
  category: Category
  description: string
  hostName: string
  place: string
  /** 시작 일시 (YYYY-MM-DDTHH:mm, 한국 시간) */
  startsAt: string
  durationMinutes: number
  /** 1인 가격 (원) */
  price: number
  /** 정원 (명) */
  capacity: number
  /** 확정된 예약 인원 합계 (취소 제외) */
  reservedCount: number
}

/** 호스트가 클래스를 열 때 보내는 값 */
export interface WorkshopInput {
  title: string
  category: Category
  description: string
  hostName: string
  place: string
  startsAt: string
  durationMinutes: number
  price: number
  capacity: number
}

export interface WorkshopListQuery {
  category?: Category
  /** true 면 아직 시작 전이고 자리가 남은 클래스만 */
  onlyAvailable?: boolean
}

/** 예약 한 건 */
export interface Reservation {
  /** 예약 확인용 코드 (서버가 발급) */
  code: string
  name: string
  phone: string
  /** 함께 가는 인원 (본인 포함) */
  headcount: number
  memo: string | null
  status: ReservationStatus
  createdAt: string
  canceledAt: string | null
}

/** 내 예약 조회 결과: 예약 + 어떤 클래스인지 */
export interface ReservationDetail extends Reservation {
  workshop: Workshop
}

/** 예약 신청 폼에서 보내는 값 */
export interface ReservationInput {
  name: string
  phone: string
  headcount: number
  memo: string | null
}
