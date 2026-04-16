import { useContext } from 'react'
import { AuthContext } from './AuthContextObject.js'

export const useAuth = () => useContext(AuthContext)
