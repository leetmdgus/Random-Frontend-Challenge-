// 화면이 사용하는 데이터 모양입니다.
// 백엔드 응답 모양이 다르면 이 타입을 바꾸기보다 src/api/posts.ts 에서 변환하는 것을 권장합니다.

export type PostType = 'FOUND' | 'LOST'
export type PostStatus = 'OPEN' | 'RESOLVED'
export type Category = 'ELECTRONICS' | 'WALLET' | 'KEY' | 'BAG' | 'CLOTHING' | 'ETC'
export type SortOrder = 'latest' | 'oldest'

export interface Post {
  id: number
  type: PostType
  title: string
  description: string
  category: Category
  place: string
  /** 줍거나 잃어버린 날짜 (YYYY-MM-DD) */
  date: string
  /** 연락 방법 (선택) */
  contact: string | null
  status: PostStatus
  createdAt: string
  updatedAt: string
}

/** 글 작성 / 수정 폼에서 보내는 값 */
export interface PostInput {
  type: PostType
  title: string
  description: string
  category: Category
  place: string
  date: string
  contact: string | null
}

/** 목록 화면의 검색 · 필터 · 정렬 · 페이지 조건 */
export interface PostListQuery {
  keyword?: string
  type?: PostType
  category?: Category
  status?: PostStatus
  sort: SortOrder
  page: number
  size: number
}

export interface PostPage {
  items: Post[]
  total: number
  page: number
  size: number
}
