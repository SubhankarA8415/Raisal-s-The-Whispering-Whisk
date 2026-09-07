import { useBakery } from '../../context/BakeryContext.jsx'

function BakeryClosureNotice() {
  const { isClosed, closureNote, loading } = useBakery()
  if (loading || !isClosed) return null

  return (
    <div className="border-b border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3 text-sm sm:px-6 lg:px-8">
        <span className="mt-0.5 shrink-0 text-[var(--color-secondary)]" aria-hidden="true">●</span>
        <div className="min-w-0">
          <p className="font-semibold text-[var(--color-primary)]">Currently closed</p>
          <p className="mt-0.5 leading-6 text-[var(--color-text-muted)]">
            {closureNote || 'Online ordering is currently unavailable. Please check back later.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default BakeryClosureNotice
