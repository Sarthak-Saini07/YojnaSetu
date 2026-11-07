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
  Building2, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Lock, 
  Users, 
  Activity, 
  Database, 
  Server, 
  Trash2, 
  UserCheck, 
  UserX, 
  Eye, 
  RefreshCw, 
  X,
  FileText
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Navigation tab: 'schemes' | 'users' | 'system'
  const [activeTab, setActiveTab] = useState('schemes');

  // Schemes State
  const [schemes, setSchemes] = useState([]);
  const [schemesLoading, setSchemesLoading] = useState(true);
  const [schemeSearch, setSchemeSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [schemePage, setSchemePage] = useState(1);
  const [schemePagination, setSchemePagination] = useState({ total: 0, pages: 1 });

  // Users State
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState({ total: 0, pages: 1 });
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  // System State
  const [systemInfo, setSystemInfo] = useState(null);
  const [systemLoading, setSystemLoading] = useState(false);

  // Notifications & Modals
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [detailScheme, setDetailScheme] = useState(null);

  // Fetch Schemes
  const fetchSchemes = useCallback(async () => {
    if (!isAdmin) return;
    setSchemesLoading(true);
    setError('');
    try {
      const params = {
        page: schemePage,
        limit: 15,
        status: statusFilter,
      };
      if (schemeSearch.trim()) params.search = schemeSearch.trim();

      const res = await api.get('/schemes', { params });
      setSchemes(res.data.items || []);
      setSchemePagination({
        total: res.data.total || 0,
        pages: res.data.total_pages || 1,
      });
    } catch (err) {
      console.error('Failed to load admin schemes:', err);
      setError(err.response?.data?.detail || 'Failed to fetch schemes for admin management.');
    } finally {
      setSchemesLoading(false);
    }
  }, [isAdmin, schemePage, schemeSearch, statusFilter]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    setUsersLoading(true);
    setError('');
    try {
      const params = {
        page: userPage,
        limit: 10,
      };
      if (userSearch.trim()) params.search = userSearch.trim();
      if (roleFilter) params.role = roleFilter;

      const res = await api.get('/users', { params });
      setUsersList(res.data.items || []);
      setUserPagination({
        total: res.data.total || 0,
        pages: res.data.total_pages || 1,
      });
    } catch (err) {
      console.error('Failed to load registered users:', err);
      setError(err.response?.data?.detail || 'Failed to fetch registered users.');
    } finally {
      setUsersLoading(false);
    }
  }, [isAdmin, userPage, userSearch, roleFilter]);

  // Fetch System Info
  const fetchSystemInfo = useCallback(async () => {
    if (!isAdmin) return;
    setSystemLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/system');
      setSystemInfo(res.data);
    } catch (err) {
      console.error('Failed to load system information:', err);
      setError(err.response?.data?.detail || 'Failed to fetch system information.');
    } finally {
      setSystemLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === 'schemes') fetchSchemes();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'system') fetchSystemInfo();
  }, [activeTab, fetchSchemes, fetchUsers, fetchSystemInfo]);

  // Scheme Handlers
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

  const handleDeletePermanent = async (scheme) => {
    const confirmation = window.prompt(`Type "DELETE" to permanently erase "${scheme.name}" from MongoDB:`);
    if (confirmation !== 'DELETE') return;

    try {
      await api.delete(`/schemes/${scheme.id || scheme.slug}/permanent`);
      setSuccess(`Scheme "${scheme.name}" permanently deleted.`);
      fetchSchemes();
    } catch (err) {
      console.error('Permanent delete failed:', err);
      setError(err.response?.data?.detail || 'Permanent deletion failed.');
    }
  };

  // User Handlers
  const handleRoleChange = async (targetUser, newRole) => {
    if (!window.confirm(`Are you sure you want to change role of ${targetUser.email} to ${newRole.toUpperCase()}?`)) {
      return;
    }
    try {
      await api.put(`/users/${targetUser._id || targetUser.id}/role`, { role: newRole });
      setSuccess(`Role of user ${targetUser.email} updated to ${newRole.toUpperCase()}.`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to change user role:', err);
      setError(err.response?.data?.detail || 'Failed to update user role.');
    }
  };

  // Authorization Check
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center border border-rose-200 dark:border-rose-800">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#202C27] dark:text-[#F3F0E7]">Admin Authorization Required</h2>
          <p className="text-xs text-[#556960] dark:text-[#A1B0A6] max-w-md mx-auto leading-relaxed">
            You are logged in as <span className="text-[#202C27] dark:text-[#F3F0E7] font-semibold">{user?.email || 'Guest User'}</span> with role <span className="font-mono text-[#C49A50]">{user?.role || 'none'}</span>. Only authorized administrators can access scheme creation, user administration, and system controls.
          </p>
          <div className="pt-2">
            <a
              href="/"
              className="px-5 py-2.5 rounded-xl bg-[#245B48] hover:bg-[#1B4637] text-white text-xs font-semibold inline-block"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-[#E3E5DC] dark:border-[#2D3A32]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#245B48]/10 dark:bg-emerald-500/10 text-[#245B48] dark:text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Administrator Control Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202C27] dark:text-[#F3F0E7]">
            System Administration & RBAC
          </h1>
          <p className="text-xs sm:text-sm text-[#556960] dark:text-[#A1B0A6]">
            Maintain authoritative government schemes, manage registered user roles, and monitor MongoDB health.
          </p>
        </div>

        {activeTab === 'schemes' && (
          <button
            onClick={() => {
              setEditingScheme(null);
              setShowFormModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#245B48] hover:bg-[#1B4637] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-2 transition shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Government Scheme</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-600 hover:text-rose-800 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Primary Dashboard Navigation Tabs */}
      <div className="flex border-b border-[#E3E5DC] dark:border-[#2D3A32] space-x-4">
        <button
          onClick={() => setActiveTab('schemes')}
          className={`pb-3 px-1 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            activeTab === 'schemes'
              ? 'border-[#245B48] text-[#245B48] dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-[#556960] dark:text-[#A1B0A6] hover:text-[#202C27] dark:hover:text-[#F3F0E7]'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Scheme Management</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-1 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            activeTab === 'users'
              ? 'border-[#245B48] text-[#245B48] dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-[#556960] dark:text-[#A1B0A6] hover:text-[#202C27] dark:hover:text-[#F3F0E7]'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User & Role Management</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 px-1 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            activeTab === 'system'
              ? 'border-[#245B48] text-[#245B48] dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-[#556960] dark:text-[#A1B0A6] hover:text-[#202C27] dark:hover:text-[#F3F0E7]'
          }`}
        >
          <Server className="h-4 w-4" />
          <span>System & MongoDB Telemetry</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: SCHEME MANAGEMENT                                      */}
      {/* ============================================================== */}
      {activeTab === 'schemes' && (
        <div className="space-y-6">
          {/* Search and Status Filters */}
          <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm transition-colors">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Status Tabs */}
              <div className="flex space-x-1.5 bg-[#F7F7F2] dark:bg-[#151B18] p-1.5 rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32] text-xs font-semibold w-full sm:w-auto">
                <button
                  onClick={() => { setStatusFilter('all'); setSchemePage(1); }}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    statusFilter === 'all' ? 'bg-white dark:bg-[#202923] text-[#202C27] dark:text-[#F3F0E7] shadow-sm' : 'text-[#556960] dark:text-[#A1B0A6] hover:text-[#202C27]'
                  }`}
                >
                  All Schemes
                </button>
                <button
                  onClick={() => { setStatusFilter('active'); setSchemePage(1); }}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    statusFilter === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'text-[#556960] dark:text-[#A1B0A6] hover:text-[#202C27]'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => { setStatusFilter('archived'); setSchemePage(1); }}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    statusFilter === 'archived' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800' : 'text-[#556960] dark:text-[#A1B0A6] hover:text-[#202C27]'
                  }`}
                >
                  Archived
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#88988E]" />
                <input
                  type="text"
                  placeholder="Search scheme name or ministry..."
                  value={schemeSearch}
                  onChange={(e) => { setSchemeSearch(e.target.value); setSchemePage(1); }}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] text-xs focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Loading state */}
          {schemesLoading && (
            <div className="py-16 text-center text-[#556960] dark:text-[#A1B0A6] space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#245B48] dark:text-emerald-400 mx-auto" />
              <p className="text-sm font-medium">Loading database schemes for admin management...</p>
            </div>
          )}

          {/* Schemes List Table */}
          {!schemesLoading && schemes.length > 0 && (
            <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl overflow-hidden shadow-sm transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#202C27] dark:text-[#F3F0E7]">
                  <thead className="bg-[#F7F7F2] dark:bg-[#151B18] text-[#556960] dark:text-[#A1B0A6] uppercase tracking-wider font-semibold text-[11px] border-b border-[#E3E5DC] dark:border-[#2D3A32]">
                    <tr>
                      <th className="p-4">Scheme Details</th>
                      <th className="p-4">Level & Dept</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Last Verified</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAECE4] dark:divide-[#2D3A32]">
                    {schemes.map((sch) => {
                      const isArchived = sch.status === 'archived';
                      return (
                        <tr key={sch.id || sch.slug} className="hover:bg-[#F7F7F2] dark:hover:bg-[#1A221C] transition">
                          <td className="p-4 space-y-1 max-w-xs sm:max-w-sm">
                            <button
                              onClick={() => setDetailScheme(sch)}
                              className="font-bold text-[#202C27] dark:text-[#F3F0E7] hover:text-[#245B48] dark:hover:text-emerald-400 text-sm text-left transition cursor-pointer line-clamp-1"
                            >
                              {sch.name}
                            </button>
                            <p className="font-mono text-[11px] text-[#88988E] truncate">
                              slug: {sch.slug}
                            </p>
                          </td>

                          <td className="p-4 space-y-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              sch.government?.level === 'central' ? 'bg-[#245B48]/10 text-[#245B48] dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-[#C49A50]/15 text-[#8E6E32] dark:text-[#D4AF37]'
                            }`}>
                              {sch.government?.level || 'Central'}
                            </span>
                            <p className="text-[#556960] dark:text-[#A1B0A6] text-[11px] truncate max-w-[180px]">
                              {sch.government?.department || 'N/A'}
                            </p>
                          </td>

                          <td className="p-4">
                            {isArchived ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 inline-flex items-center gap-1">
                                ARCHIVED
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                                ACTIVE
                              </span>
                            )}
                          </td>

                          <td className="p-4 font-mono text-[11px] text-[#556960] dark:text-[#A1B0A6]">
                            {sch.source?.last_verified || 'Unverified'}
                          </td>

                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingScheme(sch);
                                setShowFormModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#F7F7F2] hover:bg-[#ECEEE6] dark:bg-[#151B18] dark:hover:bg-[#202923] text-[#202C27] dark:text-[#F3F0E7] border border-[#D8DBD0] dark:border-[#2D3A32] text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5 text-[#245B48] dark:text-emerald-400" />
                              <span>Edit</span>
                            </button>

                            {isArchived ? (
                              <button
                                onClick={() => handleRestore(sch)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Restore</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleArchive(sch)}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                              >
                                <Archive className="h-3.5 w-3.5" />
                                <span>Archive</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeletePermanent(sch)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#F7F7F2] hover:bg-rose-50 dark:bg-[#151B18] dark:hover:bg-rose-950/40 text-[#88988E] hover:text-rose-600 text-xs transition cursor-pointer"
                              title="Delete permanently from MongoDB"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!schemesLoading && schemes.length === 0 && (
            <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-12 text-center text-[#556960] dark:text-[#A1B0A6] space-y-2">
              <Building2 className="h-8 w-8 mx-auto text-[#88988E]" />
              <p className="text-sm font-semibold">No schemes match your filter criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: USER & ROLE MANAGEMENT                                  */}
      {/* ============================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Search & Role Filter */}
          <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-5 sm:p-6 shadow-sm transition-colors">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Role filter buttons */}
              <div className="flex space-x-1.5 bg-[#F7F7F2] dark:bg-[#151B18] p-1.5 rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32] text-xs font-semibold w-full sm:w-auto">
                <button
                  onClick={() => { setRoleFilter(''); setUserPage(1); }}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    roleFilter === '' ? 'bg-white dark:bg-[#202923] text-[#202C27] dark:text-[#F3F0E7] shadow-sm' : 'text-[#556960] dark:text-[#A1B0A6] hover:text-[#202C27]'
                  }`}
                >
                  All Users
                </button>
                <button
                  onClick={() => { setRoleFilter('user'); setUserPage(1); }}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    roleFilter === 'user' ? 'bg-[#245B48]/10 text-[#245B48] dark:bg-emerald-500/10 dark:text-emerald-400 font-semibold' : 'text-[#556960] dark:text-[#A1B0A6] hover:text-[#202C27]'
                  }`}
                >
                  Citizens
                </button>
                <button
                  onClick={() => { setRoleFilter('admin'); setUserPage(1); }}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    roleFilter === 'admin' ? 'bg-[#C49A50]/15 text-[#8E6E32] dark:text-[#D4AF37] font-semibold' : 'text-[#556960] dark:text-[#A1B0A6] hover:text-[#202C27]'
                  }`}
                >
                  Administrators
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#88988E]" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] text-xs focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Users Loading */}
          {usersLoading && (
            <div className="py-16 text-center text-[#556960] dark:text-[#A1B0A6] space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#245B48] dark:text-emerald-400 mx-auto" />
              <p className="text-sm font-medium">Loading registered users from MongoDB...</p>
            </div>
          )}

          {/* Users Table */}
          {!usersLoading && usersList.length > 0 && (
            <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl overflow-hidden shadow-sm transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#202C27] dark:text-[#F3F0E7]">
                  <thead className="bg-[#F7F7F2] dark:bg-[#151B18] text-[#556960] dark:text-[#A1B0A6] uppercase tracking-wider font-semibold text-[11px] border-b border-[#E3E5DC] dark:border-[#2D3A32]">
                    <tr>
                      <th className="p-4">Citizen / User</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">State & District</th>
                      <th className="p-4">Profile Completeness</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAECE4] dark:divide-[#2D3A32]">
                    {usersList.map((usr) => {
                      const isTargetAdmin = usr.role === 'admin';
                      const isSelf = usr._id === user?._id || usr.id === user?._id;
                      const completion = usr.profile?.profile_completion_percentage || 0;
                      return (
                        <tr key={usr._id || usr.id} className="hover:bg-[#F7F7F2] dark:hover:bg-[#1A221C] transition">
                          <td className="p-4 space-y-1">
                            <p className="font-bold text-[#202C27] dark:text-[#F3F0E7] text-sm">{usr.name || usr.full_name || 'Citizen'}</p>
                            <p className="text-[#556960] dark:text-[#A1B0A6] text-xs font-mono">{usr.email}</p>
                            {isSelf && (
                              <span className="text-[10px] text-[#245B48] dark:text-emerald-400 font-semibold bg-[#245B48]/10 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                (Current Session)
                              </span>
                            )}
                          </td>

                          <td className="p-4">
                            {isTargetAdmin ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#C49A50]/15 text-[#8E6E32] dark:text-[#D4AF37] border border-[#C49A50]/30 inline-flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                ADMIN
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#245B48]/10 text-[#245B48] dark:bg-emerald-500/10 dark:text-emerald-400 border border-[#245B48]/20 dark:border-emerald-500/20 inline-flex items-center gap-1">
                                CITIZEN
                              </span>
                            )}
                          </td>

                          <td className="p-4">
                            <p className="text-[#202C27] dark:text-[#F3F0E7] font-medium">{usr.profile?.state || 'Not specified'}</p>
                            <p className="text-[11px] text-[#88988E]">{usr.profile?.district || '—'}</p>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-[#ECEEE6] dark:bg-[#151B18] rounded-full h-2 overflow-hidden border border-[#D8DBD0] dark:border-[#2D3A32]">
                                <div
                                  className={`h-2 rounded-full ${
                                    completion >= 80 ? 'bg-[#245B48] dark:bg-emerald-500' : completion >= 40 ? 'bg-[#C49A50]' : 'bg-[#88988E]'
                                  }`}
                                  style={{ width: `${completion}%` }}
                                />
                              </div>
                              <span className="font-mono text-[#556960] dark:text-[#A1B0A6] text-[11px]">{completion}%</span>
                            </div>
                          </td>

                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => setSelectedUserDetail(usr)}
                              className="px-3 py-1.5 rounded-lg bg-[#F7F7F2] hover:bg-[#ECEEE6] dark:bg-[#151B18] dark:hover:bg-[#202923] text-[#202C27] dark:text-[#F3F0E7] border border-[#D8DBD0] dark:border-[#2D3A32] text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                              title="View Demographic Profile"
                            >
                              <Eye className="h-3.5 w-3.5 text-[#245B48] dark:text-emerald-400" />
                              <span>View Profile</span>
                            </button>

                            {!isSelf && (
                              isTargetAdmin ? (
                                <button
                                  onClick={() => handleRoleChange(usr, 'user')}
                                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                                  title="Demote to Citizen"
                                >
                                  <UserX className="h-3.5 w-3.5" />
                                  <span>Demote</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRoleChange(usr, 'admin')}
                                  className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                                  title="Promote to Admin"
                                >
                                  <UserCheck className="h-3.5 w-3.5" />
                                  <span>Make Admin</span>
                                </button>
                              )
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

          {!usersLoading && usersList.length === 0 && (
            <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-12 text-center text-[#556960] dark:text-[#A1B0A6] space-y-2">
              <Users className="h-8 w-8 mx-auto text-[#88988E]" />
              <p className="text-sm font-semibold">No registered users match your search criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SYSTEM & DATABASE INFORMATION                           */}
      {/* ============================================================== */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-bold text-[#202C27] dark:text-[#F3F0E7] flex items-center gap-2">
              <Database className="h-5 w-5 text-[#245B48] dark:text-emerald-400" />
              <span>MongoDB & Backend Diagnostics</span>
            </h2>
            <button
              onClick={fetchSystemInfo}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#202923] hover:bg-[#F0F2EB] dark:hover:bg-[#2A362E] text-[#202C27] dark:text-[#F3F0E7] border border-[#D8DBD0] dark:border-[#2D3A32] text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${systemLoading ? 'animate-spin text-[#245B48]' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>

          {systemLoading && !systemInfo && (
            <div className="py-16 text-center text-[#556960] dark:text-[#A1B0A6] space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#245B48] dark:text-emerald-400 mx-auto" />
              <p className="text-sm font-medium">Querying MongoDB cluster telemetry...</p>
            </div>
          )}

          {systemInfo && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Database Status Card */}
                <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#556960] dark:text-[#A1B0A6] uppercase tracking-wider">Database Status</span>
                    <Database className="h-4 w-4 text-[#245B48] dark:text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-extrabold text-[#245B48] dark:text-emerald-400 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#245B48] dark:bg-emerald-400 animate-pulse" />
                      <span>{systemInfo.database_status.toUpperCase()}</span>
                    </div>
                    <p className="font-mono text-xs text-[#556960] dark:text-[#A1B0A6]">DB: {systemInfo.database_name}</p>
                  </div>
                </div>

                {/* Total Schemes Card */}
                <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#556960] dark:text-[#A1B0A6] uppercase tracking-wider">Government Schemes</span>
                    <FileText className="h-4 w-4 text-[#245B48] dark:text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-extrabold text-[#202C27] dark:text-[#F3F0E7]">{systemInfo.stats.total_schemes}</div>
                    <p className="text-xs text-[#556960] dark:text-[#A1B0A6]">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{systemInfo.stats.active_schemes} active</span> ·{' '}
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">{systemInfo.stats.archived_schemes} archived</span>
                    </p>
                  </div>
                </div>

                {/* Registered Citizens Card */}
                <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#556960] dark:text-[#A1B0A6] uppercase tracking-wider">Registered Users</span>
                    <Users className="h-4 w-4 text-[#C49A50]" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-extrabold text-[#202C27] dark:text-[#F3F0E7]">{systemInfo.stats.total_users}</div>
                    <p className="text-xs text-[#556960] dark:text-[#A1B0A6]">
                      <span className="text-[#8E6E32] dark:text-[#D4AF37] font-semibold">{systemInfo.stats.total_admins} administrators</span>
                    </p>
                  </div>
                </div>

                {/* Environment Status Card */}
                <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#556960] dark:text-[#A1B0A6] uppercase tracking-wider">Environment</span>
                    <Activity className="h-4 w-4 text-[#245B48] dark:text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-extrabold text-[#202C27] dark:text-[#F3F0E7] uppercase">{systemInfo.environment}</div>
                    <p className="text-xs text-[#556960] dark:text-[#A1B0A6] font-mono">REST API: Operational</p>
                  </div>
                </div>
              </div>

              {/* Collections & Diagnostic Table */}
              <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-[#202C27] dark:text-[#F3F0E7]">MongoDB Persistent Collections</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {systemInfo.collections.map((col) => (
                    <div key={col} className="bg-[#F7F7F2] dark:bg-[#151B18] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-xl p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-mono text-sm font-semibold text-[#202C27] dark:text-[#F3F0E7]">{col}</span>
                        <p className="text-[11px] text-[#556960] dark:text-[#A1B0A6]">
                          {col === 'schemes' ? 'Authoritative government schemes repository' : 'User authentication & persistent profiles'}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        ACTIVE
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Details Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-xl">
            <div className="flex justify-between items-start pb-3 border-b border-[#EAECE4] dark:border-[#2D3A32]">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#202C27] dark:text-[#F3F0E7]">{selectedUserDetail.name || 'Citizen Profile'}</h3>
                <p className="font-mono text-xs text-[#556960] dark:text-[#A1B0A6]">{selectedUserDetail.email}</p>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="text-[#556960] hover:text-[#202C27] dark:text-[#A1B0A6] dark:hover:text-white p-1 rounded-lg hover:bg-[#F0F2EB] dark:hover:bg-[#2A362E] transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-[#F7F7F2] dark:bg-[#151B18] p-4 rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32] space-y-2">
                <span className="text-[11px] font-bold text-[#556960] dark:text-[#A1B0A6] uppercase tracking-wider">Demographic Profile</span>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[#88988E]">Age:</span>
                    <p className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">{selectedUserDetail.profile?.age || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-[#88988E]">Gender:</span>
                    <p className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">{selectedUserDetail.profile?.gender || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-[#88988E]">State:</span>
                    <p className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">{selectedUserDetail.profile?.state || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-[#88988E]">District:</span>
                    <p className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">{selectedUserDetail.profile?.district || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[#88988E]">Annual Income:</span>
                    <p className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">
                      {selectedUserDetail.profile?.annual_income ? `₹${selectedUserDetail.profile.annual_income.toLocaleString('en-IN')}` : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#88988E]">Occupation:</span>
                    <p className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">{selectedUserDetail.profile?.occupation || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-[#88988E]">Education:</span>
                    <p className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">{selectedUserDetail.profile?.education || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-[#88988E]">Category:</span>
                    <p className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">{selectedUserDetail.profile?.category || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F7F7F2] dark:bg-[#151B18] p-4 rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32] space-y-2">
                <span className="text-[11px] font-bold text-[#556960] dark:text-[#A1B0A6] uppercase tracking-wider">Special Flags</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${selectedUserDetail.profile?.is_student ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-[#202923] text-[#88988E]'}`}>
                    Student: {selectedUserDetail.profile?.is_student ? 'Yes' : 'No'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${selectedUserDetail.profile?.is_farmer ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-[#202923] text-[#88988E]'}`}>
                    Farmer: {selectedUserDetail.profile?.is_farmer ? 'Yes' : 'No'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${selectedUserDetail.profile?.is_disabled ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-[#202923] text-[#88988E]'}`}>
                    Specially-Abled: {selectedUserDetail.profile?.is_disabled ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2 rounded-xl bg-[#245B48] hover:bg-[#1B4637] text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
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
