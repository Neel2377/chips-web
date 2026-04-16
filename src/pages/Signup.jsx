import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Signup = () => {
  const { isAuthenticated, loading: authLoading, signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [redirectTarget, setRedirectTarget] = useState('')

  useEffect(() => {
    if (redirectTarget) {
      navigate(redirectTarget, { replace: true })
    }
  }, [redirectTarget, navigate])

  if (authLoading) {
    return (
      <div className="auth-page container py-5">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-8 col-lg-6 text-center">
            <div className="auth-card rounded-4 shadow-lg p-5">
              <div className="spinner-border text-warning mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mb-0">Checking authentication...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signup(form)
      setRedirectTarget('/login')
    } catch (submitError) {
      setError(submitError.message || 'Unable to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page container py-5">
      <div className="row justify-content-center">
        <div className="col-sm-10 col-md-8 col-lg-6">
          <div className="card auth-card rounded-4 shadow-lg p-5">
            <span className="eyebrow">Create access</span>
            <h2 className="text-white mb-3">Create account</h2>
            <p className="text-white mb-4">Register a new user to start browsing chips, ordering, and managing your profile.</p>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Create a password"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
                {loading ? 'Creating account...' : 'Signup'}
              </button>
            </form>
            <p className="mt-4 mb-0 text-center text-muted">
              <span className='text-white mx-1'>Already have an account?</span> <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
