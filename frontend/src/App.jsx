import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ui/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'

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

          {/* Candidate routes — added feature by feature */}
          <Route path="/jobs" element={
            <ProtectedRoute role="candidate">
              <div className="p-8 text-slate-600">Jobs page — coming soon</div>
            </ProtectedRoute>
          } />

          {/* Recruiter routes — added feature by feature */}
          <Route path="/recruiter/dashboard" element={
            <ProtectedRoute role="recruiter">
              <div className="p-8 text-slate-600">Recruiter Dashboard — coming soon</div>
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
