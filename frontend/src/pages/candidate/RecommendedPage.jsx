import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, MapPin, Briefcase, DollarSign, ArrowRight } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { getRecommendations } from '../../api/recommendations'

const JOB_TYPE_LABELS = {
  full_time: 'Full Time', part_time: 'Part Time',
  contract: 'Contract', internship: 'Internship', remote: 'Remote',
}

function MatchBadge({ percent }) {
  const color = percent >= 70
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : percent >= 40
    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
    : 'bg-amber-50 text-amber-700 border-amber-200'

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}>
      {percent}% match
    </span>
  )
}

function RecommendedJobCard({ job }) {
  const skills = job.skills ? job.skills.split(',').map(s => s.trim()).filter(Boolean) : []
  const salary = job.salary_min && job.salary_max
    ? `$${(job.salary_min / 1000).toFixed(0)}k – $${(job.salary_max / 1000).toFixed(0)}k`
    : null

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
        <MatchBadge percent={job.match_percent} />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{JOB_TYPE_LABELS[job.job_type]}</span>
        {salary && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{salary}</span>}
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skills.slice(0, 5).map(skill => (
            <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs">{skill}</span>
          ))}
          {skills.length > 5 && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md text-xs">+{skills.length - 5}</span>
          )}
        </div>
      )}

      <Link
        to={`/jobs/${job.id}`}
        className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
      >
        View & Apply <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  )
}

export default function RecommendedPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [noSkills, setNoSkills] = useState(false)

  useEffect(() => {
    getRecommendations()
      .then(res => {
        if (res.data.message === 'no_skills') {
          setNoSkills(true)
        } else {
          setJobs(res.data.data)
        }
      })
      .catch(() => toast.error('Failed to load recommendations.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h1 className="text-2xl font-semibold text-slate-900">Recommended for You</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Powered by TF-IDF + Cosine Similarity — matched to your skills.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="space-y-3 text-center">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Analysing your skills...</p>
          </div>
        </div>
      ) : noSkills ? (
        /* No skills set — prompt user to update profile */
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center max-w-md mx-auto">
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-indigo-500" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 mb-2">Add your skills to get started</h2>
          <p className="text-sm text-slate-500 mb-5">
            JobPilot needs to know your skills to recommend the best matching jobs using AI.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Update My Skills <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No matching jobs found right now.</p>
          <p className="text-xs text-slate-400 mt-1">Try adding more skills to your profile or check back later.</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Link to="/profile" className="text-sm text-indigo-600 font-medium hover:underline">
              Update Skills
            </Link>
            <span className="text-slate-300">·</span>
            <Link to="/jobs" className="text-sm text-indigo-600 font-medium hover:underline">
              Browse All Jobs
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Skills used */}
          {user?.skills && (
            <div className="flex flex-wrap items-center gap-2 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <span className="text-xs font-medium text-indigo-700">Matching on:</span>
              {user.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                <span key={skill} className="px-2 py-0.5 bg-white border border-indigo-200 text-indigo-700 rounded-md text-xs font-medium">
                  {skill}
                </span>
              ))}
              <Link to="/profile" className="ml-auto text-xs text-indigo-600 hover:underline">
                Edit skills
              </Link>
            </div>
          )}

          <p className="text-sm text-slate-500">{jobs.length} job{jobs.length !== 1 ? 's' : ''} found</p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {jobs.map(job => <RecommendedJobCard key={job.id} job={job} />)}
          </div>
        </>
      )}
    </div>
  )
}
