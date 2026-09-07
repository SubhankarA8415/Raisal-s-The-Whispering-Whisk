import { useEffect, useMemo, useState } from 'react'
import Container from '../common/Container'
import Section from '../common/Section'
import SectionHeading from '../common/SectionHeading'
import Button from '../common/Button'
import { Link } from 'react-router-dom'
import Reveal from '../common/Reveal'
import ReviewAvatar from '../common/ReviewAvatar.jsx'

function ReviewsSection({ reviews = [] }) {
  const [activeReview, setActiveReview] = useState(0)
  const summary = useMemo(() => reviews.length ? { count: reviews.length, average: Number((reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1)) } : { count: 0, average: null }, [reviews])

  useEffect(() => {
    setActiveReview(0)
  }, [reviews.length])

  useEffect(() => {
    if (reviews.length <= 1) return undefined
    const timer = window.setInterval(() => {
      setActiveReview((current) => (current + 1) % reviews.length)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [reviews.length])

  if (!reviews.length) return null

  const review = reviews[activeReview] || reviews[0]

  function previousReview() {
    setActiveReview((current) => (current - 1 + reviews.length) % reviews.length)
  }

  function nextReview() {
    setActiveReview((current) => (current + 1) % reviews.length)
  }

  return (
    <Section className="bg-[var(--color-surface)]">
      <Container>
        <SectionHeading eyebrow="Customer Love" title="Sweet Words from Our Customers" description="Every review means a lot to us and inspires us to keep baking with love." />
        <Reveal className="mx-auto max-w-3xl reveal-scale">
          <div className="group rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-background)] p-8 text-center shadow-[var(--shadow-soft)] sm:p-12">
            <div className="flex justify-center gap-1 text-2xl text-[var(--color-accent)]">{'★'.repeat(Math.round(summary.average || 0))}{'☆'.repeat(5 - Math.round(summary.average || 0))}</div>
            <p className="mt-3 font-serif text-2xl text-[var(--color-text)]">{summary.average} / 5</p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Based on {summary.count} customer {summary.count === 1 ? 'review' : 'reviews'}</p>

            <div className="mt-8 min-h-[150px] flex flex-col items-center justify-center">
              <ReviewAvatar src={review.avatarUrl} name={review.reviewerName} userType={review.userType} />
              <p key={review.id || activeReview} className="mt-4 font-serif text-2xl leading-relaxed text-[var(--color-text)]">“{review.reviewText}”</p>
              <p className="mt-5 text-sm font-semibold text-[var(--color-primary)]">— {review.reviewerName}</p>
            </div>
          </div>

          {reviews.length > 1 && (
            <div className="mt-7 flex items-center justify-center gap-4">
              <button type="button" onClick={previousReview} aria-label="Previous team review" className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-background)] text-lg transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">←</button>
              <div className="flex items-center gap-2" aria-label="Team review slides">
                {reviews.map((item, index) => (
                  <button key={item.id || index} type="button" onClick={() => setActiveReview(index)} aria-label={`Show team review ${index + 1}`} className={`h-2.5 rounded-full transition-all ${index === activeReview ? 'w-8 bg-[var(--color-primary)]' : 'w-2.5 bg-[var(--color-border)]'}`} />
                ))}
              </div>
              <button type="button" onClick={nextReview} aria-label="Next team review" className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-background)] text-lg transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">→</button>
            </div>
          )}

          <div className="mt-8 flex justify-center"><Link to="/reviews"><Button variant="secondary">Read All Team Reviews</Button></Link></div>
        </Reveal>
      </Container>
    </Section>
  )
}
export default ReviewsSection