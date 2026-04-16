import { useEffect, useState } from 'react'
import { auth, googleProvider, signInWithPopup } from '../firebaseConfig.js'
import { AuthContext } from './AuthContextObject.js'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('authUser')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('authToken'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const verifyToken = async () => {
      if (!storedToken) {
        localStorage.removeItem('authUser')
        setUser(null)
        setToken(null)
        setLoading(false)
        return
      }

      const baseUrl = import.meta.env.VITE_API_URL || ''
      try {
        const response = await fetch(`${baseUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })

        if (!response.ok) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('authUser')
          setUser(null)
          setToken(null)
          setLoading(false)
          return
        }

        const data = await response.json()
        setUser(data.user)
      } catch {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('authUser')
    }
  }, [user])

  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token)
    } else {
      localStorage.removeItem('authToken')
    }
  }, [token])

  const saveToken = (newToken, userData) => {
    if (newToken) {
      localStorage.setItem('authToken', newToken)
    } else {
      localStorage.removeItem('authToken')
    }

    if (userData) {
      localStorage.setItem('authUser', JSON.stringify(userData))
    } else {
      localStorage.removeItem('authUser')
    }

    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    setToken(null)
    setUser(null)
  }

  const apiRequest = async (path, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }

    const authToken = token || localStorage.getItem('authToken')
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }

    const baseUrl = import.meta.env.VITE_API_URL || ''
    const url = `${baseUrl}${path}`

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(errorData.message || 'Request failed')
    }

    return response.json()
  }

  const signup = async (payload) => {
    const data = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return data
  }

  const login = async (payload) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    saveToken(data.token, data.user)
    return data
  }

  const googleLogin = async () => {
    const requiredFirebaseVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_APP_ID',
    ]

    const missingVars = requiredFirebaseVars.filter((key) => !import.meta.env[key])
    if (missingVars.length > 0) {
      throw new Error(
        `Google authentication is not configured. Missing env vars: ${missingVars.join(', ')}.`
      )
    }

    let result
    try {
      result = await signInWithPopup(auth, googleProvider)
    } catch (error) {
      throw new Error(error.message || 'Google sign-in failed. Please try again.')
    }

    const profile = result.user
    const name = profile.displayName || profile.email?.split('@')[0] || 'Google User'
    const email = profile.email

    if (!email) {
      throw new Error('Google account email is required.')
    }

    const data = await apiRequest('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    })

    saveToken(data.token, data.user)
    return data
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
        apiRequest,
        login,
        signup,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
