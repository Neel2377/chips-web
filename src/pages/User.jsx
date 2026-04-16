import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const User = () => {
  const { user, isAdmin } = useAuth()

  return (
    <div className="container py-5">
      <div className="card shadow-sm rounded-4 p-4">
        <h1 className="mb-3">Welcome back, {user?.name || 'valued customer'}!</h1>
        <p className="lead mb-4">You are signed in as <strong>{user?.role}</strong>.</p>
        <div className="d-flex flex-wrap gap-3">
          <Link className="btn btn-primary btn-lg" to="/chips">
            Browse chips
          </Link>
          <Link className="btn btn-outline-primary btn-lg" to="/orders">
            View my orders
          </Link>
          {isAdmin && (
            <Link className="btn btn-outline-secondary btn-lg" to="/admin">
              Go to admin dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default User
