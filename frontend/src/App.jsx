import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ui/ProtectedRoute'
import Layout from './components/layout/Layout'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import RecruiterDashboard from './pages/recruiter/Dashboard'
import MyJobsPage from './pages/recruiter/MyJobsPage'
import JobFormPage from './pages/recruiter/JobFormPage'

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

          {/* Recruiter */}
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

          {/* Candidate — scaffolded, will be built next */}
          <Route path="/jobs" element={
            <ProtectedRoute role="candidate">
              <Layout>
                <div className="text-slate-500 text-sm">Browse Jobs — coming next feature</div>
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
