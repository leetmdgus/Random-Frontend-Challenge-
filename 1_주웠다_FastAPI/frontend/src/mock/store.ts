// Mock 저장소. 브라우저 localStorage 에 저장되며, 백엔드가 생기면 쓰지 않습니다.
// 실제 서버에서 겪을 상황(지연, 404, 422 검증 실패)을 흉내 냅니다.
import { ApiError } from '../api/client'
import { SEED_POSTS } from './seed'
import type { Post, PostInput, PostListQuery, PostPage, PostStatus } from '../types'

const STORAGE_KEY = 'juwotda.mock.posts'
const DELAY_MS = 350

function load(): Post[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Post[]
  } catch {
    /* 저장소를 쓸 수 없으면 시드 데이터로 시작 */
  }
  return structuredClone(SEED_POSTS)
}

let posts = load()

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  } catch {
    /* 무시 */
  }
}

const wait = <T,>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), DELAY_MS))

function findOrThrow(id: number): Post {
  const post = posts.find((p) => p.id === id)
  if (!post) throw new ApiError(404, '게시글을 찾을 수 없어요.')
  return post
}

function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 서버의 요청 검증을 흉내 냅니다. 화면은 일부러 검증을 거의 하지 않습니다. */
function validate(input: PostInput) {
  const errors: Record<string, string> = {}
  const title = input.title.trim()
  if (title.length < 2 || title.length > 40) errors.title = '제목은 2~40자로 입력해 주세요.'
  if (input.description.length > 500) errors.description = '설명은 500자 이하로 입력해 주세요.'
  if (!input.place.trim()) errors.place = '장소를 입력해 주세요.'
  else if (input.place.length > 50) errors.place = '장소는 50자 이하로 입력해 주세요.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) errors.date = '날짜를 선택해 주세요.'
  else if (input.date > today()) errors.date = '미래 날짜는 선택할 수 없어요.'
  if (input.contact && input.contact.length > 50) errors.contact = '연락 방법은 50자 이하로 입력해 주세요.'
  if (Object.keys(errors).length) throw new ApiError(422, '입력값을 다시 확인해 주세요.', errors)
}

function normalize(input: PostInput): PostInput {
  return {
    ...input,
    title: input.title.trim(),
    place: input.place.trim(),
    contact: input.contact?.trim() || null,
  }
}

export async function listPosts(q: PostListQuery): Promise<PostPage> {
  const keyword = q.keyword?.trim().toLowerCase()
  let result = posts.filter(
    (p) =>
      (!q.type || p.type === q.type) &&
      (!q.category || p.category === q.category) &&
      (!q.status || p.status === q.status) &&
      (!keyword || `${p.title} ${p.description} ${p.place}`.toLowerCase().includes(keyword)),
  )
  result = [...result].sort((a, b) =>
    q.sort === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt),
  )
  const start = (q.page - 1) * q.size
  return wait({ items: result.slice(start, start + q.size), total: result.length, page: q.page, size: q.size })
}

export async function getPost(id: number): Promise<Post> {
  await wait(null)
  return structuredClone(findOrThrow(id))
}

export async function createPost(input: PostInput): Promise<Post> {
  await wait(null)
  validate(input)
  const now = new Date().toISOString()
  const post: Post = {
    ...normalize(input),
    id: Math.max(0, ...posts.map((p) => p.id)) + 1,
    status: 'OPEN',
    createdAt: now,
    updatedAt: now,
  }
  posts.push(post)
  save()
  return structuredClone(post)
}

export async function updatePost(id: number, input: PostInput): Promise<Post> {
  await wait(null)
  const post = findOrThrow(id)
  validate(input)
  Object.assign(post, normalize(input), { updatedAt: new Date().toISOString() })
  save()
  return structuredClone(post)
}

export async function changeStatus(id: number, status: PostStatus): Promise<Post> {
  await wait(null)
  const post = findOrThrow(id)
  post.status = status
  post.updatedAt = new Date().toISOString()
  save()
  return structuredClone(post)
}

export async function deletePost(id: number): Promise<void> {
  await wait(null)
  findOrThrow(id)
  posts = posts.filter((p) => p.id !== id)
  save()
}

/** 개발용: Mock 데이터를 처음 상태로 되돌립니다. */
export function resetMock() {
  posts = structuredClone(SEED_POSTS)
  save()
}
