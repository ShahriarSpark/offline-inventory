import React, { ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    console.error("Error stack:", error.stack);
    console.error("Error info component stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // Show a minimal error UI that allows users to continue
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-8">
          <div className="bg-slate-800/90 border border-cyan-500/30 rounded-xl p-6 max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">⚠️ Something went wrong</h2>
            <p className="text-slate-300 mb-6 text-sm">
              An error occurred while loading this section. You can try refreshing the page or go back to continue browsing.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => window.location.reload()} 
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                🔄 Refresh
              </button>
              <button 
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.history.pushState({}, '', '/');
                }} 
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;