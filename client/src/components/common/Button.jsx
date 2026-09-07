function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  const variants = {
    primary:
      'bg-[var(--color-primary)] text-white shadow-[var(--shadow-lift)] hover:brightness-[1.08]',
    secondary:
      'border border-[var(--color-primary)]/70 bg-transparent text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white',
    accent:
      'bg-[var(--color-accent)] text-[var(--color-accent-foreground)] shadow-[var(--shadow-lift)] hover:brightness-[1.06]',
    outlineLight:
      'border border-white/80 bg-transparent text-white hover:bg-white hover:!text-[var(--color-primary)]',
    ghost:
      'text-[var(--color-primary)] hover:bg-[var(--color-surface)]',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] px-6 py-3 text-sm font-semibold tracking-[0.01em] transition-all duration-300 ease-out ${
        disabled
          ? 'cursor-not-allowed opacity-60'
          : 'hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] active:translate-y-0 active:scale-[0.98]'
      } ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
