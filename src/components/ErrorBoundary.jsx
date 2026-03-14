import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Simulation error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <div className="max-w-lg w-full">
            <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                Simulation Error
              </h3>
              <p className="text-zinc-500 text-sm mb-2">
                This simulation encountered an error while rendering.
              </p>

              {this.state.error && (
                <div className="mt-4 mb-6 p-3 bg-zinc-900/80 rounded-lg text-left">
                  <p className="text-red-400/80 text-xs font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <button
                onClick={() =>
                  this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                  })
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-sm font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
