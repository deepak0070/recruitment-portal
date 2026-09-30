import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import JobCard from '../../components/jobs/JobCard';
import ExternalJobCard from '../../components/jobs/ExternalJobCard';
import {
  Search,
  MapPin,
  Briefcase,
  Filter,
  ChevronLeft,
  ChevronRight,
  Globe,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';

const INDIA_CITIES = ['All India', 'Bengaluru', 'Delhi NCR', 'Mumbai', 'Hyderabad', 'Pune', 'Remote'];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('portal'); // 'portal' | 'live_india'

  // Portal Jobs State
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // External Jobs State
  const [externalJobs, setExternalJobs] = useState([]);
  const [extLoading, setExtLoading] = useState(false);
  const [extPagination, setExtPagination] = useState({ total: 0, page: 1, limit: 10, provider: '' });
  const [extProvider, setExtProvider] = useState('all');
  const [importNotification, setImportNotification] = useState(null);

  // Common Search & Filters
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

  const fetchExternalJobs = async () => {
    setExtLoading(true);
    try {
      const params = {
        page,
        limit: 9,
        query: search,
        location: location === 'All India' ? '' : location,
        provider: extProvider
      };
      const res = await api.get('/jobs/external/live', { params });
      setExternalJobs(res.data.data);
      setExtPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch external jobs:', err.message);
    } finally {
      setExtLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'portal') {
      fetchJobs();
    } else {
      fetchExternalJobs();
    }
  }, [activeTab, page, jobType, extProvider]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    if (activeTab === 'portal') {
      fetchJobs();
    } else {
      fetchExternalJobs();
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setLocation('');
    setJobType('');
    setPage(1);
    if (activeTab === 'portal') {
      setTimeout(fetchJobs, 0);
    } else {
      setTimeout(fetchExternalJobs, 0);
    }
  };

  const handleCityPillClick = (city) => {
    const newLoc = city === 'All India' ? '' : city;
    setLocation(newLoc);
    setPage(1);
    if (activeTab === 'live_india') {
      // Trigger search with city
      setExtLoading(true);
      api
        .get('/jobs/external/live', {
          params: { page: 1, limit: 9, query: search, location: newLoc, provider: extProvider }
        })
        .then((res) => {
          setExternalJobs(res.data.data);
          setExtPagination(res.data.pagination);
        })
        .finally(() => setExtLoading(false));
    } else {
      fetchJobs();
    }
  };

  const handleJobImportSuccess = (importedJob) => {
    setImportNotification(`Successfully imported "${importedJob.title}" into Portal Openings!`);
    setTimeout(() => setImportNotification(null), 5000);
    // Refresh internal count in background
    fetchJobs();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI-Ready Recruitment & Live Job Aggregator
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Explore Careers Across Top Tech Companies
          </h1>
          <p className="text-indigo-200 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Browse verified openings with direct portal application or discover live opportunities aggregated in real time via Adzuna & Jooble India.
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
                placeholder="Job title, skills (e.g. React, Node.js, Python)..."
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center gap-2 flex-1 px-3 py-2 w-full border-b md:border-b-0 md:border-r border-slate-200">
              <MapPin className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (e.g. Bengaluru, Delhi, Remote)..."
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>

            {activeTab === 'portal' ? (
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
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 w-full md:w-auto">
                <Globe className="w-5 h-5 text-slate-400" />
                <select
                  value={extProvider}
                  onChange={(e) => {
                    setExtProvider(e.target.value);
                    setPage(1);
                  }}
                  className="text-sm outline-none bg-transparent w-full cursor-pointer text-slate-700 font-medium"
                >
                  <option value="all">All Live Sources</option>
                  <option value="adzuna">Adzuna India</option>
                  <option value="jooble">Jooble (India)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition shadow-md"
            >
              Search
            </button>
          </form>

          {/* Quick city filter pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
            <span className="text-indigo-300 font-medium mr-1">Trending Hubs:</span>
            {INDIA_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleCityPillClick(city)}
                className={`px-3 py-1 rounded-full border transition ${
                  (city === 'All India' && !location) || location.toLowerCase() === city.toLowerCase()
                    ? 'bg-indigo-500 text-white border-indigo-400 font-semibold shadow-2xs'
                    : 'bg-indigo-900/60 text-indigo-200 border-indigo-700/50 hover:bg-indigo-800'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Import notification toast */}
        {importNotification && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 text-emerald-800 font-medium text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{importNotification}</span>
            </div>
            <button
              onClick={() => setActiveTab('portal')}
              className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 font-semibold"
            >
              View in Portal
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 mb-6 gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('portal');
                setPage(1);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                activeTab === 'portal'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Portal Openings
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'portal' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-700'
              }`}>
                {pagination.total}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('live_india');
                setPage(1);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                activeTab === 'live_india'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              🇮🇳 Live India Jobs (Adzuna & Jooble)
              {extPagination.total > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === 'live_india' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-700'
                }`}>
                  {extPagination.total}
                </span>
              )}
            </button>
          </div>

          {(search || location || jobType) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline self-start sm:self-center"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Informational banner when on Live India Jobs tab */}
        {activeTab === 'live_india' && (
          <div className="mb-6 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <span className="font-bold">Real-Time Indian Market Feeds:</span> Aggregating high-growth roles from{' '}
              <strong className="underline">Adzuna India endpoint</strong> and <strong className="underline">Jooble India</strong> across Bengaluru, Delhi NCR, Mumbai, Hyderabad, and Pune.
              Candidates can apply directly on external company portals, while authenticated Administrators can <strong>1-click import</strong> any listing to manage candidates directly inside this portal.
            </div>
          </div>
        )}

        {/* TAB 1: PORTAL OPENINGS */}
        {activeTab === 'portal' && (
          <>
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
                <h3 className="text-lg font-bold text-slate-800">No open jobs found in Portal</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  We couldn't find any internal vacancies matching your search criteria. Check the "Live India Jobs" tab or adjust your filters.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-sm bg-indigo-50 text-indigo-600 font-medium rounded-lg hover:bg-indigo-100 transition"
                  >
                    Reset All Filters
                  </button>
                  <button
                    onClick={() => setActiveTab('live_india')}
                    className="px-4 py-2 text-sm bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
                  >
                    Explore Live India Jobs
                  </button>
                </div>
              </div>
            )}

            {/* Portal Pagination */}
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
          </>
        )}

        {/* TAB 2: LIVE INDIA JOBS (Adzuna & Jooble) */}
        {activeTab === 'live_india' && (
          <>
            {extLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse h-56" />
                ))}
              </div>
            ) : externalJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {externalJobs.map((job) => (
                  <ExternalJobCard
                    key={job.id}
                    job={job}
                    onImportSuccess={handleJobImportSuccess}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No external live listings matched</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  Try searching with generic terms like "React", "Developer", "Bengaluru", or clear your location filter.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 text-sm bg-emerald-50 text-emerald-700 font-medium rounded-lg hover:bg-emerald-100 transition"
                >
                  Reset Live Search
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
