import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Menu from './pages/Menu'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import AdminMenu from './pages/AdminMenu'
import AdminProductEditor from './pages/AdminProductEditor'
import AdminBakeryReviews from './pages/AdminBakeryReviews'

import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'

import Account from './pages/Account'
import AdminDashboard from './pages/AdminDashboard'
import Reviews from './pages/Reviews'
import About from './pages/About'
import AdminAbout from './pages/AdminAbout'

import MainLayout from './components/layout/MainLayout'

import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import PublicOnlyRoute from './components/auth/PublicOnlyRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ============================================
            MAIN APPLICATION LAYOUT
            ============================================ */}

        <Route element={<MainLayout />}>

          {/* ============================================
              PUBLIC PAGES
              ============================================ */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/about" element={<About />} />

          {/* ============================================
              AUTHENTICATED PAGES
              ============================================ */}

          <Route element={<ProtectedRoute />}>

            <Route
              path="/account"
              element={<Account />}
            />

          </Route>

          {/* ============================================
              ADMIN PAGES
              ============================================ */}

          <Route element={<AdminRoute />}>

            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/menu" element={<AdminMenu />} />
            <Route path="/admin/menu/:id" element={<AdminProductEditor />} />
            <Route path="/admin/reviews" element={<AdminBakeryReviews />} />
            <Route path="/admin/about" element={<AdminAbout />} />

          </Route>

        </Route>

        {/* ============================================
            AUTHENTICATION PAGES
            ============================================ */}

        <Route element={<PublicOnlyRoute />}>

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

        </Route>

        {/* ============================================
            PASSWORD RECOVERY
            ============================================ */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Frontend 404 */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App