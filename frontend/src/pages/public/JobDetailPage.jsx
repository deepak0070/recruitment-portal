import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import ApplyModal from '../../components/jobs/ApplyModal';
import { MapPin, DollarSign, Clock, User, ArrowLeft, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isCandidate, isAdmin } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      setLoading(true);
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data.data);

        // If candidate, check if already applied
        if (isAuthenticated && isCandidate) {
          try {
            const appsRes = await api.get('/applications/mine');
            const already = appsRes.data.data.some((a) => a.job_id === parseInt(id, 10));
            setHasApplied(already);
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Job position not found.');
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id, isAuthenticated, isCandidate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Position Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{error || 'This job does not exist or has been removed.'}</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Job Listings
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(job.created_at).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Openings
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge status={job.job_type} />
                  <Badge status={job.status} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {job.title}
                </h1>
              </div>

              {/* Action Button */}
              <div>
                {job.status === 'closed' ? (
                  <button
                    disabled
                    className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-medium rounded-xl cursor-not-allowed"
                  >
                    Position Closed
                  </button>
                ) : hasApplied ? (
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-sm font-medium rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                    Application Submitted
                  </div>
                ) : isAdmin ? (
                  <Link
                    to={`/admin/jobs/${job.id}/applications`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
                  >
                    Review Applicants ({job.applicant_count || 0})
                  </Link>
                ) : isAuthenticated && isCandidate ? (
                  <button
                    onClick={() => setIsApplyModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition"
                  >
                    <Send className="w-4 h-4" />
                    Apply for this Job
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login', { state: { from: `/jobs/${job.id}` } })}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition"
                  >
                    Sign in to Apply
                  </button>
                )}
              </div>
            </div>

            {/* Meta details */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-600 dark:text-slate-400 mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>{job.location}</span>
              </div>
              {job.salary_range && (
                <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span>{job.salary_range}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>Posted on {formattedDate}</span>
              </div>
              {job.creator_name && (
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>Posted by {job.creator_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Job Description Body */}
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">About the Role</h3>
            <div className="prose max-w-none text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {job.description}
            </div>

            {/* Application call to action */}
            {job.status === 'open' && !hasApplied && isCandidate && (
              <div className="mt-10 p-6 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Ready to take the next step?</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Upload your latest PDF resume and optional cover note to submit your application.
                  </p>
                </div>
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition flex-shrink-0"
                >
                  Apply Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {isCandidate && (
        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          job={job}
          onApplied={() => setHasApplied(true)}
        />
      )}
    </div>
  );
}
