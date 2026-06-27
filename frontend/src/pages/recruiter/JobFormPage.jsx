import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { ArrowLeft } from 'lucide-react'
import { createJob, updateJob, getJob } from '../../api/jobs'

const JOB_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
]
const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'lead', label: 'Lead / Manager' },
]

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputClass = (hasError) =>
  `w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
    hasError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'
  }`

export default function JobFormPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetchingJob, setFetchingJob] = useState(isEditing)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { job_type: 'full_time', experience_level: 'mid', is_active: true }
  })

  useEffect(() => {
    if (!isEditing) return
    getJob(id)
      .then(res => reset(res.data.data))
      .catch(() => { toast.error('Job not found.'); navigate('/recruiter/jobs') })
      .finally(() => setFetchingJob(false))
  }, [id, isEditing, navigate, reset])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (isEditing) {
        await updateJob(id, data)
        toast.success('Job updated successfully.')
      } else {
        await createJob(data)
        toast.success('Job posted successfully.')
      }
      navigate('/recruiter/jobs')
    } catch (err) {
      const errs = err.response?.data?.errors
      if (errs) {
        const first = Object.values(errs)[0]
        toast.error(Array.isArray(first) ? first[0] : first)
      } else {
        toast.error('Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetchingJob) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">
          {isEditing ? 'Edit Job' : 'Post a New Job'}
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          {isEditing ? 'Update your job listing.' : 'Fill in the details to attract the right candidates.'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Title + Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Job Title" error={errors.title?.message}>
              <input
                placeholder="e.g. Senior React Developer"
                className={inputClass(errors.title)}
                {...register('title', { required: 'Job title is required.' })}
              />
            </Field>
            <Field label="Company" error={errors.company?.message}>
              <input
                placeholder="e.g. Acme Corp"
                className={inputClass(errors.company)}
                {...register('company', { required: 'Company name is required.' })}
              />
            </Field>
          </div>

          {/* Location + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Location" error={errors.location?.message}>
              <input
                placeholder="e.g. Remote, New York, NY"
                className={inputClass(errors.location)}
                {...register('location', { required: 'Location is required.' })}
              />
            </Field>
            <Field label="Job Type" error={errors.job_type?.message}>
              <select className={inputClass(errors.job_type)} {...register('job_type')}>
                {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
          </div>

          {/* Experience + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Experience Level" error={errors.experience_level?.message}>
              <select className={inputClass(errors.experience_level)} {...register('experience_level')}>
                {EXPERIENCE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputClass(false)} {...register('is_active')}>
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </Field>
          </div>

          {/* Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Min Salary (optional)" error={errors.salary_min?.message}>
              <input
                type="number"
                placeholder="e.g. 80000"
                className={inputClass(errors.salary_min)}
                {...register('salary_min', { min: { value: 0, message: 'Must be positive.' } })}
              />
            </Field>
            <Field label="Max Salary (optional)" error={errors.salary_max?.message}>
              <input
                type="number"
                placeholder="e.g. 120000"
                className={inputClass(errors.salary_max)}
                {...register('salary_max', { min: { value: 0, message: 'Must be positive.' } })}
              />
            </Field>
          </div>

          {/* Skills */}
          <Field label="Required Skills (comma-separated)" error={errors.skills?.message}>
            <input
              placeholder="e.g. React, Node.js, TypeScript, REST APIs"
              className={inputClass(errors.skills)}
              {...register('skills', { required: 'Please list required skills.' })}
            />
            <p className="mt-1 text-xs text-slate-400">Used to match candidates automatically.</p>
          </Field>

          {/* Description */}
          <Field label="Job Description" error={errors.description?.message}>
            <textarea
              rows={5}
              placeholder="Describe the role, team, and what the candidate will be doing..."
              className={`${inputClass(errors.description)} resize-none`}
              {...register('description', { required: 'Job description is required.' })}
            />
          </Field>

          {/* Requirements */}
          <Field label="Requirements" error={errors.requirements?.message}>
            <textarea
              rows={4}
              placeholder="List qualifications, years of experience, education requirements..."
              className={`${inputClass(errors.requirements)} resize-none`}
              {...register('requirements', { required: 'Requirements are required.' })}
            />
          </Field>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Job' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
