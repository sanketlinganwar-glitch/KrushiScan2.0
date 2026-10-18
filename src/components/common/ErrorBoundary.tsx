import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('KrushiScan Uncaught Runtime Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      sessionStorage.clear();
    } catch (e) {
      // ignore
    }
    window.location.href = import.meta.env.BASE_URL || '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-4 font-sans">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold text-[#0A2540]">
                काहीतरी तांत्रिक त्रुटी आली
              </h1>
              <p className="text-sm text-[#5B6B7D]">
                Something went wrong while loading the page.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs font-mono text-slate-700 overflow-x-auto max-h-28">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-[#008060] hover:bg-[#006e52] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                पुन्हा लोड करा (Reload)
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Home className="w-4 h-4" />
                मुख्यपृष्ठ (Home)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
