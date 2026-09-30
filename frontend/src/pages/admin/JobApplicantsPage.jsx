import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import NotesDrawer from '../../components/admin/NotesDrawer';
import {
  Users,
  ArrowLeft,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  Mail,
  User,
  AlertCircle,
  Filter
} from 'lucide-react';

export default function JobApplicantsPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState(null);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/jobs/${id}/applications`, {
        params: { status: statusFilter }
      });
      setJob(res.data.data.job);
      setApplications(res.data.data.applications);
    } catch (err) {
      console.error('Failed to load applications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [id, statusFilter]);

  const openReviewModal = async (appId) => {
    setStatusError(null);
    try {
      const res = await api.get(`/admin/applications/${appId}`);
      setSelectedApp(res.data.data);
      setIsReviewOpen(true);
    } catch (err) {
      alert('Failed to fetch applicant details: ' + err.message);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedApp) return;
    setStatusUpdating(true);
    setStatusError(null);

    try {
      const res = await api.patch(`/admin/applications/${selectedApp.id}/status`, {
        status: newStatus
      });
      setSelectedApp({
        ...selectedApp,
        status: res.data.data.status
      });
      fetchApplicants();
    } catch (err) {
      setStatusError(err.response?.data?.message || err.message || 'Status transition disallowed.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDownloadResume = (appId) => {
    const token = localStorage.getItem('token');
    fetch(`/api/admin/applications/${appId}/resume`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Resume not available');
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Candidate-${selectedApp?.candidate_name || 'Resume'}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => alert(err.message));
  };

  // Pipeline transitions map
  const nextValidOptions = {
    applied: ['shortlisted', 'rejected'],
    shortlisted: ['interview', 'rejected'],
    interview: ['offered', 'rejected'],
    offered: ['rejected'],
    rejected: ['shortlisted']
  };

  const availableNextStatuses = selectedApp ? nextValidOptions[selectedApp.status] || [] : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <Link
          to="/admin/manage-jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Manage Postings
        </Link>

        {/* Job Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge status={job?.status} />
              <span className="text-xs text-slate-500 dark:text-slate-400">{job?.location}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {job?.title || 'Job Applications'}
            </h1>
          </div>

          <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{applications.length} Candidates Displayed</span>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {['all', 'applied', 'shortlisted', 'interview', 'offered', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Applicants List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse h-24" />
            ))}
          </div>
        ) : applications.length > 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                        {app.candidate_name?.charAt(0) || 'C'}
                      </div>
                      <span>{app.candidate_name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{app.candidate_email}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(app.applied_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openReviewModal(app.id)}
                        className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold rounded-lg text-xs transition"
                      >
                        Review Applicant
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Filter className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No Applicants in this Stage</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              There are currently no candidates with status: <span className="font-semibold">{statusFilter}</span>.
            </p>
          </div>
        )}

        {/* Applicant Review Modal */}
        <Modal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          title={`Applicant Review: ${selectedApp?.candidate_name || ''}`}
          maxWidth="max-w-2xl"
        >
          {selectedApp && (
            <div className="space-y-6">
              {/* Profile Bar */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{selectedApp.candidate_name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{selectedApp.candidate_email}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadResume(selectedApp.id)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  <Download className="w-4 h-4" />
                  Download PDF Resume
                </button>
              </div>

              {/* Cover Note */}
              <div>
                <h5 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">Candidate Cover Note</h5>
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-36 overflow-y-auto">
                  {selectedApp.cover_note || <span className="italic text-slate-400 dark:text-slate-500">No cover note provided.</span>}
                </div>
              </div>

              {/* Status Transition Pipeline */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Hiring Pipeline Progress</h5>
                  <Badge status={selectedApp.status} />
                </div>

                {statusError && (
                  <div className="mb-3 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{statusError}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Advance pipeline to:</span>
                  {availableNextStatuses.length > 0 ? (
                    availableNextStatuses.map((nextSt) => (
                      <button
                        key={nextSt}
                        disabled={statusUpdating}
                        onClick={() => handleStatusChange(nextSt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                          nextSt === 'rejected'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                            : nextSt === 'offered'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                            : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                        }`}
                      >
                        → {nextSt}
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">No further pipeline steps available.</span>
                  )}
                </div>
              </div>

              {/* MongoDB Internal Applicant Notes */}
              <NotesDrawer
                applicationId={selectedApp.id}
                notes={selectedApp.notes || []}
                onNoteAdded={(newNote) => {
                  setSelectedApp({
                    ...selectedApp,
                    notes: [newNote, ...(selectedApp.notes || [])]
                  });
                }}
              />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
