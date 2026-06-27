import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, MapPin, Clock, FileText, ExternalLink } from 'lucide-react'
import { toast } from 'react-toastify'
import { getMyApplications, withdrawApplication } from '../../api/applications'

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'bg-slate-100 text-slate-600' },
  reviewing:   { label: 'Reviewing',   color: 'bg-blue-50 text-blue-700' },
  shortlisted: { label: 'Shortlisted', color: 'bg-amber-50 text-amber-700' },
  rejected:    { label: 'Rejected',    color: 'bg-red-50 text-red-600' },
  hired:       { label: 'Hired 🎉',    color: 'bg-emerald-50 text-emerald-700' },
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchApplications = async () => {
    try {
      const res = await getMyApplications()
      setApplications(res.data.data)
    } catch {
      toast.error('Failed to load applications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApplications() }, [])

  const handleWithdraw = async (id, jobTitle) => {
    if (!window.confirm(`Withdraw your application for "${jobTitle}"?`)) return
    try {
      await withdrawApplication(id)
      toast.success('Application withdrawn.')
      setApplications(prev => prev.filter(a => a.id !== id))
    } catch {
      toast.error('Cannot withdraw this application.')
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Applications</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No applications yet.</p>
          <Link to="/jobs" className="mt-2 inline-block text-sm text-indigo-600 font-medium hover:underline">
            Browse Jobs →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(app => {
            const statusInfo = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending
            return (
              <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      to={`/jobs/${app.job.id}`}
                      className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      {app.job.title}
                    </Link>
                    <p className="text-sm text-slate-500 mt-0.5">{app.job.company}</p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
                        Applied {formatDate(app.applied_at)}
                      </span>
                      {app.resume && (
                        <a
                          href={app.resume}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-indigo-600 hover:underline"
                        >
                          <FileText className="w-3 h-3" /> Resume
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    {app.status === 'pending' && (
                      <button
                        onClick={() => handleWithdraw(app.id, app.job.title)}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>

                {app.cover_letter && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-1">Cover Letter</p>
                    <p className="text-sm text-slate-600 line-clamp-2">{app.cover_letter}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'today'
  if (diff === 1) return 'yesterday'
  if (diff < 7) return `${diff} days ago`
  return new Date(dateStr).toLocaleDateString()
}
