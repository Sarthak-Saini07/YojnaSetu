import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import SchemeDetailModal from '../components/SchemeDetailModal';
import { 
  Search, 
  Filter, 
  Building2, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  ShieldCheck,
  Tag
} from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'education', label: 'Education & Scholarships' },
  { value: 'agriculture', label: 'Agriculture & Farming' },
  { value: 'health', label: 'Healthcare & Insurance' },
  { value: 'housing', label: 'Housing & Sanitation' },
  { value: 'financial', label: 'Financial Inclusion & Credit' },
  { value: 'social_welfare', label: 'Social Welfare & Empowerment' },
];

const GOVT_LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'central', label: 'Central Government' },
  { value: 'state', label: 'State Government' },
];

const STATES = [
  '', 'Punjab', 'Haryana', 'Delhi', 'Maharashtra', 'Karnataka', 
  'Tamil Nadu', 'Uttar Pradesh', 'Bihar', 'West Bengal', 'Rajasthan', 'Gujarat'
];

export default function SchemeExplorerPage() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [state, setState] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Selected scheme for detail modal
  const [selectedScheme, setSelectedScheme] = useState(null);

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: pageSize,
      };
      if (query.trim()) params.search = query.trim();
      if (category) params.category = category;
      if (level) params.government_level = level;
      if (state) params.state = state;

      const res = await api.get('/schemes', { params });
      const items = res.data.items || res.data.schemes || [];
      setSchemes(items);
      setPagination({
        total: res.data.total ?? items.length,
        pages: res.data.total_pages || res.data.pages || 1,
      });
    } catch (err) {
      console.error('Failed to fetch schemes:', err);
      setError(err.response?.data?.detail || 'Failed to load schemes. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, query, category, level, state]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSchemes();
  };

  const handleResetFilters = () => {
    setQuery('');
    setCategory('');
    setLevel('');
    setState('');
    setPage(1);
  };

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6 pb-16">
      {/* Header */}
      <div className="space-y-1.5 pb-2 border-b border-[#E3E5DC] dark:border-[#2D3A32]">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#245B48]/10 dark:bg-emerald-500/10 text-[#245B48] dark:text-emerald-400 text-xs font-semibold">
          <Search className="h-3.5 w-3.5" />
          <span>Authoritative National Scheme Repository</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202C27] dark:text-[#F3F0E7]">
          Government Scheme Explorer
        </h1>
        <p className="text-xs sm:text-sm text-[#556960] dark:text-[#A1B0A6] max-w-3xl">
          Search and browse official central and state government schemes verified against official portal sources.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm transition-colors">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#88988E]" />
            <input
              type="text"
              placeholder="Search schemes by name, keyword, or ministry..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] text-xs sm:text-sm focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 transition placeholder:text-[#88988E] dark:placeholder:text-[#68776D]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#245B48] hover:bg-[#1B4637] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          {/* Category */}
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 transition"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          {/* Level */}
          <select
            value={level}
            onChange={(e) => { setLevel(e.target.value); setPage(1); }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 transition"
          >
            {GOVT_LEVELS.map((lvl) => (
              <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
            ))}
          </select>

          {/* State */}
          <select
            value={state}
            onChange={(e) => { setState(e.target.value); setPage(1); }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 transition"
          >
            <option value="">All States / Pan-India</option>
            {STATES.filter(Boolean).map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* Filter Status Reset */}
        {(query || category || level || state) && (
          <div className="flex items-center justify-between pt-2 text-xs text-[#556960] dark:text-[#A1B0A6]">
            <span>
              Showing filtered results (<strong className="text-[#202C27] dark:text-[#F3F0E7]">{pagination.total.toLocaleString()}</strong> schemes)
            </span>
            <button
              onClick={handleResetFilters}
              className="text-[#245B48] dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-16 text-center text-[#556960] dark:text-[#A1B0A6] space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#245B48] dark:text-emerald-400 mx-auto" />
          <p className="text-sm font-medium">Fetching verified government schemes...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-sm flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Failed to load schemes</p>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && schemes.length === 0 && (
        <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] text-[#88988E] mx-auto flex items-center justify-center">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-[#202C27] dark:text-[#F3F0E7]">No schemes found</h3>
          <p className="text-xs text-[#556960] dark:text-[#A1B0A6] max-w-md mx-auto">
            No active government schemes matched your search query or selected criteria filters. Try resetting your search filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-[#245B48] hover:bg-[#1B4637] text-white text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Scheme Cards Grid */}
      {!loading && !error && schemes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schemes.map((scheme) => (
            <div
              key={scheme.id || scheme.slug}
              className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] hover:border-[#245B48]/40 dark:hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all duration-200 shadow-sm hover:shadow-md group"
            >
              <div className="space-y-3">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    scheme.government?.level === 'central'
                      ? 'bg-[#245B48]/10 text-[#245B48] dark:bg-emerald-500/10 dark:text-emerald-400 border border-[#245B48]/20 dark:border-emerald-500/20'
                      : 'bg-[#C49A50]/15 text-[#8E6E32] dark:text-[#D4AF37] border border-[#C49A50]/30'
                  }`}>
                    {scheme.government?.level || 'Central'}
                  </span>

                  <span className="text-[10px] text-[#556960] dark:text-[#A1B0A6] flex items-center gap-1 font-medium">
                    <ShieldCheck className="h-3 w-3 text-[#245B48] dark:text-emerald-400" />
                    Verified
                  </span>
                </div>

                {/* Scheme Title */}
                <h3 className="font-bold text-base text-[#202C27] dark:text-[#F3F0E7] group-hover:text-[#245B48] dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {scheme.name}
                </h3>

                {/* Department */}
                {scheme.government?.department && (
                  <p className="text-xs text-[#556960] dark:text-[#A1B0A6] flex items-center gap-1.5 truncate">
                    <Building2 className="h-3.5 w-3.5 text-[#88988E] flex-shrink-0" />
                    <span>{scheme.government.department}</span>
                  </p>
                )}

                {/* Description snippet */}
                <p className="text-xs text-[#556960] dark:text-[#A1B0A6] line-clamp-3 leading-relaxed">
                  {scheme.description}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#EAECE4] dark:border-[#2D3A32] space-y-3">
                {/* Category tags */}
                {scheme.category && scheme.category.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {scheme.category.slice(0, 2).map((cat, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-[#F7F7F2] dark:bg-[#151B18] text-[10px] text-[#556960] dark:text-[#A1B0A6] border border-[#E3E5DC] dark:border-[#2D3A32] font-medium">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-1">
                  <button
                    onClick={() => setSelectedScheme(scheme)}
                    className="w-full py-2 px-3 rounded-xl bg-[#F7F7F2] hover:bg-[#245B48] dark:bg-[#151B18] dark:hover:bg-emerald-600 text-[#202C27] hover:text-white dark:text-[#F3F0E7] text-xs font-semibold border border-[#D8DBD0] dark:border-[#2D3A32] hover:border-transparent transition text-center cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <span>View Scheme Details</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-[#E3E5DC] dark:border-[#2D3A32] text-xs">
          <p className="text-[#556960] dark:text-[#A1B0A6]">
            Page <span className="text-[#202C27] dark:text-[#F3F0E7] font-bold">{page}</span> of{' '}
            <span className="text-[#202C27] dark:text-[#F3F0E7] font-bold">{pagination.pages}</span> ({pagination.total.toLocaleString()} schemes total)
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] hover:bg-[#F0F2EB] dark:hover:bg-[#2A362E] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => {
                setPage((p) => Math.min(pagination.pages, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={page >= pagination.pages}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] hover:bg-[#F0F2EB] dark:hover:bg-[#2A362E] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detailed Modal view */}
      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          onClose={() => setSelectedScheme(null)}
        />
      )}
    </div>
  );
}
