import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, Save, AlertCircle, CheckCircle2, Loader2, Building2, Globe, Calendar, ShieldCheck, UserCheck } from 'lucide-react';

export default function AdminSchemeFormModal({ scheme, onClose, onSaveSuccess }) {
  const isEditing = Boolean(scheme);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'active',
    category: '',
    level: 'central',
    department: '',
    age_min: '',
    age_max: '',
    income_max: '',
    states: '',
    occupations: '',
    education: '',
    is_student_required: false,
    is_farmer_required: false,
    is_disabled_required: false,
    benefits: '',
    documents: '',
    app_method: 'online',
    app_steps: '',
    official_url: '',
    source_department: '',
    source_url: '',
    last_verified: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (scheme) {
      setFormData({
        name: scheme.name || '',
        slug: scheme.slug || '',
        description: scheme.description || '',
        status: scheme.status || 'active',
        category: (scheme.category || []).join(', '),
        level: scheme.government?.level || 'central',
        department: scheme.government?.department || '',
        age_min: scheme.eligibility?.age?.min ?? '',
        age_max: scheme.eligibility?.age?.max ?? '',
        income_max: scheme.eligibility?.income?.max ?? '',
        states: (scheme.eligibility?.states || []).join(', '),
        occupations: (scheme.eligibility?.occupations || []).join(', '),
        education: (scheme.eligibility?.education || []).join(', '),
        is_student_required: !!scheme.eligibility?.is_student_required,
        is_farmer_required: !!scheme.eligibility?.is_farmer_required,
        is_disabled_required: !!scheme.eligibility?.is_disabled_required,
        benefits: (scheme.benefits || []).join('\n'),
        documents: (scheme.documents || []).join('\n'),
        app_method: scheme.application?.method || 'online',
        app_steps: (scheme.application?.steps || []).join('\n'),
        official_url: scheme.application?.official_url || '',
        source_department: scheme.source?.department || scheme.government?.department || '',
        source_url: scheme.source?.source_url || scheme.application?.official_url || '',
        last_verified: scheme.source?.last_verified || new Date().toISOString().split('T')[0],
      });
    }
  }, [scheme]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      // Auto-generate slug from name if creating new scheme
      if (!isEditing && name === 'name') {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.slug.trim() || !formData.description.trim()) {
      setError('Scheme Name, Slug, and Description are required.');
      return;
    }

    setLoading(true);

    // Build payload matching SchemeCreate / SchemeUpdate Pydantic schema
    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim(),
      status: formData.status,
      category: formData.category ? formData.category.split(',').map((c) => c.trim()).filter(Boolean) : [],
      government: {
        level: formData.level,
        department: formData.department.trim() || null,
      },
      eligibility: {
        age: {
          min: formData.age_min !== '' ? parseInt(formData.age_min, 10) : null,
          max: formData.age_max !== '' ? parseInt(formData.age_max, 10) : null,
        },
        income: {
          max: formData.income_max !== '' ? parseFloat(formData.income_max) : null,
        },
        states: formData.states ? formData.states.split(',').map((s) => s.trim()).filter(Boolean) : [],
        occupations: formData.occupations ? formData.occupations.split(',').map((o) => o.trim()).filter(Boolean) : [],
        education: formData.education ? formData.education.split(',').map((e) => e.trim()).filter(Boolean) : [],
        is_student_required: Boolean(formData.is_student_required),
        is_farmer_required: Boolean(formData.is_farmer_required),
        is_disabled_required: Boolean(formData.is_disabled_required),
      },
      benefits: formData.benefits ? formData.benefits.split('\n').map((b) => b.trim()).filter(Boolean) : [],
      documents: formData.documents ? formData.documents.split('\n').map((d) => d.trim()).filter(Boolean) : [],
      application: {
        method: formData.app_method,
        steps: formData.app_steps ? formData.app_steps.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        official_url: formData.official_url.trim() || null,
      },
      source: {
        source_url: formData.source_url.trim() || formData.official_url.trim() || null,
        department: formData.source_department.trim() || formData.department.trim() || null,
        last_verified: formData.last_verified || null,
      },
    };

    try {
      if (isEditing) {
        await api.put(`/schemes/${scheme.id || scheme.slug}`, payload);
      } else {
        await api.post('/schemes', payload);
      }
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      console.error('Save scheme failed:', err);
      setError(err.response?.data?.detail || 'Failed to save scheme. Please check input formats.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl shadow-xl overflow-hidden my-8 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#EAECE4] dark:border-[#2D3A32] bg-[#F7F7F2] dark:bg-[#151B18] flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#202C27] dark:text-[#F3F0E7]">
              {isEditing ? `Edit Scheme: ${scheme.name}` : 'Create New Government Scheme'}
            </h2>
            <p className="text-xs text-[#556960] dark:text-[#A1B0A6]">
              {isEditing 
                ? 'Update authoritative scheme parameters and deterministic eligibility rules.' 
                : 'Define a new government scheme document persisted in MongoDB.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#556960] hover:text-[#202C27] dark:text-[#A1B0A6] dark:hover:text-white hover:bg-[#EAECE4] dark:hover:bg-[#2A362E] transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto text-xs text-[#202C27] dark:text-[#F3F0E7]">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Scheme Information */}
          <div className="space-y-3 bg-[#F7F7F2] dark:bg-[#151B18] p-4 rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32]">
            <h3 className="font-bold text-[#245B48] dark:text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Building2 className="h-4 w-4" /> 1. Basic Scheme Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Scheme Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Post Matric Scholarship for SC Students"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Unique Slug *</label>
                <input
                  type="text"
                  name="slug"
                  required
                  disabled={isEditing}
                  placeholder="e.g. post-matric-scholarship-sc"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] font-mono focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 disabled:opacity-50"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Description / Summary *</label>
                <textarea
                  name="description"
                  required
                  rows={2}
                  placeholder="Detailed overview and objective of the government scheme..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Categories (Comma separated)</label>
                <input
                  type="text"
                  name="category"
                  placeholder="education, scholarship, sc"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500"
                >
                  <option value="active">Active (Recommended in System)</option>
                  <option value="archived">Archived (Excluded from Recommendations)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Government Department & Level */}
          <div className="space-y-3 bg-[#F7F7F2] dark:bg-[#151B18] p-4 rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32]">
            <h3 className="font-bold text-[#245B48] dark:text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Building2 className="h-4 w-4" /> 2. Government Level & Ministry
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Government Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500"
                >
                  <option value="central">Central Government</option>
                  <option value="state">State Government</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Department / Ministry</label>
                <input
                  type="text"
                  name="department"
                  placeholder="e.g. Ministry of Social Justice and Empowerment"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Standardized Eligibility Rules */}
          <div className="space-y-3 bg-[#F7F7F2] dark:bg-[#151B18] p-4 rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32]">
            <h3 className="font-bold text-[#C49A50] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-[#C49A50]" /> 3. Standardized Eligibility Rules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Min Age (Years)</label>
                <input
                  type="number"
                  name="age_min"
                  placeholder="e.g. 18"
                  value={formData.age_min}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Max Age (Years)</label>
                <input
                  type="number"
                  name="age_max"
                  placeholder="e.g. 35"
                  value={formData.age_max}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Max Income Limit (₹)</label>
                <input
                  type="number"
                  name="income_max"
                  placeholder="e.g. 250000"
                  value={formData.income_max}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Applicable States (Comma separated, empty = Pan-India)</label>
                <input
                  type="text"
                  name="states"
                  placeholder="Punjab, Haryana (or leave empty for all states)"
                  value={formData.states}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Occupations (Comma separated)</label>
                <input
                  type="text"
                  name="occupations"
                  placeholder="student, farmer"
                  value={formData.occupations}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Education Levels (Comma separated)</label>
                <input
                  type="text"
                  name="education"
                  placeholder="undergraduate, secondary"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-4 pt-2 border-t border-[#EAECE4] dark:border-[#2D3A32]">
              <label className="flex items-center space-x-2 text-[#202C27] dark:text-[#F3F0E7] cursor-pointer">
                <input
                  type="checkbox"
                  name="is_student_required"
                  checked={formData.is_student_required}
                  onChange={handleChange}
                  className="rounded text-[#245B48] focus:ring-[#245B48] h-4 w-4"
                />
                <span>Requires Student Status</span>
              </label>

              <label className="flex items-center space-x-2 text-[#202C27] dark:text-[#F3F0E7] cursor-pointer">
                <input
                  type="checkbox"
                  name="is_farmer_required"
                  checked={formData.is_farmer_required}
                  onChange={handleChange}
                  className="rounded text-[#245B48] focus:ring-[#245B48] h-4 w-4"
                />
                <span>Requires Farmer Status</span>
              </label>

              <label className="flex items-center space-x-2 text-[#202C27] dark:text-[#F3F0E7] cursor-pointer">
                <input
                  type="checkbox"
                  name="is_disabled_required"
                  checked={formData.is_disabled_required}
                  onChange={handleChange}
                  className="rounded text-[#245B48] focus:ring-[#245B48] h-4 w-4"
                />
                <span>Requires Disability Status (PWD)</span>
              </label>
            </div>
          </div>

          {/* Section 4: Benefits & Documents */}
          <div className="space-y-3 bg-[#F7F7F2] dark:bg-[#151B18] p-4 rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32]">
            <h3 className="font-bold text-[#245B48] dark:text-emerald-400 uppercase tracking-wider text-[11px]">
              4. Benefits & Required Documents (One item per line)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Scheme Benefits (One per line)</label>
                <textarea
                  name="benefits"
                  rows={3}
                  placeholder="Full tuition fee waiver&#10;Maintenance allowance ₹12,000/year"
                  value={formData.benefits}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Required Documents (One per line)</label>
                <textarea
                  name="documents"
                  rows={3}
                  placeholder="Aadhaar Card&#10;Income Certificate&#10;Caste Certificate"
                  value={formData.documents}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Application & Authoritative Source */}
          <div className="space-y-3 bg-[#F7F7F2] dark:bg-[#151B18] p-4 rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32]">
            <h3 className="font-bold text-[#245B48] dark:text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-[#245B48] dark:text-emerald-400" /> 5. Application & Authoritative Source Metadata
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Official Portal URL *</label>
                <input
                  type="url"
                  name="official_url"
                  required
                  placeholder="https://scholarships.gov.in"
                  value={formData.official_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] font-mono focus:outline-none focus:border-[#245B48]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Application Method</label>
                <select
                  name="app_method"
                  value={formData.app_method}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48]"
                >
                  <option value="online">Online Portal</option>
                  <option value="offline">Offline / District Office</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Last Verified Date *</label>
                <input
                  type="date"
                  name="last_verified"
                  required
                  value={formData.last_verified}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">Step-by-step Application Guide (One step per line)</label>
                <textarea
                  name="app_steps"
                  rows={3}
                  placeholder="1. Visit the National Scholarship Portal&#10;2. Register using Aadhaar and mobile number&#10;3. Submit income certificate and college details"
                  value={formData.app_steps}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex justify-end gap-3 border-t border-[#EAECE4] dark:border-[#2D3A32]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F7F7F2] hover:bg-[#ECEEE6] dark:bg-[#151B18] dark:hover:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#245B48] hover:bg-[#1B4637] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center space-x-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{isEditing ? 'Save Changes' : 'Create Scheme'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
