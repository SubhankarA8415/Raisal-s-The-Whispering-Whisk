import { useState } from 'react'
import { Link } from 'react-router-dom'

import Button from '../components/common/Button'
import AuthPageShell from '../components/auth/AuthPageShell'
import { forgotPassword } from '../services/authService'

const inputClass =
  'w-full rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 outline-none transition-all duration-300 placeholder:text-[var(--color-text-muted)] placeholder:opacity-50 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10'

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      setLoading(true)
      await forgotPassword(email.trim().toLowerCase())
      setSubmitted(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageShell
      eyebrow="Account recovery"
      title="Forgot your password?"
      description="Enter the email address associated with your account and we'll help you get back in."
      footer={
        <>
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-semibold text-[var(--color-primary)] transition hover:underline"
          >
            Back to login
          </Link>
        </>
      }
    >
      {submitted ? (
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-veg-border)] bg-[var(--color-veg-surface)] text-[var(--color-veg-text)]">
            <MailIcon />
          </div>

          <h2 className="mt-6 text-2xl">
            Check your inbox
          </h2>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
            If an account exists for that email, we've sent a password reset link.
          </p>

          <div className="mt-6 space-y-3 text-left">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-primary)]">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
                    <path d="m5 7 7 5 7-5" />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    Can't find the email?
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                    Check your{' '}
                    <span className="font-semibold text-[var(--color-text)]">
                      Spam / Junk
                    </span>{' '}
                    or{' '}
                    <span className="font-semibold text-[var(--color-text)]">
                      Promotions
                    </span>{' '}
                    folder. Gmail may place a new development sender there.
                  </p>

                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                    Search for
                  </p>

                  <div className="mt-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
                    <p className="break-words text-xs font-semibold text-[var(--color-primary)]">
                      Raisal's The Whispering Whisk Development Team
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] px-4 py-3 text-left">
              <p className="text-xs font-semibold text-[var(--color-text)]">
                Security note
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                For your security, this message is the same whether or not an
                account exists. The reset link expires after{' '}
                <span className="font-semibold">15 minutes</span> and can only
                be used once.
              </p>
            </div>
          </div>

          <Link
            to="/login"
            className="mt-7 inline-flex items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-primary)] hover:text-white"
          >
            Return to login
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
            <div className="mt-0.5 text-[var(--color-primary)]">
              <MailIcon />
            </div>
            <p className="text-xs leading-5 text-[var(--color-text-muted)]">
              We'll send a secure, one-time reset link if the account can use password recovery.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (error) setError('')
                }}
                autoComplete="email"
                autoFocus
                required
                className={inputClass}
                placeholder="you@example.com"
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
              {loading ? 'Sending reset link…' : 'Send reset link'}
            </Button>
          </form>
        </>
      )}
    </AuthPageShell>
  )
}

export default ForgotPassword
