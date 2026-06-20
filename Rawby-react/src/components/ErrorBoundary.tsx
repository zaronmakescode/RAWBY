import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface in console for debugging; no external reporting.
    console.error("[RAWBY] render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="glass w-full max-w-md p-8 text-center">
            <h1 className="h-display text-2xl font-bold text-text-hi">Something broke</h1>
            <p className="mt-2 text-sm text-text-dim">
              An unexpected error hit the screen. Reloading usually clears it.
            </p>
            <button
              onClick={() => location.reload()}
              className="mt-6 rounded-xl bg-gradient-to-br from-cinema-400 to-cinema-600 px-5 py-3 text-sm font-semibold text-[#1A1100] transition-[filter] hover:brightness-110"
            >
              Reload
            </button>
            {import.meta.env.DEV && (
              <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-field p-3 text-left text-xs text-danger">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
