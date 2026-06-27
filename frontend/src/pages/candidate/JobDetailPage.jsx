import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Briefcase, DollarSign, Clock, X, Upload, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { getJob } from '../../api/jobs'
import { applyForJob, checkApplication, withdrawApplication } from '../../api/applications'

const JOB_TYPE_LABELS = {
  full_time: 'Full Time', part_time: 'Part Time',
  contract: 'Contract', internship: 'Internship', remote: 'Remote',
}
const EXPERIENCE_LABELS = {
  entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior Level', lead: 'Lead / Manager',
}

function ApplyModal({ job, onClose, onSuccess }) {
  const [resume, setResume] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are accepted.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume must be under 5MB.')
      return
    }
    setResume(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!resume) { toast.error('Please upload your resume.'); return }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('job', job.id)
      formData.append('resume', resume)
      formData.append('cover_letter', coverLetter)
      await applyForJob(formData)
      toast.success('Application submitted!')
      onSuccess()
    } catch (err) {
      const errs = err.response?.data?.errors
      if (errs) {
        const first = Object.values(errs)[0]
        toast.error(Array.isArray(first) ? first[0] : first)
      } else {
        toast.error('Failed to submit application.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Apply for this role</h2>
            <p className="text-sm text-slate-500">{job.title} at {job.company}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Resume (PDF, max 5MB)</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]) }}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
                ${dragOver ? 'border-indigo-400 bg-indigo-50' : resume ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-indigo-300'}`}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={e => handleFileChange(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {resume ? (
                <div className="flex items-center justify-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">{resume.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Drop your PDF here or <span className="text-indigo-600 font-medium">browse</span></p>
                </>
              )}
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Cover Letter <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={4}
              placeholder="Tell the recruiter why you're a great fit..."
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 resize-none transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState({ has_applied: false, application: null })

  useEffect(() => {
    const load = async () => {
      try {
        const [jobRes, checkRes] = await Promise.all([
          getJob(id),
          checkApplication(id),
        ])
        setJob(jobRes.data.data)
        setApplicationStatus(checkRes.data.data)
      } catch {
        toast.error('Job not found.')
        navigate('/jobs')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  const handleApplySuccess = () => {
    setShowApplyModal(false)
    setApplicationStatus({ has_applied: true, application: {} })
  }

  const handleWithdraw = async () => {
    if (!window.confirm('Withdraw your application?')) return
    try {
      await withdrawApplication(applicationStatus.application.id)
      toast.success('Application withdrawn.')
      setApplicationStatus({ has_applied: false, application: null })
    } catch {
      toast.error('Cannot withdraw this application.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const skills = job.skills ? job.skills.split(',').map(s => s.trim()).filter(Boolean) : []
  const salary = job.salary_min && job.salary_max
    ? `$${(job.salary_min / 1000).toFixed(0)}k – $${(job.salary_max / 1000).toFixed(0)}k / year`
    : null

  return (
    <>
      {showApplyModal && (
        <ApplyModal job={job} onClose={() => setShowApplyModal(false)} onSuccess={handleApplySuccess} />
      )}

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
          ← Back to Jobs
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-slate-900">{job.title}</h1>
              <p className="text-slate-500 mt-1">{job.company}</p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{JOB_TYPE_LABELS[job.job_type]}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{EXPERIENCE_LABELS[job.experience_level]}</span>
                {salary && <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" />{salary}</span>}
              </div>
            </div>

            <div className="shrink-0 space-y-2">
              {applicationStatus.has_applied ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-lg">
                    <CheckCircle2 className="w-4 h-4" /> Applied
                  </div>
                  {applicationStatus.application?.id && (
                    <button
                      onClick={handleWithdraw}
                      className="w-full text-xs text-slate-400 hover:text-red-500 transition-colors"
                    >
                      Withdraw
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  disabled={!job.is_active}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {job.is_active ? 'Apply Now' : 'Closed'}
                </button>
              )}
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-100">
              {skills.map(skill => (
                <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">About the Role</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
          </section>
          <div className="border-t border-slate-100" />
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">Requirements</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{job.requirements}</p>
          </section>
        </div>

        {/* Apply CTA at bottom */}
        {!applicationStatus.has_applied && job.is_active && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Interested in this role?</p>
              <p className="text-xs text-slate-500 mt-0.5">Apply now — it only takes a minute.</p>
            </div>
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Apply Now
            </button>
          </div>
        )}
      </div>
    </>
  )
}
