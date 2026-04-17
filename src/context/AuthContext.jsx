import { useEffect, useState } from 'react'
import {
  auth,
  googleProvider,
  signInWithPopup,
  firebaseConfigured,
} from '../firebaseConfig.js'
import { AuthContext } from './AuthContextObject.js'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('authUser')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(localStorage.getItem('authToken'))
  const [loading, setLoading] = useState(true)

  const baseUrl = import.meta.env.VITE_API_URL

  // ✅ Verify token
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${baseUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error()

        const data = await res.json()
        setUser(data.user)
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [])

  // ✅ Sync user
  useEffect(() => {
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('authUser')
    }
  }, [user])

  // ✅ Sync token
  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token)
    } else {
      localStorage.removeItem('authToken')
    }
  }, [token])

  const saveToken = (newToken, userData) => {
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
  }

  const apiRequest = async (path, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({
        message: 'Request failed',
      }))
      throw new Error(err.message)
    }

    return res.json()
  }

  const signup = (payload) =>
    apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

  const login = async (payload) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    saveToken(data.token, data.user)
    return data
  }

  // ✅ GOOGLE LOGIN (fully stable)
  const googleLogin = async () => {
    if (!firebaseConfigured || !auth || !googleProvider) {
      throw new Error('Firebase not configured properly')
    }

    try {
      const result = await signInWithPopup(auth, googleProvider)

      const profile = result.user
      const email = profile.email

      if (!email) throw new Error('Google email not found')

      const name =
        profile.displayName || email.split('@')[0] || 'Google User'

      const data = await apiRequest('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ name, email }),
      })

      saveToken(data.token, data.user)
      return data
    } catch (error) {
      console.error('Google Login Error:', error)

      const code = error?.code

      if (code === 'auth/popup-closed-by-user') {
        throw new Error('Popup closed')
      }

      if (code === 'auth/popup-blocked') {
        throw new Error('Enable popups')
      }

      if (code === 'auth/unauthorized-domain') {
        throw new Error('Unauthorized domain in Firebase')
      }

      if (code === 'auth/invalid-api-key') {
        throw new Error('Invalid Firebase API key')
      }

      if (code === 'auth/network-request-failed') {
        throw new Error('Network issue')
      }

      throw new Error(error.message || 'Google login failed')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        googleLogin,
        googleAvailable: firebaseConfigured,
        logout,
        apiRequest,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider