import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { MapPin, DollarSign, Clock, ArrowRight } from 'lucide-react';

export default function JobCard({ job }) {
  const formattedDate = new Date(job.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 hover:shadow-lg hover:border-indigo-300 transition group flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
            {job.title}
          </h3>
          <Badge status={job.job_type} />
        </div>

        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.location}</span>
          </div>
          {job.salary_range && (
            <div className="flex items-center gap-1 font-medium text-slate-700">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span>{job.salary_range}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
          {job.description}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {job.applicant_count || 0} {job.applicant_count === 1 ? 'applicant' : 'applicants'}
        </span>
        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
        >
          View Position
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
