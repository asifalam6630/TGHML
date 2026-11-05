import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled Application Error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      // Clear potentially corrupted local state while preserving user library if possible
      sessionStorage.clear();
      localStorage.removeItem('tghml_current_user_v1');
      localStorage.removeItem('tghml_active_ds_v1');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  handleHardReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center text-lg font-bold">
                !
              </div>
              <div>
                <h1 className="text-base font-bold text-white">
                  Turag Garments And Hosiery Ltd.
                </h1>
                <p className="text-xs text-slate-400">
                  Organogram & Manpower Operations Portal
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-red-300">
                Application Rendering Encountered an Issue
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                The application encountered an unexpected runtime error. You can reload the page or reset the local session cache to restore normal operations.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-[11px] font-mono text-red-400 overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                Reload & Recover Session
              </button>
              <button
                type="button"
                onClick={this.handleHardReset}
                className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              >
                Clear Local Cache & Fresh Start
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
