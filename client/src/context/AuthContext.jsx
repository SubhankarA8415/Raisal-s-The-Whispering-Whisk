import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import {
  getCurrentUser,
  logout as logoutUser,
} from '../services/authService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadUser() {
    setLoading(true)

    try {
      const response = await getCurrentUser()
      setUser(response.data.user)
    } catch (error) {
      // A missing/expired session is an expected anonymous state.
      // Other background-check failures are also kept local so a
      // visitor never sees a startup error popup just because the
      // session probe could not complete.
      if (error?.status === 401 || error?.status === 403) {
        setUser(null)
      } else {
        console.error('Initial authentication check failed:', error)
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    await logoutUser()
    setUser(null)
  }

  useEffect(() => {
    loadUser()
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.user_type === 'admin',
    isAuthorizedAdmin:
      user?.user_type === 'admin' &&
      user?.is_authorized === true,
    setUser,
    loadUser,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    )
  }

  return context
}