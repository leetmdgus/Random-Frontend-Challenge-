import type { Category, PostStatus, PostType, SortOrder } from './types'

export const TYPE_LABEL: Record<PostType, string> = {
  FOUND: '주웠어요',
  LOST: '잃어버렸어요',
}

export const STATUS_LABEL: Record<PostStatus, string> = {
  OPEN: '찾는 중',
  RESOLVED: '해결됨',
}

export const CATEGORY_LABEL: Record<Category, string> = {
  ELECTRONICS: '📱 전자기기',
  WALLET: '👛 지갑·카드',
  KEY: '🔑 열쇠',
  BAG: '🎒 가방',
  CLOTHING: '🧣 의류·잡화',
  ETC: '📦 기타',
}

export const SORT_LABEL: Record<SortOrder, string> = {
  latest: '최신 등록순',
  oldest: '오래된 등록순',
}

export const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[]
