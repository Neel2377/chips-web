import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'

const Login = () => {
  const { isAuthenticated, isAdmin, login, googleLogin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [redirectTarget, setRedirectTarget] = useState('')

  useEffect(() => {
    if (redirectTarget && isAuthenticated) {
      navigate(redirectTarget, { replace: true })
    }
  }, [redirectTarget, isAuthenticated, navigate])

  if (authLoading) {
    return (
      <div className="auth-page container py-5">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-8 col-lg-6 text-center">
            <div className="auth-card rounded-4 shadow-lg p-5">
              <div className="spinner-border text-warning mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mb-0">Checking authentication...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/profile'} replace />
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
      const data = await login(form)
      setRedirectTarget(data.user.role === 'admin' ? '/admin' : '/profile')
    } catch (submitError) {
      setError(submitError.message || 'Unable to log in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)

    try {
      const data = await googleLogin()
      setRedirectTarget(data.user.role === 'admin' ? '/admin' : '/profile')
    } catch (googleError) {
      setError(googleError.message || 'Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="auth-page container py-5">
      <div className="row justify-content-center">
        <div className="col-sm-10 col-md-8 col-lg-6">
          <div className="card auth-card rounded-4 shadow-lg p-5">
            <span className="eyebrow">Welcome back</span>
            <h2 className="text-white mb-3">Login</h2>
            <p className="text-white mb-4">Sign in to access your account, order history, and admin tools.</p>
            {error && <div className="alert alert-danger">{error}</div>}
            <button
              type="button"
              className="btn btn-outline-light btn-lg w-100 mb-3"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
            </button>
            <div className="text-center text-muted mb-4">or login with email</div>
            <form onSubmit={handleSubmit}>
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
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>
            <p className="mt-4 mb-0 text-center text-muted">
              <span className='text-white mx-1'>New here?</span> 
              <Link to="/signup">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
