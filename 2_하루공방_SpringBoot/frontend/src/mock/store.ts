// Mock 저장소. 브라우저 localStorage 에 저장되며, 백엔드가 생기면 쓰지 않습니다.
// 실제 서버에서 겪을 상황(지연, 404, 입력값 검증 실패, 비즈니스 규칙 위반)을 흉내 냅니다.
import { ApiError } from '../api/client'
import { seedReservations, seedWorkshops, type SeedReservation, type SeedWorkshop } from './seed'
import type { Reservation, ReservationDetail, ReservationInput, Workshop, WorkshopInput, WorkshopListQuery } from '../types'

const STORAGE_KEY = 'haru-gongbang.mock'
const DELAY_MS = 350

interface Db {
  workshops: SeedWorkshop[]
  reservations: SeedReservation[]
}

const fresh = (): Db => ({ workshops: seedWorkshops(), reservations: seedReservations() })

function load(): Db {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Db
  } catch {
    /* 저장소를 쓸 수 없으면 시드 데이터로 시작 */
  }
  return fresh()
}

let db = load()

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    /* 무시 */
  }
}

const wait = () => new Promise((resolve) => setTimeout(resolve, DELAY_MS))
const clone = <T,>(v: T): T => structuredClone(v)

const notFound = (what: string) => new ApiError(404, `${what}을(를) 찾을 수 없어요.`)
const conflict = (message: string) => new ApiError(409, message)
const invalid = (errors: Record<string, string>) => new ApiError(400, '입력값을 다시 확인해 주세요.', errors)

const isStarted = (w: SeedWorkshop) => new Date(w.startsAt).getTime() <= Date.now()

function reservedCount(workshopId: number): number {
  return db.reservations
    .filter((r) => r.workshopId === workshopId && r.status === 'CONFIRMED')
    .reduce((sum, r) => sum + r.headcount, 0)
}

const toWorkshop = (w: SeedWorkshop): Workshop => ({ ...w, reservedCount: reservedCount(w.id) })

const toReservation = ({ id, workshopId, ...rest }: SeedReservation): Reservation => rest

function toDetail(r: SeedReservation): ReservationDetail {
  return { ...toReservation(r), workshop: toWorkshop(findWorkshop(r.workshopId)) }
}

function findWorkshop(id: number): SeedWorkshop {
  const w = db.workshops.find((w) => w.id === id)
  if (!w) throw notFound('클래스')
  return w
}

/** 010-1234-5678 / 01012345678 → 010-1234-5678 */
function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/[\s-]/g, '')
  const m = /^(01[016789])(\d{3,4})(\d{4})$/.exec(digits)
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null
}

function newCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code: string
  do {
    code = 'HR-' + Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  } while (db.reservations.some((r) => r.code === code))
  return code
}

const isInt = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n)

// ── 클래스 ─────────────────────────────────────

export async function listWorkshops(q: WorkshopListQuery): Promise<Workshop[]> {
  await wait()
  return db.workshops
    .map(toWorkshop)
    .filter((w) => !q.category || w.category === q.category)
    .filter((w) => !q.onlyAvailable || (new Date(w.startsAt).getTime() > Date.now() && w.reservedCount < w.capacity))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

export async function getWorkshop(id: number): Promise<Workshop> {
  await wait()
  return toWorkshop(findWorkshop(id))
}

export async function createWorkshop(input: WorkshopInput): Promise<Workshop> {
  await wait()
  const e: Record<string, string> = {}
  const title = input.title.trim()
  if (title.length < 2 || title.length > 40) e.title = '클래스 이름은 2~40자로 입력해 주세요.'
  if (input.description.length > 1000) e.description = '소개는 1000자 이하로 입력해 주세요.'
  if (!input.hostName.trim() || input.hostName.length > 20) e.hostName = '호스트 이름은 1~20자로 입력해 주세요.'
  if (!input.place.trim() || input.place.length > 60) e.place = '장소는 1~60자로 입력해 주세요.'
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input.startsAt)) e.startsAt = '시작 일시를 선택해 주세요.'
  else if (new Date(input.startsAt).getTime() <= Date.now()) e.startsAt = '시작 일시는 지금 이후여야 해요.'
  if (!isInt(input.durationMinutes) || input.durationMinutes < 30 || input.durationMinutes > 480)
    e.durationMinutes = '진행 시간은 30~480분 사이 정수로 입력해 주세요.'
  if (!isInt(input.price) || input.price < 0 || input.price > 1_000_000) e.price = '가격은 0~1,000,000원 사이 정수로 입력해 주세요.'
  if (!isInt(input.capacity) || input.capacity < 1 || input.capacity > 30) e.capacity = '정원은 1~30명 사이로 입력해 주세요.'
  if (Object.keys(e).length) throw invalid(e)

  const w: SeedWorkshop = {
    ...input,
    title,
    hostName: input.hostName.trim(),
    place: input.place.trim(),
    id: Math.max(0, ...db.workshops.map((w) => w.id)) + 1,
  }
  db.workshops.push(w)
  save()
  return toWorkshop(w)
}

export async function listReservationsOf(workshopId: number): Promise<Reservation[]> {
  await wait()
  findWorkshop(workshopId)
  return db.reservations
    .filter((r) => r.workshopId === workshopId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(toReservation)
}

// ── 예약 ───────────────────────────────────────

export async function createReservation(workshopId: number, input: ReservationInput): Promise<Reservation> {
  await wait()
  const w = findWorkshop(workshopId)

  // 1) 입력값 검증
  const e: Record<string, string> = {}
  const name = input.name.trim()
  if (!name || name.length > 20) e.name = '이름은 1~20자로 입력해 주세요.'
  const phone = normalizePhone(input.phone)
  if (!phone) e.phone = '휴대폰 번호 형식이 아니에요. (예: 010-1234-5678)'
  if (!isInt(input.headcount) || input.headcount < 1 || input.headcount > 4) e.headcount = '인원은 1~4명까지 신청할 수 있어요.'
  if (input.memo && input.memo.length > 200) e.memo = '요청사항은 200자 이하로 입력해 주세요.'
  if (Object.keys(e).length) throw invalid(e)

  // 2) 비즈니스 규칙
  if (isStarted(w)) throw conflict('이미 시작했거나 끝난 클래스는 예약할 수 없어요.')
  if (db.reservations.some((r) => r.workshopId === w.id && r.phone === phone && r.status === 'CONFIRMED'))
    throw conflict('이 번호로 이미 예약한 클래스예요. 내 예약에서 확인해 주세요.')
  const remaining = w.capacity - reservedCount(w.id)
  if (input.headcount > remaining)
    throw conflict(remaining === 0 ? '아쉽지만 자리가 모두 찼어요.' : `남은 자리가 ${remaining}석뿐이에요. 인원을 줄여 주세요.`)

  const reservation: SeedReservation = {
    id: Math.max(0, ...db.reservations.map((r) => r.id)) + 1,
    workshopId: w.id,
    code: newCode(),
    name,
    phone: phone!,
    headcount: input.headcount,
    memo: input.memo?.trim() || null,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    canceledAt: null,
  }
  db.reservations.push(reservation)
  save()
  return toReservation(clone(reservation))
}

function findMine(code: string, phone: string): SeedReservation {
  const normalized = normalizePhone(phone)
  const r = db.reservations.find((r) => r.code === code.trim().toUpperCase() && r.phone === normalized)
  if (!r) throw new ApiError(404, '예약을 찾을 수 없어요. 예약 코드와 전화번호를 확인해 주세요.')
  return r
}

export async function findReservation(code: string, phone: string): Promise<ReservationDetail> {
  await wait()
  return toDetail(findMine(code, phone))
}

export async function cancelReservation(code: string, phone: string): Promise<ReservationDetail> {
  await wait()
  const r = findMine(code, phone)
  if (r.status === 'CANCELED') throw conflict('이미 취소된 예약이에요.')
  if (isStarted(findWorkshop(r.workshopId))) throw conflict('시작한 클래스는 취소할 수 없어요.')
  r.status = 'CANCELED'
  r.canceledAt = new Date().toISOString()
  save()
  return toDetail(r)
}

/** 개발용: Mock 데이터를 처음 상태로 되돌립니다. */
export function resetMock() {
  db = fresh()
  save()
}
