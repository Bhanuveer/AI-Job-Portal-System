import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Users, TrendingUp, Plus, ArrowRight, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { getDashboard, deleteJob } from '../../api/jobs'

const JOB_TYPE_LABELS = {
  full_time: 'Full Time', part_time: 'Part Time',
  contract: 'Contract', internship: 'Internship', remote: 'Remote',
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async () => {
    try {
      const res = await getDashboard()
      setData(res.data.data)
    } catch {
      toast.error('Failed to load dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  const handleDelete = async (jobId, jobTitle) => {
    if (!window.confirm(`Delete "${jobTitle}"? This cannot be undone.`)) return
    try {
      await deleteJob(jobId)
      toast.success('Job deleted.')
      fetchDashboard()
    } catch {
      toast.error('Failed to delete job.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { stats, recent_jobs } = data || { stats: {}, recent_jobs: [] }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Good {getGreeting()}, {user?.first_name || 'there'}!
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Here&apos;s an overview of your job postings.</p>
        </div>
        <Link
          to="/recruiter/jobs/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Post a Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Briefcase} label="Total Jobs" value={stats.total_jobs ?? 0} color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={TrendingUp} label="Active Jobs" value={stats.active_jobs ?? 0} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Users} label="Total Applications" value={stats.total_applications ?? 0} color="bg-amber-50 text-amber-600" />
      </div>

      {/* Recent Jobs */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Recent Jobs</h2>
          <Link to="/recruiter/jobs" className="flex items-center gap-1 text-sm text-indigo-600 hover:underline font-medium">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent_jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No jobs posted yet.</p>
            <Link to="/recruiter/jobs/new" className="mt-3 inline-flex items-center gap-1.5 text-sm text-indigo-600 font-medium hover:underline">
              <Plus className="w-4 h-4" /> Post your first job
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent_jobs.map(job => (
              <div key={job.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{job.company} · {job.location}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500">{JOB_TYPE_LABELS[job.job_type]}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                    ${job.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-slate-400">{job.application_count} applied</span>
                  <Link to={`/recruiter/jobs/${job.id}/edit`} className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <button onClick={() => handleDelete(job.id, job.title)} className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
