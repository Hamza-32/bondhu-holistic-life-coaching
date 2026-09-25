import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';

interface Props {
  children: ReactNode;
}

interface State {
  error: unknown;
  hasError: boolean;
}

/**
 * Last-resort boundary for errors thrown outside the router (providers, router setup).
 * Errors inside routes are handled by the route `errorElement` (RouteError).
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null, hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { error, hasError: true };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo) {
    // Replaced by Sentry reporting in Phase 6 (optional); console keeps the stack visible in dev.
    console.error('Uncaught error', error, info.componentStack);
  }

  private reset = () => this.setState({ error: null, hasError: false });

  override render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}
