// ─────────────────────────────────────────────────────────────
//  백엔드 연결 지점 ② 예약
//  로그인이 없으므로 "예약 코드 + 전화번호"가 맞아야 내 예약을 보거나 취소할 수 있습니다.
//  규칙 위반(정원 초과, 지난 클래스 등)은 에러 message 가 화면에 그대로 보입니다.
// ─────────────────────────────────────────────────────────────
import { USE_MOCK, notConnected } from './client'
import * as mock from '../mock/store'
import type { Reservation, ReservationDetail, ReservationInput } from '../types'

/** 클래스 상세: 예약 신청. 확정된 예약(서버가 발급한 code 포함)을 돌려받는다. */
export async function createReservation(workshopId: number, input: ReservationInput): Promise<Reservation> {
  if (USE_MOCK) return mock.createReservation(workshopId, input)

  // TODO(백엔드 연결): 예약 신청
  return notConnected('createReservation')
}

/** 내 예약: 코드 + 전화번호로 조회. 둘 중 하나라도 맞지 않으면 404. */
export async function fetchMyReservation(code: string, phone: string): Promise<ReservationDetail> {
  if (USE_MOCK) return mock.findReservation(code, phone)

  // TODO(백엔드 연결): 내 예약 조회
  //  - 전화번호를 URL 쿼리에 넣으면 로그 · 기록에 남을 수 있다는 점도 고민해 보세요.
  return notConnected('fetchMyReservation')
}

/** 내 예약: 취소. 취소된 예약을 돌려받는다. */
export async function cancelMyReservation(code: string, phone: string): Promise<ReservationDetail> {
  if (USE_MOCK) return mock.cancelReservation(code, phone)

  // TODO(백엔드 연결): 예약 취소
  return notConnected('cancelMyReservation')
}
