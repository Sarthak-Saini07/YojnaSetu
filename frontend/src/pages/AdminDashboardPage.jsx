import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import AdminSchemeFormModal from '../components/AdminSchemeFormModal';
import SchemeDetailModal from '../components/SchemeDetailModal';
import { 
  ShieldCheck, 
  Plus, 
  Edit3, 
  Archive, 
  RotateCcw, 
  Search, 
  Filter, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [detailScheme, setDetailScheme] = useState(null);

  const fetchSchemes = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 15,
        status: statusFilter,
      };
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/schemes', { params });
      setSchemes(res.data.items || []);
      setPagination({
        total: res.data.total || 0,
        pages: res.data.total_pages || 1,
      });
    } catch (err) {
      console.error('Failed to load admin schemes:', err);
      setError(err.response?.data?.detail || 'Failed to fetch schemes for admin management.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, page, search, statusFilter]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  const handleArchive = async (scheme) => {
    if (!window.confirm(`Are you sure you want to archive scheme "${scheme.name}"? It will be excluded from recommendations.`)) {
      return;
    }

    try {
      await api.delete(`/schemes/${scheme.id || scheme.slug}`);
      setSuccess(`Scheme "${scheme.name}" archived successfully.`);
      fetchSchemes();
    } catch (err) {
      console.error('Failed to archive scheme:', err);
      setError(err.response?.data?.detail || 'Failed to archive scheme.');
    }
  };

  const handleRestore = async (scheme) => {
    try {
      await api.put(`/schemes/${scheme.id || scheme.slug}`, { status: 'active' });
      setSuccess(`Scheme "${scheme.name}" restored to active status.`);
      fetchSchemes();
    } catch (err) {
      console.error('Failed to restore scheme:', err);
      setError(err.response?.data?.detail || 'Failed to restore scheme.');
    }
  };

  // Authorization Check
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/30">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Admin Authorization Required</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            You are logged in as <span className="text-slate-200 font-semibold">{user?.email || 'Guest User'}</span> with role <span className="font-mono text-amber-400">{user?.role || 'none'}</span>. Only authorized administrators can access scheme creation, updates, and archiving operations.
          </p>
          <div className="pt-2">
            <a
              href="/"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-block"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Administrator Control Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Scheme Data Management & Audit
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Maintain authoritative government schemes, eligibility rules, official source URLs, and verification timestamps.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingScheme(null);
            setShowFormModal(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center space-x-2 transition shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Government Scheme</span>
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Status Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Status Tabs */}
          <div className="flex space-x-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => { setStatusFilter('all'); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                statusFilter === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Schemes
            </button>
            <button
              onClick={() => { setStatusFilter('active'); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                statusFilter === 'active' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => { setStatusFilter('archived'); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                statusFilter === 'archived' ? 'bg-rose-600/30 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Archived
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search scheme name or department..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-sm font-medium">Loading database schemes for admin management...</p>
        </div>
      )}

      {/* Schemes List Table / Card View */}
      {!loading && schemes.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Scheme Details</th>
                  <th className="p-4">Level & Dept</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Verified</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {schemes.map((sch) => {
                  const isArchived = sch.status === 'archived';
                  return (
                    <tr key={sch.id || sch.slug} className="hover:bg-slate-800/40 transition">
                      {/* Name & Slug */}
                      <td className="p-4 space-y-1 max-w-xs sm:max-w-sm">
                        <button
                          onClick={() => setDetailScheme(sch)}
                          className="font-bold text-slate-100 hover:text-blue-400 text-sm text-left transition cursor-pointer line-clamp-1"
                        >
                          {sch.name}
                        </button>
                        <p className="font-mono text-[11px] text-slate-500 truncate">
                          slug: {sch.slug}
                        </p>
                      </td>

                      {/* Level & Department */}
                      <td className="p-4 space-y-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          sch.government?.level === 'central' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {sch.government?.level || 'Central'}
                        </span>
                        <p className="text-slate-400 text-[11px] truncate max-w-[180px]">
                          {sch.government?.department || 'N/A'}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {isArchived ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-flex items-center gap-1">
                            ARCHIVED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                            ACTIVE
                          </span>
                        )}
                      </td>

                      {/* Last Verified */}
                      <td className="p-4 font-mono text-[11px] text-slate-400">
                        {sch.source?.last_verified || 'Unverified'}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingScheme(sch);
                            setShowFormModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-blue-400" />
                          <span>Edit</span>
                        </button>

                        {isArchived ? (
                          <button
                            onClick={() => handleRestore(sch)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Restore</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleArchive(sch)}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            <Archive className="h-3.5 w-3.5" />
                            <span>Archive</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Scheme Form Modal */}
      {showFormModal && (
        <AdminSchemeFormModal
          scheme={editingScheme}
          onClose={() => setShowFormModal(false)}
          onSaveSuccess={() => {
            setSuccess(editingScheme ? 'Scheme updated successfully!' : 'New scheme created successfully!');
            fetchSchemes();
          }}
        />
      )}

      {/* Detail Modal Preview */}
      {detailScheme && (
        <SchemeDetailModal
          scheme={detailScheme}
          onClose={() => setDetailScheme(null)}
        />
      )}
    </div>
  );
}
