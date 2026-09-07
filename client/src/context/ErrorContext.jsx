import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import { API_ERROR_EVENT } from '../lib/errorEvents.js'

const ErrorContext = createContext(null)

function getFriendlyMessage(error) {
  if (error?.isNetworkError) {
    return 'We could not connect to the server. Please check your internet connection and try again.'
  }

  if (error?.code === 'INTERNAL_SERVER_ERROR') {
    return 'We could not complete that request right now. Please try again.'
  }

  if (error?.code === 'VALIDATION_ERROR' && error?.fields) {
    const details = Object.values(error.fields).filter(Boolean)

    if (details.length > 0) {
      return details.join(' ')
    }
  }

  return (
    error?.message ||
    'Something went wrong. Please try again.'
  )
}

function getErrorTitle(error) {
  const titles = {
    INVALID_CREDENTIALS: 'Unable to sign in',
    EMAIL_EXISTS: 'Unable to create account',
    VALIDATION_ERROR: 'Please check your information',
    NETWORK_ERROR: 'Connection problem',
    NOT_AUTHENTICATED: 'Authentication required',
    INVALID_SESSION: 'Session expired',
    ADMIN_ACCESS_REQUIRED: 'Admin access required',
    ADMIN_NOT_AUTHORIZED: 'Admin access restricted',
    NOT_AN_ADMIN: 'Invalid admin action',
    SELF_ADMIN_MODIFICATION: 'Action not allowed',
    BOOTSTRAP_ALREADY_COMPLETED: 'Admin setup already completed',
    PASSWORD_RESET_RATE_LIMITED: 'Too many reset requests',
    AUTH_RATE_LIMITED: 'Too many attempts',
    INVALID_RESET_TOKEN: 'Invalid reset link',
    RESET_TOKEN_USED: 'Reset link already used',
    RESET_TOKEN_EXPIRED: 'Reset link expired',
    PASSWORD_RESET_NOT_AVAILABLE: 'Password reset unavailable',
    USER_NOT_FOUND: 'User not found',
    CORS_ORIGIN_NOT_ALLOWED: 'Request blocked',
    INTERNAL_SERVER_ERROR: 'Something went wrong',
    RESOURCE_ALREADY_EXISTS: 'Already exists',
  }

  return (
    titles[error?.code] ||
    'Something went wrong'
  )
}

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  const clearError = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    setError(null)
  }, [])

  const showError = useCallback((value) => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }

    const normalized =
      value instanceof Error
        ? value
        : new Error(String(value || 'Something went wrong.'))

    setError({
      title: getErrorTitle(normalized),
      message: getFriendlyMessage(normalized),
      code: normalized.code || null,
      status: normalized.status || null,
    })

    timerRef.current = window.setTimeout(() => {
      setError(null)
      timerRef.current = null
    }, 6500)
  }, [])

  useEffect(() => {
    function handleApiError(event) {
      showError(event.detail)
    }

    window.addEventListener(
      API_ERROR_EVENT,
      handleApiError,
    )

    return () => {
      window.removeEventListener(
        API_ERROR_EVENT,
        handleApiError,
      )

      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [showError])

  return (
    <ErrorContext.Provider
      value={{
        error,
        showError,
        clearError,
      }}
    >
      {children}

      {error && (
        <div
          className="fixed inset-x-4 top-5 z-[100] flex justify-center sm:inset-x-auto sm:right-6 sm:w-[min(440px,calc(100vw-3rem))]"
          role="alert"
          aria-live="assertive"
        >
          <div className="w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_20px_60px_rgba(61,41,35,0.22)]">
            <div className="h-1 w-full bg-[var(--color-accent)]" />

            <div className="p-5">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 text-lg font-bold text-[var(--color-accent-foreground)]"
                  aria-hidden="true"
                >
                  !
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-[var(--color-text)]">
                    {error.title}
                  </p>

                  <p className="mt-1.5 text-sm leading-6 text-[var(--color-text-muted)]">
                    {error.message}
                  </p>

                  {error.code && (
                    <div className="mt-3 inline-flex rounded-md bg-[var(--color-background)] px-2.5 py-1">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)] opacity-70">
                        Reference&nbsp; {error.code}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={clearError}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl leading-none text-[var(--color-text-muted)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-text)]"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="h-0.5 w-full bg-[var(--color-accent)]/10">
              <div className="h-full w-full origin-left animate-[errorProgress_6.5s_linear_forwards] bg-[var(--color-accent)]/40" />
            </div>
          </div>
        </div>
      )}
    </ErrorContext.Provider>
  )
}

export function useError() {
  const context = useContext(ErrorContext)

  if (!context) {
    throw new Error(
      'useError must be used inside ErrorProvider',
    )
  }

  return context
}
