import { useState } from 'react'

function EyeIcon({ visible }) {
  return visible ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.7" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m3 3 18 18" />
      <path d="M10.6 6.2A10.6 10.6 0 0 1 12 6c6.1 0 9.5 6 9.5 6a17 17 0 0 1-3.1 3.7" />
      <path d="M6.1 6.9C3.8 8.6 2.5 12 2.5 12s3.4 6 9.5 6c1.2 0 2.3-.2 3.3-.6" />
    </svg>
  )
}

function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  autoComplete = 'new-password',
  describedBy,
  error = false,
  showRequirement = false,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="mb-2 flex items-center justify-between gap-4 text-sm font-semibold"
        >
          <span>{label}</span>

          {showRequirement && (
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              8–128 characters
            </span>
          )}
        </label>
      )}

      {!label && showRequirement && (
        <p className="mb-2 text-xs font-medium text-[var(--color-text-muted)]">
          8–128 characters
        </p>
      )}

      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          minLength={8}
          maxLength={128}
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
          className={`w-full rounded-[var(--radius-button)] border bg-[var(--color-background)] px-4 py-3 pr-12 outline-none transition-all duration-300 placeholder:text-[var(--color-text-muted)] placeholder:opacity-50 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
              : 'border-[var(--color-border)]'
          }`}
          placeholder={placeholder}
        />

        <button
          type="button"
          onClick={() => setVisible((previous) => !previous)}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          <EyeIcon visible={visible} />
        </button>
      </div>

      {showRequirement && (
        <p
          id={describedBy}
          className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]"
        >
          Use between 8 and 128 characters.
        </p>
      )}
    </div>
  )
}

export default PasswordField
