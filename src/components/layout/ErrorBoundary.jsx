'use client';

import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
          <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-300">
            <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Oops! Something went wrong</h1>
            <p className="text-gray-500 mt-4 text-sm leading-relaxed">
              We encountered an unexpected error. Don&apos;t worry, your data is safe. Please try refreshing or return to the home page.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
               <Button 
                onClick={() => window.location.reload()}
                className="gap-2"
               >
                 <RefreshCcw size={18} /> Refresh Page
               </Button>
               <Link href="/">
                 <Button variant="secondary" className="w-full gap-2">
                    <Home size={18} /> Home
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
