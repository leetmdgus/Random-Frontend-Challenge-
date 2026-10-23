import { Link, NavLink, Route, Routes } from 'react-router-dom'
import { API_BASE_URL, USE_MOCK } from './api/client'
import { resetMock } from './mock/store'
import ListPage from './pages/ListPage'
import DetailPage from './pages/DetailPage'
import MyReservationPage from './pages/MyReservationPage'
import HostNewPage from './pages/HostNewPage'
import HostWorkshopPage from './pages/HostWorkshopPage'
import NotFound from './components/NotFound'

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">
          하루<span>공방</span>
        </Link>
        <nav className="nav">
          <NavLink to="/" end>
            클래스
          </NavLink>
          <NavLink to="/my">내 예약</NavLink>
          <NavLink to="/host/new" className="nav-host">
            호스트 · 클래스 열기
          </NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/workshops/:id" element={<DetailPage />} />
          <Route path="/my" element={<MyReservationPage />} />
          <Route path="/host/new" element={<HostNewPage />} />
          <Route path="/host/workshops/:id" element={<HostWorkshopPage />} />
          <Route path="*" element={<NotFound message="없는 페이지예요." />} />
        </Routes>
      </main>

      <footer className="footer">
        {USE_MOCK ? (
          <>
            <span className="mode mode-mock">MOCK</span> 브라우저에 저장된 가짜 데이터를 사용 중
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
            <span className="mode mode-api">API</span> {API_BASE_URL}
          </>
        )}
      </footer>
    </div>
  )
}
