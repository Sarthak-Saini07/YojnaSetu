import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#556960] dark:text-[#A1B0A6] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#245B48] dark:text-emerald-400" />
        <p className="text-sm font-medium">Verifying user authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-8 text-center space-y-4 shadow-sm transition-colors">
          <div className="h-12 w-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#202C27] dark:text-[#F3F0E7]">Access Restricted</h2>
          <p className="text-xs text-[#556960] dark:text-[#A1B0A6] leading-relaxed">
            This section requires <span className="text-rose-600 dark:text-rose-400 font-semibold">{requiredRole.toUpperCase()}</span> authorization. You are currently authenticated as <span className="text-[#202C27] dark:text-[#F3F0E7] font-medium">{user?.email}</span> with role <span className="font-mono text-[#C49A50]">{user?.role || 'user'}</span>.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-[#245B48] hover:bg-[#1B4637] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center space-x-2 transition shadow-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
