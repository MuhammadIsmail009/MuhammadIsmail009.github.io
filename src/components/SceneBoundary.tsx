import { Component, type ReactNode } from 'react'

/**
 * Error boundary for the R3F hero scene. If three.js throws at runtime (e.g. a
 * lost or unavailable WebGL context), we render the SVG fallback instead of
 * letting the failure propagate and blank the whole page.
 */
export class SceneBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    /* swallow — the fallback is the recovery */
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
