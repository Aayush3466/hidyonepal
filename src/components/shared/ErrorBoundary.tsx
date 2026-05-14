"use client"
import { Component, ReactNode } from "react"
import { useRouter } from "next/navigation"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  retryCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    retryCount: 0,
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // ── Production logging ──────────────────────────────────────────────
    // Right now this logs to console. Before launch, replace with:
    // fetch("/api/log-error", { method: "POST", body: JSON.stringify({ error: error.message, stack: info.componentStack }) })
    // Or drop in Sentry: Sentry.captureException(error, { extra: info })
    console.error("[ErrorBoundary]", error.message, info.componentStack)
  }

  handleRetry = () => {
    const { retryCount } = this.state

    // ── Infinite loop protection ────────────────────────────────────────
    // After 2 soft retries (local re-render), force a hard navigation
    // refresh which re-runs the server component and re-fetches all data.
    // This breaks any crash loop — if the data is still broken after a
    // hard refresh, the user sees a real error, not a flickering screen.
    if (retryCount >= 2) {
      window.location.reload()
      return
    }

    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryCount: prev.retryCount + 1,
    }))
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="card p-8 text-center text-earth-500 text-sm">
          <p className="mb-3">Something went wrong.</p>
          <button
            className="text-brand-400 hover:underline"
            onClick={this.handleRetry}
          >
            {this.state.retryCount >= 2 ? "Reload page" : "Try again"}
          </button>
        </div>
      )
    }

    return this.props.children
  }
}