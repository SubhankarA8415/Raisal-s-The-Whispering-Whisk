import { Link } from 'react-router-dom'

import Container from '../components/common/Container'
import PureVegBadge from '../components/common/PureVegBadge'

function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <div className="mb-6 inline-flex">
            <PureVegBadge />
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">
            Page not found
          </p>

          <h1 className="mt-3 text-6xl leading-none sm:text-7xl">
            404
          </h1>

          <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
            The page you're looking for doesn't exist or may have moved.
          </p>

          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
          >
            Back to home
          </Link>
        </div>
      </Container>
    </main>
  )
}

export default NotFound
