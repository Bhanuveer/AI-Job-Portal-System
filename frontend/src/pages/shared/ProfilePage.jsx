import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { User, Building2, MapPin, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getProfile, updateProfile } from '../../api/auth'

function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputClass = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 text-sm outline-none transition-colors'

export default function ProfilePage() {
  const { user, login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [fetchingProfile, setFetchingProfile] = useState(true)

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm()

  useEffect(() => {
    getProfile()
      .then(res => reset(res.data.data))
      .catch(() => toast.error('Failed to load profile.'))
      .finally(() => setFetchingProfile(false))
  }, [reset])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await updateProfile(data)
      const updatedUser = res.data.data
      // Sync auth context with updated user data
      login(
        updatedUser,
        localStorage.getItem('access_token'),
        localStorage.getItem('refresh_token')
      )
      reset(updatedUser)
      toast.success('Profile updated successfully.')
    } catch (err) {
      const errs = err.response?.data?.errors
      if (errs) {
        const first = Object.values(errs)[0]
        toast.error(Array.isArray(first) ? first[0] : first)
      } else {
        toast.error('Failed to update profile.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetchingProfile) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isCandidate = user?.role === 'candidate'

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-indigo-600">
            {user?.first_name?.[0] || user?.email?.[0] || 'U'}
          </span>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {user?.first_name && user?.last_name
              ? `${user.first_name} ${user.last_name}`
              : user?.email}
          </h1>
          <span className="inline-block mt-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full capitalize">
            {user?.role}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" error={errors.first_name?.message}>
              <input className={inputClass} placeholder="John" {...register('first_name', { required: 'Required.' })} />
            </Field>
            <Field label="Last Name" error={errors.last_name?.message}>
              <input className={inputClass} placeholder="Doe" {...register('last_name', { required: 'Required.' })} />
            </Field>
          </div>

          <Field label="Location">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className={`${inputClass} pl-9`}
                placeholder="e.g. New York, NY"
                {...register('location')}
              />
            </div>
          </Field>

          <Field label="Bio">
            <textarea
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder={isCandidate
                ? 'Tell recruiters about yourself...'
                : 'Describe your company and what you do...'}
              {...register('bio')}
            />
          </Field>
        </div>

        {/* Candidate: Skills */}
        {isCandidate && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-900">Skills</h2>
              <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full ml-1">
                Powers AI Recommendations
              </span>
            </div>

            <Field
              label="Your Skills"
              hint="Separate with commas. The more specific, the better your job matches."
              error={errors.skills?.message}
            >
              <textarea
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="e.g. React, JavaScript, TypeScript, Node.js, REST APIs, Git"
                {...register('skills')}
              />
            </Field>

            <div className="flex items-start gap-2 p-3 bg-indigo-50 rounded-lg">
              <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
              <p className="text-xs text-indigo-700">
                JobPilot uses TF-IDF + Cosine Similarity to match your skills with job requirements.
                The more skills you list, the more accurate your recommendations will be.
              </p>
            </div>
          </div>
        )}

        {/* Recruiter: Company Info */}
        {!isCandidate && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">Company Information</h2>
            </div>

            <Field label="Company Name">
              <input className={inputClass} placeholder="Acme Corp" {...register('company_name')} />
            </Field>

            <Field label="Company Website" error={errors.company_website?.message}>
              <input
                className={inputClass}
                placeholder="https://example.com"
                {...register('company_website', {
                  pattern: {
                    value: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/,
                    message: 'Enter a valid URL.'
                  }
                })}
              />
            </Field>
          </div>
        )}

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !isDirty}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
