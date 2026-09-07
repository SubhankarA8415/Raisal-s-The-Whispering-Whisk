import { Link } from 'react-router-dom'

import Container from '../common/Container'
import PureVegBadge from '../common/PureVegBadge'

function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}) {
  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden py-12 sm:py-16 lg:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-10rem] top-24 h-72 w-72 rounded-full bg-[var(--color-secondary)] opacity-[0.07] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 right-[-8rem] h-80 w-80 rounded-full bg-[var(--color-accent)] opacity-[0.09] blur-3xl"
      />

      <Container>
        <div className="relative mx-auto w-full max-w-lg">
          <div className="mb-8 text-center sm:mb-10">
            <Link
              to="/"
              className="mb-5 inline-flex flex-wrap items-center justify-center gap-3 transition-transform duration-300 hover:scale-[1.02]"
              aria-label="Raisal's The Whispering Whisk home"
            >
              <span className="font-serif text-xl font-semibold text-[var(--color-primary)]">
                Raisal's The Whispering Whisk
              </span>
              <PureVegBadge compact />
            </Link>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              {eyebrow}
            </p>

            <h1 className="text-4xl leading-tight sm:text-5xl">
              {title}
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
              {description}
            </p>
          </div>

          <section className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
            <div className="h-1 w-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)]" />

            <div className="p-6 sm:p-9">
              {children}
            </div>
          </section>

          {footer && (
            <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
              {footer}
            </div>
          )}
        </div>
      </Container>
    </main>
  )
}

export default AuthPageShell
