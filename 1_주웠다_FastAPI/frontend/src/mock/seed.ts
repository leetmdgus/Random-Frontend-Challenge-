import type { Category, Post, PostStatus, PostType } from '../types'

type Seed = [PostType, Category, string, string, string, string, string | null, PostStatus]

const rows: Seed[] = [
  ['FOUND', 'KEY', '자동차 스마트키 주웠어요', '파란색 키링이 달린 현대차 스마트키예요. 경비실에 맡겨 두었습니다.', '햇살아파트 103동 앞 벤치', '2026-10-22', '경비실 문의', 'OPEN'],
  ['LOST', 'WALLET', '갈색 반지갑 찾습니다', '안에 학생증과 교통카드가 있어요. 사례하겠습니다 🙏', '중앙시장 떡볶이 골목', '2026-10-21', '오픈채팅 "갈색지갑"', 'OPEN'],
  ['FOUND', 'ELECTRONICS', '에어팟 프로 한쪽(오른쪽)', '케이스 없이 오른쪽 한쪽만 떨어져 있었어요.', '2번 마을버스 정류장', '2026-10-21', null, 'OPEN'],
  ['LOST', 'CLOTHING', '체크무늬 머플러를 잃어버렸어요', '버버리 스타일 베이지 체크 머플러입니다. 할머니께 받은 선물이에요.', '동네 도서관 2층 열람실', '2026-10-20', '010-****-1234 (문자)', 'OPEN'],
  ['FOUND', 'BAG', '아이 유치원 가방', '노란색 공룡 그림 가방, 이름표에 "하율"이라고 적혀 있어요.', '놀이터 미끄럼틀 옆', '2026-10-19', '편의점 GS 사장님께 맡김', 'RESOLVED'],
  ['FOUND', 'ETC', '우산 (남색 장우산)', '비 오던 날 카페 앞에 꽂혀 있었습니다. 일주일 지나면 기부할게요.', '모퉁이카페 입구', '2026-10-18', null, 'OPEN'],
  ['LOST', 'ELECTRONICS', '갤럭시 워치 (검정 스트랩)', '조깅하다가 풀린 것 같아요. 하천 산책로 어딘가에 있을 거예요.', '개천 산책로 징검다리 근처', '2026-10-17', '댓글 대신 문자 주세요', 'OPEN'],
  ['FOUND', 'WALLET', '교통카드 한 장', '캐릭터 스티커가 붙은 티머니 카드예요.', '지하철 3번 출구 계단', '2026-10-16', null, 'RESOLVED'],
  ['LOST', 'KEY', '현관 열쇠 꾸러미', '열쇠 3개 + 고양이 모양 키링. 집에 못 들어가고 있어요 ㅠㅠ', '세탁소 ~ 빵집 사이 골목', '2026-10-15', '빵집 사장님께 전달 부탁드려요', 'OPEN'],
  ['FOUND', 'CLOTHING', '아기 신발 한 짝', '분홍색 아기 운동화 왼쪽 한 짝입니다. 담장 위에 올려 두었어요.', '초록빌라 담장', '2026-10-14', null, 'OPEN'],
  ['LOST', 'BAG', '검정 에코백 (책 3권)', '도서관 책이 들어 있어서 꼭 찾아야 해요.', '동네 도서관 앞 자전거 거치대', '2026-10-12', null, 'RESOLVED'],
  ['FOUND', 'ELECTRONICS', '보조배터리 (흰색)', '카페 콘센트 옆에 꽂혀 있었어요. 카운터에 맡겼어요.', '모퉁이카페 창가 자리', '2026-10-11', '카페 카운터', 'OPEN'],
  ['LOST', 'ETC', '강아지 목줄 (빨간색)', '산책 중 풀려서 떨어뜨렸어요. 이름표에 "콩이".', '근린공원 잔디밭', '2026-10-09', null, 'OPEN'],
  ['FOUND', 'KEY', '자전거 자물쇠 열쇠', '작은 열쇠 하나, 노란 플라스틱 손잡이.', '자전거 거치대 아래', '2026-10-08', null, 'OPEN'],
]

export const SEED_POSTS: Post[] = rows.map(([type, category, title, description, place, date, contact, status], i) => {
  const createdAt = new Date(`${date}T09:00:00`).toISOString()
  return { id: rows.length - i, type, category, title, description, place, date, contact, status, createdAt, updatedAt: createdAt }
})
