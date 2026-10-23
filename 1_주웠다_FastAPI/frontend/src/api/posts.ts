// ─────────────────────────────────────────────────────────────
//  백엔드 연결 지점
//  화면은 이 파일의 함수만 호출합니다.
//  VITE_USE_MOCK=false 로 바꾸면 TODO 부분이 실행되니,
//  직접 설계한 API 에 맞게 채워 주세요.
//
//  지켜 주면 화면이 그대로 동작하는 약속
//   - 성공 시 각 함수의 반환 타입대로 값을 돌려준다.
//   - 실패 시 ApiError 를 던진다. (request() 를 쓰면 자동)
//       · 404 → 상세/수정 화면이 "찾을 수 없음" 상태를 보여 준다.
//       · 422 → 폼이 fieldErrors 의 필드별 메시지를 입력칸 아래에 보여 준다.
//         필드 이름은 PostInput 의 키(title, place, date ...)와 같아야 한다.
// ─────────────────────────────────────────────────────────────
import { USE_MOCK, notConnected } from './client'
import * as mock from '../mock/store'
import type { Post, PostInput, PostListQuery, PostPage, PostStatus } from '../types'

/** 목록 화면: 검색어 · 종류 · 카테고리 · 상태 · 정렬 · 페이지 조건으로 글 목록을 가져온다. */
export async function fetchPosts(query: PostListQuery): Promise<PostPage> {
  if (USE_MOCK) return mock.listPosts(query)

  // TODO(백엔드 연결): 목록 조회
  //  - query 의 값 중 비어 있지 않은 것만 서버에 전달하세요.
  //  - 응답을 PostPage 모양으로 변환해 반환하세요.
  return notConnected('fetchPosts')
}

/** 상세 / 수정 화면: 글 하나를 가져온다. 없으면 404 ApiError. */
export async function fetchPost(id: number): Promise<Post> {
  if (USE_MOCK) return mock.getPost(id)

  // TODO(백엔드 연결): 단건 조회
  return notConnected('fetchPost')
}

/** 글쓰기 화면: 새 글을 등록하고, 등록된 글을 돌려받는다. */
export async function createPost(input: PostInput): Promise<Post> {
  if (USE_MOCK) return mock.createPost(input)

  // TODO(백엔드 연결): 등록
  return notConnected('createPost')
}

/** 수정 화면: 글 전체 내용을 바꾸고, 바뀐 글을 돌려받는다. */
export async function updatePost(id: number, input: PostInput): Promise<Post> {
  if (USE_MOCK) return mock.updatePost(id, input)

  // TODO(백엔드 연결): 수정
  return notConnected('updatePost')
}

/** 상세 화면: "주인 찾았어요" / "다시 찾는 중" 버튼. 상태만 바꾼다. */
export async function changePostStatus(id: number, status: PostStatus): Promise<Post> {
  if (USE_MOCK) return mock.changeStatus(id, status)

  // TODO(백엔드 연결): 상태 변경
  return notConnected('changePostStatus')
}

/** 상세 화면: 글을 삭제한다. 돌려받는 값은 없다. */
export async function deletePost(id: number): Promise<void> {
  if (USE_MOCK) return mock.deletePost(id)

  // TODO(백엔드 연결): 삭제
  return notConnected('deletePost')
}
