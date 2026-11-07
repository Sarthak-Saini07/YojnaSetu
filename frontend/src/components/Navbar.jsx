import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ShieldCheck, 
  Search, 
  Sparkles, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Menu, 
  X,
  Sun,
  Moon,
  Landmark
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Landmark },
    { name: 'Scheme Explorer', path: '/schemes', icon: Search },
    { name: 'Recommendations', path: '/recommendations', icon: Sparkles },
    ...(isAuthenticated ? [{ name: 'My Profile', path: '/profile', icon: User }] : []),
    ...(user?.role === 'admin' ? [{ name: 'Admin Dashboard', path: '/admin', icon: ShieldCheck }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#E3E5DC] dark:border-[#2D3A32] bg-white/95 dark:bg-[#151B18]/95 backdrop-blur-md transition-colors duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & National Portal Title */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-xl bg-[#245B48] dark:bg-[#202923] border border-[#1B4637] dark:border-[#C49A50]/40 flex items-center justify-center shadow-sm group-hover:scale-102 transition-transform duration-200">
              <ShieldCheck className="h-5 w-5 text-white dark:text-[#C49A50]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-[#202C27] dark:text-[#F3F0E7] tracking-tight group-hover:text-[#245B48] dark:group-hover:text-[#C49A50] transition-colors">
                  GovScheme Rec
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-[#245B48]/10 text-[#245B48] dark:bg-[#C49A50]/20 dark:text-[#D5AD62] border border-[#245B48]/20 dark:border-[#C49A50]/30 hidden sm:inline-block">
                  GovTech
                </span>
              </div>
              <span className="hidden sm:block text-[10px] text-[#5A6B62] dark:text-[#9EACA3] uppercase tracking-widest font-medium">
                National Discovery & Eligibility Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center space-x-1.5 ${
                    active
                      ? 'bg-[#245B48]/10 text-[#245B48] border border-[#245B48]/30 dark:bg-[#202923] dark:text-[#D5AD62] dark:border-[#C49A50]/40 shadow-xs'
                      : 'text-[#4F5E56] hover:text-[#202C27] hover:bg-[#F7F7F2] dark:text-[#9EACA3] dark:hover:text-[#F3F0E7] dark:hover:bg-[#202923]'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#245B48] dark:text-[#D5AD62]' : 'text-[#7B8B82] dark:text-[#7C8B82]'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Controls: Theme Switcher & Auth */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32] bg-[#F7F7F2] dark:bg-[#202923] text-[#245B48] dark:text-[#C49A50] hover:bg-white dark:hover:bg-[#28342C] transition-all cursor-pointer shadow-2xs"
              title={isDark ? "Switch to Light Warm Ivory theme" : "Switch to Dark Forest theme"}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] hover:border-[#245B48]/40 dark:hover:border-[#C49A50]/40 transition shadow-2xs"
                >
                  <div className="h-5 w-5 rounded-full bg-[#245B48]/15 text-[#245B48] dark:bg-[#C49A50]/20 dark:text-[#D5AD62] flex items-center justify-center text-[10px] font-bold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-[#202C27] dark:text-[#F3F0E7] max-w-[130px] truncate">
                    {user?.full_name || user?.name || user?.email}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32] bg-white dark:bg-[#202923] hover:bg-rose-50 hover:border-rose-200 dark:hover:bg-rose-950/30 dark:hover:border-rose-800 text-[#5A6B62] hover:text-rose-700 dark:text-[#9EACA3] dark:hover:text-rose-300 text-xs font-medium transition flex items-center space-x-1 cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Exit</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#202C27] dark:text-[#F3F0E7] hover:bg-[#F7F7F2] dark:hover:bg-[#202923] border border-transparent hover:border-[#E3E5DC] dark:hover:border-[#2D3A32] transition flex items-center space-x-1.5"
                >
                  <LogIn className="h-3.5 w-3.5 text-[#5A6B62] dark:text-[#9EACA3]" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-xl bg-[#245B48] hover:bg-[#1B4637] text-white text-xs font-semibold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions: Theme Toggle + Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-[#E3E5DC] dark:border-[#2D3A32] bg-[#F7F7F2] dark:bg-[#202923] text-[#245B48] dark:text-[#C49A50]"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#202C27] dark:text-[#F3F0E7] hover:bg-[#F7F7F2] dark:hover:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32]"
              aria-label="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#151B18] border-b border-[#E3E5DC] dark:border-[#2D3A32] px-4 pt-2 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-3 ${
                  active
                    ? 'bg-[#245B48]/10 text-[#245B48] border border-[#245B48]/30 dark:bg-[#202923] dark:text-[#D5AD62] dark:border-[#C49A50]/40'
                    : 'text-[#4F5E56] hover:bg-[#F7F7F2] dark:text-[#9EACA3] dark:hover:bg-[#202923]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[#E3E5DC] dark:border-[#2D3A32]">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-1.5 text-xs text-[#5A6B62] dark:text-[#9EACA3]">
                  Signed in as <span className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">{user?.email}</span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 text-xs font-medium flex items-center space-x-2 border border-rose-200 dark:border-rose-900"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32] bg-white dark:bg-[#202923] text-[#202C27] dark:text-[#F3F0E7] text-center text-xs font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-[#245B48] text-white text-center text-xs font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
