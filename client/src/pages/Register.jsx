import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import Button from '../components/common/Button'
import AuthPageShell from '../components/auth/AuthPageShell'
import PasswordField from '../components/auth/PasswordField'
import {
  register,
  loginWithGoogle,
  consumePostLoginRedirect,
} from '../services/authService'
import { useAuth } from '../context/AuthContext'

const inputClass =
  'w-full rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 outline-none transition-all duration-300 placeholder:text-[var(--color-text-muted)] placeholder:opacity-50 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10'

function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuth()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordState = useMemo(() => ({
    length: form.password.length >= 8 && form.password.length <= 128,
    matches:
      form.confirmPassword.length > 0 &&
      form.password === form.confirmPassword,
  }), [form.password, form.confirmPassword])

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

    const trimmedName = form.name.trim()
    const normalizedEmail = form.email.trim().toLowerCase()

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setError('Name must be between 2 and 100 characters.')
      return
    }

    if (!passwordState.length) {
      setError('Password must be between 8 and 128 characters.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      const response = await register({
        name: trimmedName,
        email: normalizedEmail,
        password: form.password,
      })

      setUser(response.data.user)

      navigate(getDestination(), { replace: true })
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
      eyebrow="Join the bakery"
      title="Create your account"
      description="Create your Raisal's The Whispering Whisk account to keep your details and future orders connected in one place."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            state={location.state}
            className="font-semibold text-[var(--color-primary)] transition hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-semibold">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            required
            maxLength={100}
            className={inputClass}
            placeholder="Your name"
          />
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            This is the name we'll use for your account.
          </p>
        </div>

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
            required
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>

        <PasswordField
          id="password"
          name="password"
          label="Password"
          value={form.password}
          onChange={handleChange}
          placeholder="Create a password"
          describedBy="register-password-help"
          showRequirement
        />

        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your password"
          error={
            form.confirmPassword.length > 0 &&
            !passwordState.matches
          }
        />

        {form.password && (
          <div
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3"
            aria-live="polite"
          >
            <p className="mb-2 text-xs font-semibold text-[var(--color-text)]">
              Password check
            </p>

            <div className="grid gap-1.5 text-xs sm:grid-cols-2">
              <p className={passwordState.length ? 'text-[var(--color-veg-text)]' : 'text-[var(--color-text-muted)]'}>
                {passwordState.length ? '✓' : '○'} 8–128 characters
              </p>
              <p className={passwordState.matches ? 'text-[var(--color-veg-text)]' : 'text-[var(--color-text-muted)]'}>
                {passwordState.matches ? '✓' : '○'} Passwords match
              </p>
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
          >
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating account…' : 'Create account'}
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

      <p className="mt-5 text-center text-xs leading-5 text-[var(--color-text-muted)]">
        By creating an account, you agree to use Raisal's The Whispering Whisk services responsibly.
      </p>
    </AuthPageShell>
  )
}

export default Register
