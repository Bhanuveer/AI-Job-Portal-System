import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Briefcase, Clock, DollarSign, SlidersHorizontal, X } from 'lucide-react'
import { getJobs } from '../../api/jobs'
import { toast } from 'react-toastify'

const JOB_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
]
const EXPERIENCE_LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'lead', label: 'Lead / Manager' },
]
const JOB_TYPE_COLORS = {
  full_time: 'bg-indigo-50 text-indigo-700',
  part_time: 'bg-violet-50 text-violet-700',
  contract: 'bg-amber-50 text-amber-700',
  internship: 'bg-sky-50 text-sky-700',
  remote: 'bg-emerald-50 text-emerald-700',
}

function JobCard({ job }) {
  const skills = job.skills ? job.skills.split(',').map(s => s.trim()).filter(Boolean) : []
  const salary = job.salary_min && job.salary_max
    ? `$${(job.salary_min / 1000).toFixed(0)}k – $${(job.salary_max / 1000).toFixed(0)}k`
    : job.salary_min ? `From $${(job.salary_min / 1000).toFixed(0)}k` : null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <Link
            to={`/jobs/${job.id}`}
            className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1"
          >
            {job.title}
          </Link>
          <p className="text-sm text-slate-500 mt-0.5">{job.company}</p>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${JOB_TYPE_COLORS[job.job_type] || 'bg-slate-100 text-slate-600'}`}>
          {JOB_TYPES.find(t => t.value === job.job_type)?.label || job.job_type}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />
          {EXPERIENCE_LEVELS.find(l => l.value === job.experience_level)?.label || job.experience_level}
        </span>
        {salary && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{salary}</span>}
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skills.slice(0, 4).map(skill => (
            <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs">{skill}</span>
          ))}
          {skills.length > 4 && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md text-xs">+{skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3 h-3" />{formatDate(job.created_at)}
        </span>
        <Link
          to={`/jobs/${job.id}`}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ job_type: '', experience_level: '' })
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, ...(search && { search }), ...filters }
      const res = await getJobs(params)
      const { results, count, next, previous } = res.data.data
      setJobs(results)
      setPagination({ count, next, previous })
    } catch {
      toast.error('Failed to load jobs.')
    } finally {
      setLoading(false)
    }
  }, [search, filters, page])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const clearFilters = () => {
    setFilters({ job_type: '', experience_level: '' })
    setSearch('')
    setPage(1)
  }

  const hasActiveFilters = search || filters.job_type || filters.experience_level

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Browse Jobs</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {pagination.count} job{pagination.count !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs, companies, skills..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium border rounded-lg transition-colors
            ${showFilters ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
        </button>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Job Type</label>
            <select
              value={filters.job_type}
              onChange={e => { setFilters(f => ({ ...f, job_type: e.target.value })); setPage(1) }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
            >
              {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Experience Level</label>
            <select
              value={filters.experience_level}
              onChange={e => { setFilters(f => ({ ...f, experience_level: e.target.value })); setPage(1) }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
            >
              {EXPERIENCE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Job Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No jobs found.</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-2 text-sm text-indigo-600 hover:underline">Clear filters</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      )}

      {/* Pagination */}
      {(pagination.next || pagination.previous) && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">Page {page} of {Math.ceil(pagination.count / 10)}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={!pagination.previous}
              className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!pagination.next}
              className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff} days ago`
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`
  return new Date(dateStr).toLocaleDateString()
}
