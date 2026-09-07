import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../common/Container'
import Button from '../common/Button'
import Reveal from '../common/Reveal'
import MediaSlideshow from './MediaSlideshow'
import OfferBadge from './OfferBadge'
import OfferPrice from './OfferPrice'
import { getOffers } from '../../services/productService.js'

function MenuOffersSection() {
  const [offers, setOffers] = useState([])

  useEffect(() => {
    let active = true
    getOffers()
      .then((response) => {
        if (active) setOffers((response.data.products || []).slice(0, 3))
      })
      .catch(() => {
        if (active) setOffers([])
      })
    return () => { active = false }
  }, [])

  if (!offers.length) return null

  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/70 py-10 sm:py-12">
      <Container>
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">Sweet Deals</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Special Offers</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">A little extra sweetness on selected treats. Special prices and quantity offers are shown here.</p>
          </div>
          <a href="#menu-products" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">Browse all treats ↓</a>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {offers.map((product, index) => {
            const variant = product.variants?.[0]
            return (
              <Reveal key={product.id} delay={index * 90}>
                <article className="group overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-background)] shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(61,41,35,0.14)]">
                  <Link to={`/menu/${product.id}`} className="relative block aspect-[16/10] overflow-hidden">
                    <MediaSlideshow media={product.media} alt={product.name} compact />
                    <OfferBadge product={product} className="absolute left-4 top-4" />
                  </Link>
                  <div className="p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-secondary)]">{product.category}</p>
                    <h3 className="mt-1.5 font-serif text-xl leading-tight group-hover:text-[var(--color-primary)]">{product.name}</h3>
                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-[var(--color-border)] pt-4">
                      <OfferPrice variant={variant} compact />
                      <Link to={`/menu/${product.id}`}><Button variant="secondary" className="px-4 py-2 text-xs">View</Button></Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

export default MenuOffersSection
