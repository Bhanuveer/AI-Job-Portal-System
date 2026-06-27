import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Eye, EyeOff, Briefcase } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { loginUser } from '../../api/auth'
import AuthLayout from '../../components/layout/AuthLayout'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await loginUser(data)
      const { user, access, refresh } = res.data.data
      login(user, access, refresh)
      toast.success(`Welcome back, ${user.first_name || user.username}!`)
      navigate(user.role === 'recruiter' ? '/recruiter/dashboard' : '/jobs')
    } catch (err) {
      const msg = err.response?.data?.errors?.non_field_errors?.[0]
        || err.response?.data?.message
        || 'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      {/* Mobile logo — hidden on desktop since AuthLayout shows it on left panel */}
      <div className="flex items-center gap-2.5 mb-8 lg:hidden">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Briefcase className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-semibold text-slate-900">JobPilot</span>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
        <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all
              ${errors.email
                ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              }`}
            {...register('email', {
              required: 'Email is required.',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email.' },
            })}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all pr-11
                ${errors.password
                  ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                  : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                }`}
              {...register('password', { required: 'Password is required.' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-indigo-200 mt-1"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
          Create one free
        </Link>
      </p>
    </AuthLayout>
  )
}
