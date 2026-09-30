import React, { useState } from 'react';
import { Building2, MapPin, IndianRupee, ExternalLink, Download, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function ExternalJobCard({ job, onImportSuccess }) {
  const { isAdmin } = useAuth();
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [error, setError] = useState(null);

  const handleImport = async () => {
    setImporting(true);
    setError(null);
    try {
      await api.post('/jobs/external/import', {
        title: job.title,
        description: job.description || `${job.title} at ${job.company}`,
        location: job.location,
        jobType: job.jobType || 'Full-time',
        salaryRange: job.salaryRange || null,
        applyUrl: job.applyUrl,
        source: job.source || 'External Job Feed'
      });
      setImported(true);
      if (onImportSuccess) {
        onImportSuccess(job);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const formattedDate = job.postedAt
    ? new Date(job.postedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      })
    : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-6 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-500/50 transition duration-200 group flex flex-col justify-between relative overflow-hidden">
      {/* Top Banner tag */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
          <Sparkles className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
          {job.source || 'Live Feed'}
        </span>
        {job.jobType && (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            {job.jobType}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition line-clamp-1">
          {job.title}
        </h3>

        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 mb-2">
          <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>{job.company || 'Direct Employer'}</span>
        </div>

        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>{job.location}</span>
          </div>

          {job.salaryRange && (
            <div className="flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>{job.salaryRange}</span>
            </div>
          )}

          {formattedDate && (
            <div className="text-slate-400 dark:text-slate-500">
              <span>Posted {formattedDate}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed">
          {job.description || 'Visit official listing for detailed job qualifications and responsibilities.'}
        </p>

        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400 mb-2 font-medium">{error}</p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        {job.applyUrl ? (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
          >
            Apply on Source
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          </a>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">Direct listing</span>
        )}

        {isAdmin && (
          <div>
            {imported ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <Check className="w-3.5 h-3.5" /> Imported
              </span>
            ) : (
              <button
                onClick={handleImport}
                disabled={importing}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                {importing ? 'Importing...' : 'Import to Portal'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
