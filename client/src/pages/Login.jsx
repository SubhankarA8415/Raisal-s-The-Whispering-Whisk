import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import Button from '../components/common/Button'
import AuthPageShell from '../components/auth/AuthPageShell'
import PasswordField from '../components/auth/PasswordField'
import {
  login,
  loginWithGoogle,
  consumePostLoginRedirect,
} from '../services/authService'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuth()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    if (error) setError('')
  }

  function getDestination() {
    const from = location.state?.from

    return consumePostLoginRedirect(
      from
        ? `${from.pathname}${from.search}${from.hash}`
        : '/',
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      setLoading(true)

      const response = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })

      setUser(response.data.user)

      navigate(getDestination(), {
        replace: true,
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const destination = (() => {
    const from = location.state?.from

    return from
      ? `${from.pathname}${from.search}${from.hash}`
      : '/'
  })()

  return (
    <AuthPageShell
      eyebrow="Welcome back"
      title="Sign in"
      description="Access your Raisal's The Whispering Whisk account and continue where you left off."
      footer={
        <>
          New to Raisal's The Whispering Whisk?{' '}
          <Link
            to="/register"
            state={location.state}
            className="font-semibold text-[var(--color-primary)] transition hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold">
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            autoFocus
            required
            className="w-full rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 outline-none transition-all duration-300 placeholder:text-[var(--color-text-muted)] placeholder:opacity-50 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <label htmlFor="password" className="text-sm font-semibold">
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-[var(--color-primary)] transition hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <PasswordField
            id="password"
            name="password"
            label=""
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
          >
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          or
        </span>
        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={() => loginWithGoogle(destination)}
        className="w-full"
      >
        Continue with Google
      </Button>

      <p className="mt-5 text-center text-xs text-[var(--color-text-muted)]">
        Your account is protected by secure session-based sign-in.
      </p>
    </AuthPageShell>
  )
}

export default Login
