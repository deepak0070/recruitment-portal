import React from 'react';

export default function Badge({ status, type = 'status' }) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  const statusStyles = {
    // Application statuses
    applied: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    shortlisted: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    interview: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    offered: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    rejected: 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',

    // Job statuses
    open: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    closed: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',

    // Job types
    'full-time': 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    'part-time': 'bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    'contract': 'bg-cyan-50 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    'remote': 'bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  };

  const style = statusStyles[normalized] || 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${style}`}>
      {status}
    </span>
  );
}
