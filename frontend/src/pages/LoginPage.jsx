import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogIn, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/recommendations';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser?.role === 'admin' && !location.state?.from) {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.detail || 'Invalid email address or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-11 w-11 rounded-xl bg-[#245B48]/10 dark:bg-emerald-500/10 border border-[#245B48]/20 dark:border-emerald-500/20 text-[#245B48] dark:text-emerald-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#202C27] dark:text-[#F3F0E7] tracking-tight">Citizen Sign In</h2>
          <p className="text-xs text-[#556960] dark:text-[#A1B0A6]">
            Sign in to access your saved demographic profile and personalized scheme recommendations.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#202C27] dark:text-[#F3F0E7]">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="citizen@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] text-sm focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 transition placeholder:text-[#88988E]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-[#202C27] dark:text-[#F3F0E7]">
                Password <span className="text-rose-500">*</span>
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] text-sm focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 transition placeholder:text-[#88988E]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#556960] hover:text-[#202C27] dark:text-[#A1B0A6] dark:hover:text-[#F3F0E7] p-1 rounded-lg transition cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#245B48] hover:bg-[#1B4637] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider transition shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Admin Credential Helper */}
        

        {/* Footer Link */}
        <div className="pt-4 border-t border-[#EAECE4] dark:border-[#2D3A32] text-center text-xs text-[#556960] dark:text-[#A1B0A6] space-y-2">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="text-[#245B48] dark:text-emerald-400 hover:underline font-semibold">
              Register here
            </Link>
          </p>
          <p className="text-[11px] text-[#88988E]">
            Or proceed directly to{' '}
            <Link to="/recommendations" className="text-[#202C27] dark:text-[#F3F0E7] hover:underline font-medium">
              Guest Recommendation Check
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
