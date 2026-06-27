import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Briefcase, ChevronDown, LogOut, User, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { logoutUser } from '../../api/auth'
import { toast } from 'react-toastify'

const recruiterLinks = [
  { to: '/recruiter/dashboard', label: 'Dashboard' },
  { to: '/recruiter/jobs', label: 'My Jobs' },
  { to: '/recruiter/applicants', label: 'Applicants' },
]

const candidateLinks = [
  { to: '/jobs', label: 'Browse Jobs' },
  { to: '/my-applications', label: 'My Applications' },
  { to: '/recommended', label: 'Recommended' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const links = user?.role === 'recruiter' ? recruiterLinks : candidateLinks

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      await logoutUser(refresh)
    } catch {
      // Token may already be expired — proceed with local logout
    }
    logout()
    toast.success('Logged out successfully.')
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/jobs'} className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-semibold text-slate-900">JobPilot</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${isActive(link.to)
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm"
              >
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-indigo-600">
                    {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                  </span>
                </div>
                <span className="hidden sm:block text-slate-700 font-medium max-w-[100px] truncate">
                  {user?.first_name || user?.email}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Profile
                  </Link>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => { setUserMenuOpen(false); handleLogout() }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="md:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 px-4 py-3 space-y-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive(link.to) ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
