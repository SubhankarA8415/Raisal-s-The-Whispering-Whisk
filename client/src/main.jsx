import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'

import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ErrorProvider } from './context/ErrorContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

import ErrorBoundary from './components/common/ErrorBoundary.jsx'

import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ErrorProvider>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </ErrorProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
