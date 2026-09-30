import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import JobDetailPage from './pages/public/JobDetailPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Candidate Pages
import MyApplicationsPage from './pages/candidate/MyApplicationsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageJobsPage from './pages/admin/ManageJobsPage';
import JobApplicantsPage from './pages/admin/JobApplicantsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Candidate Routes */}
              <Route
                path="/my-applications"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <MyApplicationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/manage-jobs"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/jobs/:id/applications"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <JobApplicantsPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
