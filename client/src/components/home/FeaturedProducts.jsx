import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../common/Container'
import Section from '../common/Section'
import SectionHeading from '../common/SectionHeading'
import Button from '../common/Button'
import Reveal from '../common/Reveal'
import MediaSlideshow from '../menu/MediaSlideshow'
import OfferBadge from '../menu/OfferBadge'
import OfferPrice from '../menu/OfferPrice'
import { getProducts } from '../../services/productService.js'

function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [activeGroup, setActiveGroup] = useState(0)

  useEffect(() => {
    let active = true

    getProducts('', 'available')
      .then((response) => {
        if (active) {
          setProducts(response.data.products || [])
          setActiveGroup(0)
        }
      })
      .catch(() => {
        if (active) setProducts([])
      })

    return () => { active = false }
  }, [])

  const groups = useMemo(() => {
    const result = []
    for (let index = 0; index < products.length; index += 3) {
      result.push(products.slice(index, index + 3))
    }
    return result
  }, [products])

  useEffect(() => {
    if (groups.length <= 1) return undefined
    const timer = window.setInterval(() => {
      setActiveGroup((current) => (current + 1) % groups.length)
    }, 5500)
    return () => window.clearInterval(timer)
  }, [groups.length])

  useEffect(() => {
    if (activeGroup >= groups.length && groups.length > 0) {
      setActiveGroup(0)
    }
  }, [activeGroup, groups.length])

  const visibleProducts = groups[activeGroup] || []

  function previousGroup() {
    setActiveGroup((current) => (current - 1 + groups.length) % groups.length)
  }

  function nextGroup() {
    setActiveGroup((current) => (current + 1) % groups.length)
  }

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Our Favorites"
          title="A Little Something Sweet"
          description="Discover some of the treats that make Raisal's The Whispering Whisk special."
        />

        {products.length > 0 ? (
          <div className="relative">
            <div className="grid gap-8 md:grid-cols-3">
              {visibleProducts.map((product, index) => {
                const variant = product.variants?.[0]
                return (
                  <Reveal key={product.id} delay={index * 90}>
                    <article className="group overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_18px_45px_rgba(61,41,35,0.14)]">
                      <Link to={`/menu/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-[var(--color-background)]">
                        <MediaSlideshow media={product.media} alt={product.name} compact />
                        <OfferBadge product={product} className="absolute left-4 top-4" />
                      </Link>
                      <div className="p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-secondary)]">{product.category}</p>
                        <h3 className="mt-2 text-2xl text-[var(--color-text)]">{product.name}</h3>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--color-text-muted)]">{product.description}</p>
                        <div className="mt-5 flex items-center justify-between gap-3">
                          {variant ? <OfferPrice variant={variant} compact /> : <span className="font-semibold text-[var(--color-primary)]">View details</span>}
                          <Link to={`/menu/${product.id}`}><Button variant="secondary">View Details</Button></Link>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                )
              })}
            </div>

            {groups.length > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button type="button" onClick={previousGroup} aria-label="Previous featured products" className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-lg transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">←</button>
                <div className="flex items-center gap-2" aria-label="Featured product slides">
                  {groups.map((_, index) => (
                    <button key={index} type="button" onClick={() => setActiveGroup(index)} aria-label={`Show featured products ${index + 1}`} className={`h-2.5 rounded-full transition-all ${index === activeGroup ? 'w-8 bg-[var(--color-primary)]' : 'w-2.5 bg-[var(--color-border)]'}`} />
                  ))}
                </div>
                <button type="button" onClick={nextGroup} aria-label="Next featured products" className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-lg transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">→</button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center text-sm text-[var(--color-text-muted)]">Our featured treats are being prepared. Explore the full menu for everything currently available.</div>
        )}

        <div className="mt-10 flex justify-center"><Link to="/menu"><Button>Explore Full Menu</Button></Link></div>
      </Container>
    </Section>
  )
}
export default FeaturedProducts
