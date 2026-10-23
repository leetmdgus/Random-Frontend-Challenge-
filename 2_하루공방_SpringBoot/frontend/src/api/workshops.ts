// ─────────────────────────────────────────────────────────────
//  백엔드 연결 지점 ① 클래스
//  화면은 src/api/ 의 함수만 호출합니다.
//  VITE_USE_MOCK=false 로 바꾸면 TODO 부분이 실행되니,
//  직접 설계한 API 에 맞게 채워 주세요.
//
//  지켜 주면 화면이 그대로 동작하는 약속
//   - 성공 시 각 함수의 반환 타입대로 값을 돌려준다.
//   - 실패 시 ApiError 를 던진다. (request() 를 쓰면 자동)
//       · 404 → "찾을 수 없음" 화면
//       · fieldErrors 가 있으면 → 폼의 입력칸 아래에 메시지
//         필드 이름은 WorkshopInput 의 키(title, startsAt, capacity ...)와 같아야 한다.
//       · 그 밖의 에러 → message 를 그대로 보여 준다.
// ─────────────────────────────────────────────────────────────
import { USE_MOCK, notConnected } from './client'
import * as mock from '../mock/store'
import type { Reservation, Workshop, WorkshopInput, WorkshopListQuery } from '../types'

/** 클래스 목록: 카테고리 · "예약 가능한 것만" 조건. 시작 일시가 빠른 순서로. */
export async function fetchWorkshops(query: WorkshopListQuery): Promise<Workshop[]> {
  if (USE_MOCK) return mock.listWorkshops(query)

  // TODO(백엔드 연결): 클래스 목록 조회
  return notConnected('fetchWorkshops')
}

/** 클래스 상세 / 호스트 화면: 클래스 하나. 없으면 404. reservedCount 는 취소를 뺀 인원 합계. */
export async function fetchWorkshop(id: number): Promise<Workshop> {
  if (USE_MOCK) return mock.getWorkshop(id)

  // TODO(백엔드 연결): 클래스 단건 조회
  return notConnected('fetchWorkshop')
}

/** 호스트: 클래스 열기. 만들어진 클래스를 돌려받는다. */
export async function createWorkshop(input: WorkshopInput): Promise<Workshop> {
  if (USE_MOCK) return mock.createWorkshop(input)

  // TODO(백엔드 연결): 클래스 등록
  return notConnected('createWorkshop')
}

/** 호스트: 이 클래스의 예약자 명단 (취소 포함, 신청 순서대로). 클래스가 없으면 404. */
export async function fetchWorkshopReservations(workshopId: number): Promise<Reservation[]> {
  if (USE_MOCK) return mock.listReservationsOf(workshopId)

  // TODO(백엔드 연결): 클래스별 예약 목록 조회
  return notConnected('fetchWorkshopReservations')
}
