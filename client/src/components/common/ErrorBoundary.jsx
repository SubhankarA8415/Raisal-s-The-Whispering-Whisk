import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hasError: false,
    }
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error(
      'Unhandled frontend error:',
      error,
      errorInfo,
    )
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-16">
        <div className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-700">
            !
          </div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
            Unexpected Error
          </p>

          <h1 className="text-3xl">
            Something went wrong
          </h1>

          <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
            We couldn't display this page correctly. Please
            try again. If the problem continues, refresh the
            page or contact us.
          </p>

          <button
            type="button"
            onClick={this.handleReload}
            className="mt-6 inline-flex items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Refresh Page
          </button>
        </div>
      </main>
    )
  }
}

export default ErrorBoundary
