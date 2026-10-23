import type { Category, ReservationStatus } from '../types'

// 날짜는 "오늘 기준 며칠 뒤"로 만들어서, 언제 열어도 예약 가능한 클래스가 보이게 합니다.
function at(daysFromToday: number, hhmm: string): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromToday)
  const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return `${ymd}T${hhmm}`
}

export interface SeedWorkshop {
  id: number
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

export interface SeedReservation {
  id: number
  workshopId: number
  code: string
  name: string
  phone: string
  headcount: number
  memo: string | null
  status: ReservationStatus
  createdAt: string
  canceledAt: string | null
}

export const seedWorkshops = (): SeedWorkshop[] => [
  {
    id: 1,
    title: '물레로 빚는 나의 첫 머그컵',
    category: 'CERAMICS',
    description: '물레 사용법부터 차근차근 배워 머그컵 하나를 완성합니다.\n완성품은 굽기를 거쳐 3주 뒤 택배로 보내 드려요.\n앞치마 제공, 손톱은 짧게 깎고 와 주세요.',
    hostName: '흙과손',
    place: '서울 마포구 망원동 흙과손 공방',
    startsAt: at(3, '14:00'),
    durationMinutes: 150,
    price: 65000,
    capacity: 6,
  },
  {
    id: 2,
    title: '원목 버터나이프 깎기',
    category: 'WOOD',
    description: '호두나무를 깎고 사포질해 나만의 버터나이프를 만듭니다. 오일 마감까지 당일 완성!',
    hostName: '나무결목공',
    place: '서울 성동구 성수동 나무결 작업실',
    startsAt: at(4, '11:00'),
    durationMinutes: 120,
    price: 45000,
    capacity: 8,
  },
  {
    id: 3,
    title: '가을 향 소이캔들 & 디퓨저',
    category: 'CANDLE',
    description: '우디 · 시트러스 계열 향료를 직접 블렌딩해 캔들 1개와 디퓨저 1개를 만들어요.',
    hostName: '향기상점',
    place: '서울 종로구 익선동 향기상점 2층',
    startsAt: at(2, '19:30'),
    durationMinutes: 90,
    price: 38000,
    capacity: 4,
  },
  {
    id: 4,
    title: '손바느질 가죽 카드지갑',
    category: 'LEATHER',
    description: '이탈리아 베지터블 가죽으로 카드 4장이 들어가는 지갑을 만듭니다. 이니셜 각인 가능.',
    hostName: '가죽공작소',
    place: '서울 용산구 해방촌 가죽공작소',
    startsAt: at(6, '15:00'),
    durationMinutes: 180,
    price: 55000,
    capacity: 5,
  },
  {
    id: 5,
    title: '펜 하나로 그리는 동네 풍경 드로잉',
    category: 'DRAWING',
    description: '근처 골목을 함께 걸으며 펜 드로잉으로 풍경을 담아 봅니다. 그림을 못 그려도 괜찮아요.',
    hostName: '골목스케치',
    place: '서울 서대문구 연희동 카페 여백 앞 집결',
    startsAt: at(1, '10:00'),
    durationMinutes: 120,
    price: 0,
    capacity: 10,
  },
  {
    id: 6,
    title: '핸드빌딩 접시 만들기',
    category: 'CERAMICS',
    description: '물레 없이 손으로 판을 밀어 접시 2개를 만듭니다. 유약 색은 현장에서 골라요.',
    hostName: '흙과손',
    place: '서울 마포구 망원동 흙과손 공방',
    startsAt: at(9, '13:00'),
    durationMinutes: 120,
    price: 52000,
    capacity: 6,
  },
  {
    id: 7,
    title: '미니 원목 트레이',
    category: 'WOOD',
    description: '지난주에 진행한 클래스예요. 다음 일정은 곧 열릴 예정입니다.',
    hostName: '나무결목공',
    place: '서울 성동구 성수동 나무결 작업실',
    startsAt: at(-5, '14:00'),
    durationMinutes: 150,
    price: 48000,
    capacity: 6,
  },
]

const created = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3_600_000).toISOString()

let rid = 0
const r = (
  workshopId: number,
  code: string,
  name: string,
  phone: string,
  headcount: number,
  memo: string | null = null,
  status: ReservationStatus = 'CONFIRMED',
): SeedReservation => ({
  id: ++rid,
  workshopId,
  code,
  name,
  phone,
  headcount,
  memo,
  status,
  createdAt: created(240 - rid * 17),
  canceledAt: status === 'CANCELED' ? created(20) : null,
})

export const seedReservations = (): SeedReservation[] => {
  rid = 0
  return [
    r(1, 'HR-K7P2Q', '김하늘', '010-1111-2222', 2, '친구와 함께 가요'),
    r(1, 'HR-M3XW8', '이도윤', '010-3333-4444', 1),
    r(1, 'HR-T9ZB4', '박서연', '010-5555-6666', 2, null, 'CANCELED'),
    r(3, 'HR-A4CN7', '최지우', '010-7777-8888', 2, '향 알레르기 없어요'),
    r(3, 'HR-Q8RM2', '정민준', '010-9999-0000', 2),
    r(4, 'HR-W2HD6', '한예린', '010-1234-5678', 1, '이니셜 각인 원해요'),
    r(5, 'HR-F6JS3', '오시우', '010-2468-1357', 3),
    r(7, 'HR-Y5LV9', '윤채원', '010-1357-2468', 2),
  ]
}
