import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Eye, EyeOff, Briefcase } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { registerUser } from '../../api/auth'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { role: 'candidate' }
  })
  const selectedRole = watch('role')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await registerUser({
        ...data,
        username: data.email.split('@')[0] + Math.floor(Math.random() * 1000),
      })
      const { user, access, refresh } = res.data.data
      login(user, access, refresh)
      toast.success('Account created! Welcome to JobPilot.')
      navigate(user.role === 'recruiter' ? '/recruiter/dashboard' : '/jobs')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0]
        toast.error(Array.isArray(first) ? first[0] : first)
      } else {
        toast.error(err.response?.data?.message || 'Registration failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-semibold text-slate-900">JobPilot</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-2xl font-semibold text-slate-900 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm mb-6">Join thousands of professionals on JobPilot</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'candidate', label: 'Job Seeker' },
                  { value: 'recruiter', label: 'Recruiter' },
                ].map(option => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border cursor-pointer text-sm font-medium transition-colors
                      ${selectedRole === option.value
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      className="sr-only"
                      {...register('role')}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-colors
                    ${errors.first_name ? 'border-red-300' : 'border-slate-200 focus:border-indigo-500'}`}
                  {...register('first_name', { required: 'Required' })}
                />
                {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-colors
                    ${errors.last_name ? 'border-red-300' : 'border-slate-200 focus:border-indigo-500'}`}
                  {...register('last_name', { required: 'Required' })}
                />
                {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-colors
                  ${errors.email ? 'border-red-300' : 'border-slate-200 focus:border-indigo-500'}`}
                {...register('email', {
                  required: 'Email is required.',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email.' }
                })}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-colors pr-10
                    ${errors.password ? 'border-red-300' : 'border-slate-200 focus:border-indigo-500'}`}
                  {...register('password', {
                    required: 'Password is required.',
                    minLength: { value: 8, message: 'Minimum 8 characters.' }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-colors
                  ${errors.password_confirm ? 'border-red-300' : 'border-slate-200 focus:border-indigo-500'}`}
                {...register('password_confirm', {
                  required: 'Please confirm your password.',
                  validate: val => val === watch('password') || 'Passwords do not match.'
                })}
              />
              {errors.password_confirm && <p className="mt-1 text-xs text-red-500">{errors.password_confirm.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
