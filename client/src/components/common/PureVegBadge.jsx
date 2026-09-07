function PureVegBadge({ compact = false, className = '' }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-[var(--color-veg-border)] bg-[var(--color-veg-surface)] text-[var(--color-veg-text)] shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-0.5 ${
        compact ? 'px-3 py-1.5' : 'px-4 py-2'
      } ${className}`}
      role="status"
      aria-label="Pure vegetarian bakery"
      title="Pure Vegetarian Bakery"
    >
      <span
        className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-veg)]"
        aria-hidden="true"
      >
        <span className="float-badge h-2 w-2 rounded-full bg-[var(--color-veg)]" />
      </span>

      <span className={compact ? 'text-xs font-bold tracking-wide' : 'text-sm font-bold tracking-wide'}>
        PURE VEG
      </span>
    </div>
  )
}

export default PureVegBadge
