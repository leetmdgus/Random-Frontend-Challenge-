import { Link } from 'react-router-dom'

export default function NotFound({ message }: { message: string }) {
  return (
    <div className="state">
      <p className="state-icon">🫙</p>
      <p className="state-title">{message}</p>
      <Link to="/" className="btn">
        클래스 둘러보기
      </Link>
    </div>
  )
}
