import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F7F2] dark:bg-[#151B18] text-[#202C27] dark:text-[#F3F0E7] flex items-center justify-center p-6 transition-colors">
          <div className="max-w-2xl w-full bg-white dark:bg-[#202923] border border-rose-300 dark:border-rose-900/60 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-7 w-7 flex-shrink-0" />
              <h1 className="text-xl font-bold">Something went wrong</h1>
            </div>

            <p className="text-xs sm:text-sm text-[#556960] dark:text-[#A1B0A6]">
              A runtime rendering error occurred in the application view:
            </p>

            <div className="bg-[#F7F7F2] dark:bg-[#151B18] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-xl p-4 overflow-x-auto">
              <p className="text-xs font-mono text-rose-700 dark:text-rose-300 font-semibold">
                {this.state.error?.toString()}
              </p>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-[11px] font-mono text-[#556960] dark:text-[#A1B0A6] mt-2 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-xl bg-[#245B48] hover:bg-[#1B4637] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm flex items-center space-x-2 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reload Application</span>
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
