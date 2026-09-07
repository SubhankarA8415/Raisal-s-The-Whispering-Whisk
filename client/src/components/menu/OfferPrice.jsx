function OfferPrice({ variant, compact = false }) {
  if (!variant) return null

  const original = Number(variant.originalPrice ?? variant.price)
  const discounted = Number(variant.discountedPrice ?? variant.price)
  const hasDiscount = Boolean(variant.hasDiscount) && discounted < original
  const isBuyGet = variant.offerType === 'buy_get'
  const isCustom = variant.offerType === 'custom'

  if (isCustom) {
    return <span className={compact ? 'font-serif font-semibold text-[var(--color-primary)]' : 'font-serif text-2xl font-semibold text-[var(--color-primary)]'}>₹{original.toFixed(0)}</span>
  }

  if (isBuyGet) {
    return (
      <div className={compact ? 'space-y-0.5' : 'space-y-1'}>
        <span className={compact ? 'font-serif font-bold text-[var(--color-primary)]' : 'font-serif text-2xl font-bold text-[var(--color-primary)]'}>₹{original.toFixed(0)}</span>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-secondary)]">Per payable item</p>
      </div>
    )
  }

  if (!hasDiscount) {
    return <span className={compact ? 'font-serif font-semibold text-[var(--color-primary)]' : 'font-serif text-2xl font-semibold text-[var(--color-primary)]'}>₹{original.toFixed(0)}</span>
  }

  return (
    <div className={compact ? 'flex flex-wrap items-center gap-x-2 gap-y-1' : 'space-y-1'}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-[var(--color-text-muted)] line-through">
          ₹{original.toFixed(0)}
        </span>
        <span className={compact ? 'font-serif font-bold text-[var(--color-primary)]' : 'font-serif text-2xl font-bold text-[var(--color-primary)]'}>
          ₹{discounted.toFixed(0)}
        </span>
      </div>
      {!compact && <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-secondary)]">Special offer price</p>}
    </div>
  )
}

export default OfferPrice
