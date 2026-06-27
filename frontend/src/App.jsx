import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ui/ProtectedRoute'
import Layout from './components/layout/Layout'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import ProfilePage from './pages/shared/ProfilePage'

import RecruiterDashboard from './pages/recruiter/Dashboard'
import MyJobsPage from './pages/recruiter/MyJobsPage'
import JobFormPage from './pages/recruiter/JobFormPage'
import ApplicantsPage from './pages/recruiter/ApplicantsPage'

import JobsPage from './pages/candidate/JobsPage'
import JobDetailPage from './pages/candidate/JobDetailPage'
import MyApplicationsPage from './pages/candidate/MyApplicationsPage'
import RecommendedPage from './pages/candidate/RecommendedPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>

          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Shared ── */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><ProfilePage /></Layout>
            </ProtectedRoute>
          } />

          {/* ── Recruiter ── */}
          <Route path="/recruiter/dashboard" element={
            <ProtectedRoute role="recruiter">
              <Layout><RecruiterDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/recruiter/jobs" element={
            <ProtectedRoute role="recruiter">
              <Layout><MyJobsPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/recruiter/jobs/new" element={
            <ProtectedRoute role="recruiter">
              <Layout><JobFormPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/recruiter/jobs/:id/edit" element={
            <ProtectedRoute role="recruiter">
              <Layout><JobFormPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/recruiter/applicants" element={
            <ProtectedRoute role="recruiter">
              <Layout><ApplicantsPage /></Layout>
            </ProtectedRoute>
          } />

          {/* ── Candidate ── */}
          <Route path="/jobs" element={
            <ProtectedRoute role="candidate">
              <Layout><JobsPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/jobs/:id" element={
            <ProtectedRoute role="candidate">
              <Layout><JobDetailPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/my-applications" element={
            <ProtectedRoute role="candidate">
              <Layout><MyApplicationsPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/recommended" element={
            <ProtectedRoute role="candidate">
              <Layout><RecommendedPage /></Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
