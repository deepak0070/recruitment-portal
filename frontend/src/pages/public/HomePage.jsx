import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import JobCard from '../../components/jobs/JobCard';
import { Search, MapPin, Briefcase, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [page, setPage] = useState(1);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 6,
        status: 'open',
        ...(search && { search }),
        ...(location && { location }),
        ...(jobType && { jobType })
      };
      const res = await api.get('/jobs', { params });
      setJobs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch jobs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, jobType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleClearFilters = () => {
    setSearch('');
    setLocation('');
    setJobType('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            Find Your Dream Career
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Connect with High-Impact Opportunities
          </h1>
          <p className="text-indigo-200 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Explore verified job postings from top engineering and product teams. Apply seamlessly with your resume.
          </p>

          {/* Search bar inside hero */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-2 text-slate-800"
          >
            <div className="flex items-center gap-2 flex-1 px-3 py-2 w-full border-b md:border-b-0 md:border-r border-slate-200">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Job title, keywords, or skills..."
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center gap-2 flex-1 px-3 py-2 w-full border-b md:border-b-0 md:border-r border-slate-200">
              <MapPin className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (e.g. Remote, New York)..."
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 w-full md:w-auto">
              <Briefcase className="w-5 h-5 text-slate-400" />
              <select
                value={jobType}
                onChange={(e) => {
                  setJobType(e.target.value);
                  setPage(1);
                }}
                className="text-sm outline-none bg-transparent w-full cursor-pointer text-slate-700"
              >
                <option value="">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition shadow-md"
            >
              Search Jobs
            </button>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Featured Openings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {jobs.length} of {pagination.total} active positions
            </p>
          </div>

          {(search || location || jobType) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Job Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse h-56" />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No open jobs found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find any vacancies matching your search criteria. Try modifying your search keywords or clearing filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 text-sm bg-indigo-50 text-indigo-600 font-medium rounded-lg hover:bg-indigo-100 transition"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-slate-600 font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
