import React from 'react';

export default function Badge({ status, type = 'status' }) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  const statusStyles = {
    // Application statuses
    applied: 'bg-blue-100 text-blue-800 border-blue-200',
    shortlisted: 'bg-purple-100 text-purple-800 border-purple-200',
    interview: 'bg-amber-100 text-amber-800 border-amber-200',
    offered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 border-rose-200',

    // Job statuses
    open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    closed: 'bg-slate-100 text-slate-700 border-slate-200',

    // Job types
    'full-time': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'part-time': 'bg-teal-50 text-teal-700 border-teal-200',
    'contract': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'remote': 'bg-violet-50 text-violet-700 border-violet-200',
  };

  const style = statusStyles[normalized] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${style}`}>
      {status}
    </span>
  );
}
