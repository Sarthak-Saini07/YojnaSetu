import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserPlus, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';

const INDIAN_STATES = [
  'Punjab', 'Haryana', 'Delhi', 'Maharashtra', 'Karnataka', 
  'Tamil Nadu', 'Uttar Pradesh', 'Bihar', 'West Bengal', 'Rajasthan', 
  'Gujarat', 'Kerala', 'Madhya Pradesh', 'Odisha', 'Andhra Pradesh', 
  'Telangana', 'Assam', 'Himachal Pradesh', 'Jharkhand', 'Chhattisgarh', 
  'Uttarakhand', 'Goa', 'Jammu and Kashmir', 'Ladakh'
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [state, setState] = useState('Punjab');
  const [gender, setGender] = useState('Male');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim() || !email.trim() || !password) {
      setError('All fields marked with an asterisk are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const initialProfile = {
        date_of_birth: dateOfBirth || null,
        state: state || null,
        gender: gender || null,
      };

      await register(email, password, fullName, phone, initialProfile);
      setSuccess('Account created successfully! Redirecting to profile...');
      setTimeout(() => {
        navigate('/profile');
      }, 1200);
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.detail || 'Registration failed. Email may already be registered.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-11 w-11 rounded-xl bg-[#245B48]/10 dark:bg-emerald-500/10 text-[#245B48] dark:text-emerald-400 border border-[#245B48]/20 dark:border-emerald-500/20 mx-auto flex items-center justify-center">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#202C27] dark:text-[#F3F0E7] tracking-tight">Citizen Registration</h2>
          <p className="text-xs text-[#556960] dark:text-[#A1B0A6]">
            Create an account to securely save your demographic profile and access personalized scheme recommendations.
          </p>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-start space-x-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#202C27] dark:text-[#F3F0E7]">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] text-sm focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 transition placeholder:text-[#88988E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#202C27] dark:text-[#F3F0E7]">
                Phone Number <span className="text-[#88988E] text-[11px]">(Optional)</span>
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] text-sm focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 transition placeholder:text-[#88988E]"
              />
            </div>
          </div>

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

          {/* Demographic Initial Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#202C27] dark:text-[#F3F0E7]">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] text-xs focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#202C27] dark:text-[#F3F0E7]">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] text-xs focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 transition"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Transgender</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#202C27] dark:text-[#F3F0E7]">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] text-xs focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 transition"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#202C27] dark:text-[#F3F0E7]">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
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

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#202C27] dark:text-[#F3F0E7]">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] text-sm focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 transition placeholder:text-[#88988E]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#556960] hover:text-[#202C27] dark:text-[#A1B0A6] dark:hover:text-[#F3F0E7] p-1 rounded-lg transition cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Register & Setup Profile</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-[#EAECE4] dark:border-[#2D3A32] text-center text-xs text-[#556960] dark:text-[#A1B0A6]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#245B48] dark:text-emerald-400 hover:underline font-semibold">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
