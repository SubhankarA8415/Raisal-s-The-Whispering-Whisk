import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import Button from '../components/common/Button'
import AuthPageShell from '../components/auth/AuthPageShell'
import PasswordField from '../components/auth/PasswordField'
import { resetPassword } from '../services/authService'

function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('This password reset link is missing its required token.')
    }
  }, [token])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    if (error) setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!token) {
      setError('This password reset link is invalid or incomplete.')
      return
    }

    if (form.password.length < 8 || form.password.length > 128) {
      setError('Password must be between 8 and 128 characters.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)
      await resetPassword({
        token,
        newPassword: form.password,
      })
      setSuccess(true)

      window.setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1800)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageShell
      eyebrow={success ? 'Password updated' : 'Account recovery'}
      title={success ? 'All done' : 'Create a new password'}
      description={
        success
          ? 'Your password has been changed successfully. You can now sign in with your new password.'
          : "Choose a new password for your Raisal's The Whispering Whisk account."
      }
      footer={
        <Link
          to="/login"
          className="font-semibold text-[var(--color-primary)] transition hover:underline"
        >
          Return to login
        </Link>
      }
    >
      {success ? (
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-veg-border)] bg-[var(--color-veg-surface)] text-2xl font-bold text-[var(--color-veg-text)]">
            ✓
          </div>

          <h2 className="mt-6 text-2xl">
            Password reset successful
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            Redirecting you to the login page…
          </p>

          <Link
            to="/login"
            className="mt-7 inline-flex rounded-[var(--radius-button)] bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
          >
            Go to login
          </Link>
        </div>
      ) : !token ? (
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-200 bg-red-50 text-xl font-bold text-red-600">
            !
          </div>

          <h2 className="mt-6 text-2xl">
            Invalid reset link
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            This link is missing the information required to reset your password.
          </p>

          <Link
            to="/forgot-password"
            className="mt-7 inline-flex rounded-[var(--radius-button)] bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
          >
            Request a new link
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3">
            <p className="text-xs font-semibold text-[var(--color-text)]">
              Password requirements
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
              Your new password must contain 8–128 characters. The reset link is one-time use and expires after 15 minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordField
              id="password"
              name="password"
              label="New password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a new password"
              describedBy="reset-password-help"
              showRequirement
            />

            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm new password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your new password"
              error={
                form.confirmPassword.length > 0 &&
                form.password !== form.confirmPassword
              }
            />

            {form.confirmPassword && (
              <p
                className={`text-xs font-medium ${
                  form.password === form.confirmPassword
                    ? 'text-[var(--color-veg-text)]'
                    : 'text-red-600'
                }`}
              >
                {form.password === form.confirmPassword
                  ? '✓ Passwords match'
                  : 'Passwords do not match'}
              </p>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
              >
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Resetting password…' : 'Reset password'}
            </Button>
          </form>
        </>
      )}
    </AuthPageShell>
  )
}

export default ResetPassword
