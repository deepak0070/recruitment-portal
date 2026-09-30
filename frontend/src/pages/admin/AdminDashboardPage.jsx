import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatCard from '../../components/admin/StatCard';
import Badge from '../../components/common/Badge';
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  Award,
  XCircle,
  Activity,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/activity?limit=10')
        ]);
        setStats(statsRes.data.data);
        setActivity(activityRes.data.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const { jobs, totalApplicants, statusCounts } = stats || {
    jobs: { total: 0, open: 0, closed: 0 },
    totalApplicants: 0,
    statusCounts: { applied: 0, shortlisted: 0, interview: 0, offered: 0, rejected: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Recruitment Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Overview of job postings, applicant pipelines, and hiring activity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/manage-jobs"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              Manage & Post Jobs
            </Link>
          </div>
        </div>

        {/* Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Job Openings"
            value={jobs.total}
            subtitle={`${jobs.open} open · ${jobs.closed} closed`}
            icon={Briefcase}
            color="indigo"
          />
          <StatCard
            title="Total Applicants"
            value={totalApplicants}
            subtitle="Across all job postings"
            icon={Users}
            color="blue"
          />
          <StatCard
            title="In Interview"
            value={statusCounts.interview}
            subtitle="Currently in assessment"
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Offers Extended"
            value={statusCounts.offered}
            subtitle="Awaiting candidate accept"
            icon={Award}
            color="emerald"
          />
        </div>

        {/* Pipeline Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-8">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Candidate Pipeline Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Applied</span>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{statusCounts.applied}</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40">
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Shortlisted</span>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">{statusCounts.shortlisted}</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Interview</span>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1">{statusCounts.interview}</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Offered</span>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{statusCounts.offered}</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 col-span-2 sm:col-span-1">
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider">Rejected</span>
              <p className="text-2xl font-bold text-rose-900 dark:text-rose-100 mt-1">{statusCounts.rejected}</p>
            </div>
          </div>
        </div>

        {/* Dual Section: Quick Nav & MongoDB Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm lg:col-span-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Quick Management</h3>
            <div className="space-y-3">
              <Link
                to="/admin/manage-jobs"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Manage Job Postings</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Create, edit, close or delete jobs</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>

          {/* Activity Feed from MongoDB */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Activity Audit <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">(MongoDB flexible log)</span>
                </h3>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {activity && activity.length > 0 ? (
                activity.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="flex items-start justify-between p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.performedBy?.name || 'System'}
                      </span>{' '}
                      <span className="text-slate-600 dark:text-slate-400">
                        {item.action === 'JOB_CREATED' && `created job: "${item.metadata?.title || 'New Job'}"`}
                        {item.action === 'JOB_UPDATED' && `updated job details`}
                        {item.action === 'JOB_CLOSED' && `closed job opening`}
                        {item.action === 'JOB_DELETED' && `deleted a job posting`}
                        {item.action === 'JOB_IMPORTED' && `imported live role: "${item.metadata?.originalTitle || 'External Job'}"`}
                        {item.action === 'APPLICATION_SUBMITTED' && `applied to "${item.metadata?.jobTitle || 'Job'}"`}
                        {item.action === 'STATUS_CHANGED' && `changed ${item.metadata?.candidateName || 'candidate'}'s status from ${item.metadata?.previousStatus} to ${item.metadata?.newStatus}`}
                        {item.action === 'NOTE_ADDED' && `added evaluation note for ${item.metadata?.candidateName || 'candidate'}`}
                        {item.action === 'SYSTEM_INITIALIZED' && `initialized and seeded system`}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap ml-4">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6 italic">
                  No activity logs recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
