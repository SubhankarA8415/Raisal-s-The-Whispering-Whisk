import { useEffect, useState } from 'react'
import Hero from '../components/home/Hero'
import OffersSection from '../components/home/OffersSection'
import ValuesSection from '../components/home/ValuesSection'
import FeaturedProducts from '../components/home/FeaturedProducts'
import KitchenSection from '../components/home/KitchenSection'
import StorySection from '../components/home/StorySection'
import ReviewsSection from '../components/home/ReviewsSection'
import OrderCTA from '../components/home/OrderCTA'
import Container from '../components/common/Container'
import { getHome } from '../services/homeService.js'
import { getBakeryReviews } from '../services/bakeryReviewService.js'

const values = [
  { icon: '♡', title: 'Homemade with Love', description: 'Every bake carries a little piece of our heart.' },
  { icon: '✦', title: 'Fresh Everyday', description: 'Freshly prepared with care for every order.' },
  { icon: '♧', title: 'Quality Ingredients', description: 'Thoughtfully chosen ingredients in every creation.' },
  { icon: '♡', title: 'Made for Every Occasion', description: 'Sweet treats for moments big and small.' },
]

const kitchen = [
  { title: 'Freshly Prepared', description: 'Made with care in our kitchen.', size: 'large' },
  { title: 'Made from Scratch', description: 'Every detail matters.', size: 'small' },
  { title: 'Behind the Bake', description: 'A glimpse into our baking process.', size: 'small' },
  { title: 'Made with Love', description: 'From our kitchen to you.', size: 'large' },
]

const fallbackReviews = []

function HomeLoading() {
  return <main aria-busy="true"><section className="min-h-[70vh] bg-[var(--color-background)]"><Container><div className="grid min-h-[70vh] items-center gap-12 py-16 lg:grid-cols-2"><div className="space-y-5"><div className="h-4 w-40 animate-pulse rounded-full bg-[var(--color-border)]" /><div className="h-28 w-full animate-pulse rounded-2xl bg-[var(--color-border)]" /><div className="h-20 w-4/5 animate-pulse rounded-2xl bg-[var(--color-border)]" /></div><div className="aspect-[4/3] animate-pulse rounded-3xl bg-[var(--color-surface)]" /></div></Container></section></main>
}

function HomeUnavailable({ onRetry }) {
  return <main><section className="flex min-h-[60vh] items-center py-20"><Container><div className="mx-auto max-w-xl rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-[var(--shadow-soft)]"><h1 className="font-serif text-4xl">We’re preparing something sweet.</h1><p className="mt-4 text-[var(--color-text-muted)]">We couldn't load the Home media right now.</p><button onClick={onRetry} className="mt-7 rounded-[var(--radius-button)] bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white">Try Again</button></div></Container></section></main>
}

function Home() {
  const [media, setMedia] = useState({})
  const [reviews, setReviews] = useState(fallbackReviews)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadHome() {
    setLoading(true)
    setError(null)
    try {
      const [homeResponse, reviewResponse] = await Promise.allSettled([
        getHome(),
        getBakeryReviews(),
      ])
      if (homeResponse.status !== 'fulfilled') throw homeResponse.reason
      setMedia(homeResponse.value?.data?.home?.media || {})
      if (reviewResponse.status === 'fulfilled') {
        setReviews(reviewResponse.value?.data?.reviews || [])
      } else {
        setReviews([])
      }
    } catch (nextError) {
      setError(nextError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadHome() }, [])
  if (loading) return <HomeLoading />
  if (error) return <HomeUnavailable onRetry={loadHome} />

  return (
    <main>
      <Hero media={media.hero} />
      <OffersSection />
      <ValuesSection values={values} />
      <FeaturedProducts />
      <KitchenSection items={kitchen} media={media} />
      <StorySection media={media.story} />
      <ReviewsSection reviews={reviews} />
      <OrderCTA />
    </main>
  )
}

export default Home
