import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import { FileCheck2, MapPin, Clock, ArrowRight, ExternalLink, Inbox } from 'lucide-react';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyApplications() {
      try {
        const res = await api.get('/applications/mine');
        setApplications(res.data.data);
      } catch (err) {
        console.error('Failed to load applications:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMyApplications();
  }, []);

  const pipelineSteps = ['applied', 'shortlisted', 'interview', 'offered'];

  const getStepIndex = (status) => {
    if (status === 'rejected') return -1;
    return pipelineSteps.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <FileCheck2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              My Job Applications
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track the hiring status of your submitted applications in real-time.
            </p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            Browse More Jobs
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse h-36" />
            ))}
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => {
              const appliedDate = new Date(app.applied_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const currentStep = getStepIndex(app.status);

              return (
                <div
                  key={app.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow dark:shadow-none transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Link
                          to={`/jobs/${app.job_id}`}
                          className="text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5"
                        >
                          {app.job_title}
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        </Link>
                        <Badge status={app.job_type} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          {app.job_location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          Applied on {appliedDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge status={app.status} />
                    </div>
                  </div>

                  {/* Status Progression Bar */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800 mt-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Application Stage
                    </p>
                    {app.status === 'rejected' ? (
                      <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3 py-2 rounded-lg text-xs font-medium">
                        <span>Application Status: Not Selected at this time.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {pipelineSteps.map((step, idx) => {
                          const isCompleted = currentStep >= idx;
                          const isCurrent = currentStep === idx;
                          return (
                            <div key={step} className="text-center">
                              <div
                                className={`h-2 rounded-full mb-1.5 transition-colors ${
                                  isCompleted
                                    ? isCurrent
                                      ? 'bg-indigo-600'
                                      : 'bg-emerald-500'
                                    : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                              />
                              <span
                                className={`text-[11px] font-semibold capitalize ${
                                  isCurrent
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : isCompleted
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : 'text-slate-400 dark:text-slate-500'
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {app.cover_note && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Cover Note: </span>
                      <span className="italic">"{app.cover_note}"</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No applications yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-4">
              You haven't submitted any job applications yet. Discover open roles and apply today!
            </p>
            <Link
              to="/"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition inline-flex items-center gap-2"
            >
              Explore Job Openings
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
