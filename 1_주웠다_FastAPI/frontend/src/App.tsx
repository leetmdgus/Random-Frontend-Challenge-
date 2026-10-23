import { Link, Route, Routes } from 'react-router-dom'
import { API_BASE_URL, USE_MOCK } from './api/client'
import { resetMock } from './mock/store'
import ListPage from './pages/ListPage'
import DetailPage from './pages/DetailPage'
import FormPage from './pages/FormPage'

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">
          <span className="logo-pin" aria-hidden>📌</span>
          주웠다
        </Link>
        <p className="tagline">우리 동네 분실물 게시판</p>
        <Link to="/posts/new" className="btn btn-primary">
          ✏️ 글 붙이기
        </Link>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/posts/new" element={<FormPage />} />
          <Route path="/posts/:id" element={<DetailPage />} />
          <Route path="/posts/:id/edit" element={<FormPage />} />
          <Route path="*" element={<p className="state">없는 페이지예요. <Link to="/">게시판으로</Link></p>} />
        </Routes>
      </main>

      <footer className="footer">
        {USE_MOCK ? (
          <>
            <span className="mode mode-mock">MOCK 모드</span> 브라우저에 저장된 가짜 데이터를 사용 중
            <button
              className="link-btn"
              onClick={() => {
                resetMock()
                location.reload()
              }}
            >
              Mock 초기화
            </button>
          </>
        ) : (
          <>
            <span className="mode mode-api">API 모드</span> {API_BASE_URL}
          </>
        )}
      </footer>
    </div>
  )
}
