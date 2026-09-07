import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import Navbar from './Navbar'
import Footer from './Footer'
import { consumePostLoginRedirect } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { BakeryProvider } from '../../context/BakeryContext.jsx'
import BakeryClosureNotice from '../common/BakeryClosureNotice.jsx'

function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (loading || !isAuthenticated) {
      return
    }

    const isHome =
      location.pathname === '/' &&
      location.search === '' &&
      location.hash === ''

    if (!isHome) {
      return
    }

    const destination = consumePostLoginRedirect('/')

    if (destination !== '/') {
      navigate(destination, { replace: true })
    }
  }, [loading, isAuthenticated, location.pathname, location.search, location.hash, navigate])

  return (
    <BakeryProvider>
      <Navbar />
      <BakeryClosureNotice />
      <Outlet />
      <Footer />
    </BakeryProvider>
  )
}

export default MainLayout
