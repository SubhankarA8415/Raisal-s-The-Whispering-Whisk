import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { setPostLoginRedirect } from '../../services/authService'

function AdminRoute() {
  const {
    loading,
    isAuthenticated,
    isAdmin,
    isAuthorizedAdmin,
  } = useAuth()

  // Wait for /api/auth/me
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm opacity-60">
          Loading...
        </p>
      </div>
    )
  }

  // Not logged in
  if (!isAuthenticated) {
    setPostLoginRedirect('/admin')

    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: '/admin' } }}
      />
    )
  }

  // Logged in but not an admin.
  if (!isAdmin || !isAuthorizedAdmin) {
    return (
      <Navigate
        to="/account"
        replace
      />
    )
  }

  // Authorized admin
  return <Outlet />
}

export default AdminRoute