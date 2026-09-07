import { useEffect, useState } from 'react'

import Container from '../components/common/Container'
import Section from '../components/common/Section'
import SectionHeading from '../components/common/SectionHeading'
import Button from '../components/common/Button'
import {
  createAdminBakeryReview,
  adminDeleteAnyBakeryReview,
  getAdminBakeryReviews,
  updateAdminBakeryReview,
} from '../services/bakeryReviewService.js'

function Stars({ value = 0, interactive = false, onChange }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          aria-label={interactive ? `${star} star${star > 1 ? 's' : ''}` : undefined}
          className={`text-2xl leading-none ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${star <= value ? 'text-[var(--color-accent)]' : 'text-[var(--color-border)]'}`}
        >
          {star <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}

const emptyForm = { reviewerName: '', rating: 0, reviewText: '' }

function ReviewCard({ review, onEdit, onDelete }) {
  const isCollected = review.source === 'admin'

  return (
    <article className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Stars value={review.rating} />
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${isCollected ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-[var(--color-border)] opacity-60'}`}>
              {isCollected ? 'Collected review' : 'Customer review'}
            </span>
          </div>
          <h3 className="mt-4 font-serif text-xl">{review.reviewerName}</h3>
        </div>

        <div className="flex shrink-0 gap-2">
          {isCollected && <Button type="button" variant="secondary" onClick={() => onEdit(review)}>Edit</Button>}
          <Button type="button" variant="ghost" onClick={() => onDelete(review.id)}>Delete</Button>
        </div>
      </div>

      <p className="mt-4 text-sm leading-7">“{review.reviewText}”</p>
      <p className="mt-5 text-xs opacity-50">
        {isCollected
          ? 'Collected outside the website and entered by an administrator. The admin identity is never shown publicly.'
          : 'Submitted by a registered customer. The customer can edit or delete their own review.'}
      </p>
    </article>
  )
}

function AdminBakeryReviews() {
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const response = await getAdminBakeryReviews()
      setReviews(response?.data?.reviews || [])
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function startEdit(review) {
    if (review.source !== 'admin') return
    setEditingId(review.id)
    setForm({ reviewerName: review.reviewerName, rating: review.rating, reviewText: review.reviewText })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!form.reviewerName.trim() || !form.rating || !form.reviewText.trim()) {
      setError('Reviewer name, star rating and review description are required.')
      return
    }

    setSaving(true)
    try {
      if (editingId) await updateAdminBakeryReview(editingId, form)
      else await createAdminBakeryReview(form)
      resetForm()
      await load()
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteId) return
    setSaving(true)
    setError('')
    try {
      await adminDeleteAnyBakeryReview(deleteId)
      setDeleteId(null)
      await load()
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setSaving(false)
    }
  }

  const customerReviews = reviews.filter((review) => review.source === 'customer')
  const collectedReviews = reviews.filter((review) => review.source === 'admin')

  return (
    <main>
      <Section>
        <Container>
          <SectionHeading
            align="left"
            eyebrow="Admin"
            title="Review Our Team — Management"
            description="Customer reviews and collected reviews are managed separately. Collected reviews are genuine feedback received outside the website and entered here as anonymous reviews. The administrator who enters them is never shown publicly."
          />

          <div className="grid gap-10 xl:grid-cols-[0.8fr_1.2fr]">
            <form onSubmit={handleSubmit} className="h-fit rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-soft)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                {editingId ? 'Edit anonymous review' : 'Anonymous review'}
              </p>
              <h2 className="mt-2 font-serif text-3xl">
                {editingId ? 'Update anonymous review' : 'Add anonymous review'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                Add genuine reviews you already collected through Google Forms or another offline channel. Enter the reviewer&apos;s name, rating and review. It is stored as an administrator-entered anonymous review: the admin account is never shown publicly.
              </p>

              <label htmlFor="reviewer-name" className="mt-7 block text-sm font-semibold">Reviewer name</label>
              <input
                id="reviewer-name"
                required
                maxLength={100}
                value={form.reviewerName}
                onChange={(e) => setForm({ ...form, reviewerName: e.target.value })}
                placeholder="Reviewer name from the collected review"
                className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />

              <label className="mt-6 block text-sm font-semibold">Star rating</label>
              <div className="mt-2"><Stars value={form.rating} interactive onChange={(rating) => setForm({ ...form, rating })} /></div>

              <label htmlFor="admin-review-text" className="mt-6 block text-sm font-semibold">Review description</label>
              <textarea
                id="admin-review-text"
                required
                maxLength={2000}
                rows={7}
                value={form.reviewText}
                onChange={(e) => setForm({ ...form, reviewText: e.target.value })}
                placeholder="Enter the collected review exactly as it should appear..."
                className="mt-2 w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
              <p className="mt-1 text-right text-xs opacity-50">{form.reviewText.length}/2000</p>

              {error && <div role="alert" className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Review' : 'Add Anonymous Review'}</Button>
                {editingId && <Button type="button" variant="ghost" disabled={saving} onClick={resetForm}>Cancel</Button>}
              </div>
            </form>

            <div className="space-y-10">
              <section>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">Customer submissions</p>
                    <h2 className="mt-2 font-serif text-3xl">Customer Reviews</h2>
                  </div>
                  <span className="text-sm opacity-60">{customerReviews.length}</span>
                </div>
                {loading ? (
                  <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm opacity-60">Loading reviews...</div>
                ) : customerReviews.length === 0 ? (
                  <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm opacity-60">No customer team reviews yet.</div>
                ) : (
                  <div className="space-y-5">{customerReviews.map((review) => <ReviewCard key={review.id} review={review} onDelete={setDeleteId} />)}</div>
                )}
              </section>

              <section>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">Google Forms / offline feedback</p>
                    <h2 className="mt-2 font-serif text-3xl">Collected Reviews</h2>
                  </div>
                  <span className="text-sm opacity-60">{collectedReviews.length}</span>
                </div>
                {loading ? (
                  <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm opacity-60">Loading reviews...</div>
                ) : collectedReviews.length === 0 ? (
                  <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm opacity-60">No collected reviews yet.</div>
                ) : (
                  <div className="space-y-5">{collectedReviews.map((review) => <ReviewCard key={review.id} review={review} onEdit={startEdit} onDelete={setDeleteId} />)}</div>
                )}
              </section>
            </div>
          </div>
        </Container>
      </Section>

      {deleteId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-2xl">
            <h2 className="font-serif text-2xl">Delete this team review?</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">This permanently removes this bakery-team review. Admins can delete both customer-submitted reviews and administrator-entered collected reviews.</p>
            <div className="mt-7 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setDeleteId(null)} disabled={saving}>Cancel</Button>
              <Button type="button" onClick={confirmDelete} disabled={saving}>{saving ? 'Deleting...' : 'Delete Review'}</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default AdminBakeryReviews
