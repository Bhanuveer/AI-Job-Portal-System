import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Briefcase, Search } from 'lucide-react'
import { toast } from 'react-toastify'
import { getMyJobs, deleteJob } from '../../api/jobs'

const JOB_TYPE_LABELS = {
  full_time: 'Full Time', part_time: 'Part Time',
  contract: 'Contract', internship: 'Internship', remote: 'Remote',
}

export default function MyJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyJobs({ search, page })
      const { results, count, next, previous } = res.data.data
      setJobs(results)
      setPagination({ count, next, previous })
    } catch {
      toast.error('Failed to load jobs.')
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const handleDelete = async (jobId, jobTitle) => {
    if (!window.confirm(`Delete "${jobTitle}"? This cannot be undone.`)) return
    try {
      await deleteJob(jobId)
      toast.success('Job deleted.')
      fetchJobs()
    } catch {
      toast.error('Failed to delete job.')
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My Jobs</h1>
          <p className="text-slate-500 text-sm mt-0.5">{pagination.count} job{pagination.count !== 1 ? 's' : ''} posted</p>
        </div>
        <Link
          to="/recruiter/jobs/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Post a Job
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">{search ? 'No jobs match your search.' : 'No jobs posted yet.'}</p>
            {!search && (
              <Link to="/recruiter/jobs/new" className="mt-3 inline-flex items-center gap-1.5 text-sm text-indigo-600 font-medium hover:underline">
                <Plus className="w-4 h-4" /> Post your first job
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Job Title', 'Location', 'Type', 'Applied', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-900">{job.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{job.company}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{job.location}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                          {JOB_TYPE_LABELS[job.job_type]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{job.application_count}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                          ${job.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/recruiter/jobs/${job.id}/edit`}
                            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(job.id, job.title)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(pagination.next || pagination.previous) && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">Page {page}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={!pagination.previous}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!pagination.next}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
