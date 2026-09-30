import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ExternalJobCard from '../../components/jobs/ExternalJobCard';
import {
  Briefcase,
  Plus,
  Users,
  Edit2,
  Trash2,
  PowerOff,
  Power,
  MapPin,
  Clock,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Search,
  Globe
} from 'lucide-react';

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Live Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSearch, setImportSearch] = useState('');
  const [importLocation, setImportLocation] = useState('Bengaluru');
  const [importProvider, setImportProvider] = useState('all');
  const [importJobs, setImportJobs] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importNotice, setImportNotice] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    job_type: 'Full-time',
    salary_range: '',
    status: 'open'
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs?status=all&limit=100');
      setJobs(res.data.data);
    } catch (err) {
      console.error('Failed to load jobs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveExternalJobs = async () => {
    setImportLoading(true);
    try {
      const res = await api.get('/jobs/external/live', {
        params: {
          query: importSearch,
          location: importLocation,
          provider: importProvider,
          limit: 6
        }
      });
      setImportJobs(res.data.data);
      setImportNotice(res.data.pagination?.notice);
    } catch (err) {
      console.error('Failed to load external jobs:', err.message);
    } finally {
      setImportLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (isImportModalOpen && importJobs.length === 0) {
      fetchLiveExternalJobs();
    }
  }, [isImportModalOpen]);

  const openCreateModal = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      job_type: 'Full-time',
      salary_range: '',
      status: 'open'
    });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      job_type: job.job_type,
      salary_range: job.salary_range || '',
      status: job.status
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editingJob) {
        await api.put(`/jobs/${editingJob.id}`, formData);
      } else {
        await api.post('/jobs', formData);
      }
      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === 'open' ? 'closed' : 'open';
    try {
      await api.put(`/jobs/${job.id}`, { status: nextStatus });
      fetchJobs();
    } catch (err) {
      alert('Failed to update job status: ' + err.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? All related applications will be deleted.')) {
      return;
    }
    try {
      await api.delete(`/jobs/${jobId}`);
      fetchJobs();
    } catch (err) {
      alert('Failed to delete job: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Manage Job Postings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create, update, close, and review applications for all positions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              Discover & Import Live Jobs
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Post New Job
            </button>
          </div>
        </div>

        {/* Job List Table / Cards */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse h-28" />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Position Title</th>
                    <th className="px-6 py-4">Location / Type</th>
                    <th className="px-6 py-4">Salary Range</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Applicants</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        <Link to={`/jobs/${job.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>{job.location}</span>
                        </div>
                        <div className="mt-1">
                          <Badge status={job.job_type} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {job.salary_range || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={job.status} />
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/admin/jobs/${job.id}/applications`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold rounded-lg text-xs transition"
                        >
                          <Users className="w-3.5 h-3.5" />
                          {job.applicant_count || 0} Applicants
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(job)}
                            className={`p-1.5 rounded-lg border transition ${
                              job.status === 'open'
                                ? 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                : 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                            title={job.status === 'open' ? 'Close Job' : 'Reopen Job'}
                          >
                            {job.status === 'open' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => openEditModal(job)}
                            className="p-1.5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit Job"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1.5 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Delete Job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No Job Postings Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Get started by creating your first job opening.
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              Post First Job
            </button>
          </div>
        )}

        {/* Create / Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingJob ? 'Edit Job Posting' : 'Create New Job Opening'}
          maxWidth="max-w-xl"
        >
          {error && (
            <div className="mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Remote / New York, NY"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Job Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.job_type}
                  onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Salary Range
                </label>
                <input
                  type="text"
                  value={formData.salary_range}
                  onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                  placeholder="e.g. $100k - $130k / year"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="open">Open (Accepting Applications)</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Description & Requirements <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed position overview, responsibilities, and requirements..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingJob ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Live Jobs Discovery & 1-Click Import Modal */}
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Discover Live India Roles (Adzuna & Jooble Aggregation)"
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Search real-time positions from Indian tech hubs and 1-click import them into your recruitment portal.
            </p>

            {importNotice && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs text-indigo-700 dark:text-indigo-300">
                {importNotice}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchLiveExternalJobs();
              }}
              className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-2 flex-1 px-3 py-1.5 w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={importSearch}
                  onChange={(e) => setImportSearch(e.target.value)}
                  placeholder="Keyword (e.g. React, Node.js, DevOps)..."
                  className="w-full text-xs outline-none py-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-1 px-3 py-1.5 w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={importLocation}
                  onChange={(e) => setImportLocation(e.target.value)}
                  placeholder="City (e.g. Bengaluru, Delhi NCR, Remote)..."
                  className="w-full text-xs outline-none py-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <select
                value={importProvider}
                onChange={(e) => setImportProvider(e.target.value)}
                className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium"
              >
                <option value="all">All Sources</option>
                <option value="adzuna">Adzuna India</option>
                <option value="jooble">Jooble India</option>
              </select>

              <button
                type="submit"
                disabled={importLoading}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
              >
                {importLoading ? 'Searching...' : 'Search Live'}
              </button>
            </form>

            {/* Results Grid */}
            {importLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
                {[1, 2].map((n) => (
                  <div key={n} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 p-4 h-40 animate-pulse" />
                ))}
              </div>
            ) : importJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {importJobs.map((j) => (
                  <ExternalJobCard
                    key={j.id}
                    job={j}
                    onImportSuccess={() => {
                      fetchJobs();
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <Globe className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No live jobs found</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try modifying your keyword or city.</p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
