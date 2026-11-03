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
  Sparkles, 
  FileText,
  Tag,
  ShieldCheck,
  MapPin
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
    <div className="space-y-8 py-6 pb-16">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
          <Search className="h-3.5 w-3.5" />
          <span>Authoritative Scheme Catalogue</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Government Scheme Explorer
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-3xl">
          Search and filter official central and state government schemes verified against official portal sources.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search schemes by name, keyword, or department..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          {/* Category */}
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 transition"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          {/* Level */}
          <select
            value={level}
            onChange={(e) => { setLevel(e.target.value); setPage(1); }}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 transition"
          >
            {GOVT_LEVELS.map((lvl) => (
              <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
            ))}
          </select>

          {/* State */}
          <select
            value={state}
            onChange={(e) => { setState(e.target.value); setPage(1); }}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="">All States / Pan-India</option>
            {STATES.filter(Boolean).map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* Filter Status Reset */}
        {(query || category || level || state) && (
          <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
            <span>
              Showing filtered results ({pagination.total} schemes)
            </span>
            <button
              onClick={handleResetFilters}
              className="text-blue-400 hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-sm font-medium">Fetching verified government schemes...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Failed to load schemes</p>
            <p className="text-xs text-rose-300/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && schemes.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">No schemes found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No active government schemes matched your search query or selected criteria filters. Try resetting your search filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Scheme Cards Grid */}
      {!loading && !error && schemes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <div
              key={scheme.id || scheme.slug}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between space-y-4 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/5 group"
            >
              <div className="space-y-3">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    scheme.government?.level === 'central'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {scheme.government?.level || 'Central'}
                  </span>

                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    Verified
                  </span>
                </div>

                {/* Scheme Title */}
                <h3 className="font-bold text-base text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2">
                  {scheme.name}
                </h3>

                {/* Department */}
                {scheme.government?.department && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium truncate">
                    <Building2 className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                    <span>{scheme.government.department}</span>
                  </p>
                )}

                {/* Description snippet */}
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {scheme.description}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                {/* Category tags */}
                {scheme.category && scheme.category.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {scheme.category.slice(0, 2).map((cat, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 text-[10px] text-slate-400 border border-slate-800 font-medium">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setSelectedScheme(scheme)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold transition text-center cursor-pointer flex items-center justify-center space-x-1.5"
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
        <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs">
          <p className="text-slate-400 font-mono">
            Page <span className="text-slate-200 font-bold">{page}</span> of{' '}
            <span className="text-slate-200 font-bold">{pagination.pages}</span> ({pagination.total} schemes total)
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page >= pagination.pages}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition flex items-center gap-1 cursor-pointer"
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
