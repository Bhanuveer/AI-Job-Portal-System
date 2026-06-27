import { useState, useEffect, useCallback } from 'react'
import { Users, FileText, ExternalLink } from 'lucide-react'
import { toast } from 'react-toastify'
import { getRecruiterApplicants, updateApplicationStatus } from '../../api/applications'
import { getMyJobs } from '../../api/jobs'

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'hired', label: 'Hired' },
]
const STATUS_COLORS = {
  pending:     'bg-slate-100 text-slate-600',
  reviewing:   'bg-blue-50 text-blue-700',
  shortlisted: 'bg-amber-50 text-amber-700',
  rejected:    'bg-red-50 text-red-600',
  hired:       'bg-emerald-50 text-emerald-700',
}

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ job_id: '', status: '' })
  const [updatingId, setUpdatingId] = useState(null)

  const fetchApplicants = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.job_id) params.job_id = filters.job_id
      if (filters.status) params.status = filters.status
      const res = await getRecruiterApplicants(params)
      setApplicants(res.data.data)
    } catch {
      toast.error('Failed to load applicants.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchApplicants()
    getMyJobs({ page: 1 })
      .then(res => setJobs(res.data.data.results || []))
      .catch(() => {})
  }, [fetchApplicants])

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId)
    try {
      await updateApplicationStatus(appId, newStatus)
      setApplicants(prev =>
        prev.map(a => a.id === appId ? { ...a, status: newStatus } : a)
      )
      toast.success('Status updated.')
    } catch {
      toast.error('Failed to update status.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Applicants</h1>
        <p className="text-slate-500 text-sm mt-0.5">{applicants.length} application{applicants.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
        <select
          value={filters.job_id}
          onChange={e => setFilters(f => ({ ...f, job_id: e.target.value }))}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
        >
          <option value="">All Jobs</option>
          {jobs.map(job => (
            <option key={job.id} value={job.id}>{job.title}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
        >
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : applicants.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No applicants found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Candidate', 'Job', 'Applied', 'Resume', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicants.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {app.candidate.first_name && app.candidate.last_name
                          ? `${app.candidate.first_name} ${app.candidate.last_name}`
                          : app.candidate.email}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{app.candidate.email}</p>
                      {app.candidate.skills && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">{app.candidate.skills}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-700">{app.job_title}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      {app.resume ? (
                        <a
                          href={app.resume}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline font-medium"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status] || ''}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={app.status}
                        disabled={updatingId === app.id}
                        onChange={e => handleStatusChange(app.id, e.target.value)}
                        className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500 disabled:opacity-50"
                      >
                        {STATUSES.slice(1).map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
