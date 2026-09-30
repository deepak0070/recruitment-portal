import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, User, LogOut, ShieldCheck, FileCheck2 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isCandidate, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
              Recruit<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              Explore Jobs
            </Link>

            {isAuthenticated && isCandidate && (
              <Link
                to="/my-applications"
                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5"
              >
                <FileCheck2 className="w-4 h-4 text-indigo-500" />
                My Applications
              </Link>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/manage-jobs"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Manage Postings
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 text-xs">
                  <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-200">{user.name}</span>
                  <span className="bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm transition"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
