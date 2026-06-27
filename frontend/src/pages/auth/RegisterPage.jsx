import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Eye, EyeOff, Briefcase, UserRound, Building2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { registerUser } from '../../api/auth'
import AuthLayout from '../../components/layout/AuthLayout'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { role: 'candidate' },
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
      const errs = err.response?.data?.errors
      if (errs) {
        const first = Object.values(errs)[0]
        toast.error(Array.isArray(first) ? first[0] : first)
      } else {
        toast.error(err.response?.data?.message || 'Registration failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (hasError) =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
      hasError
        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
        : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
    }`

  return (
    <AuthLayout>
      {/* Mobile logo */}
      <div className="flex items-center gap-2.5 mb-8 lg:hidden">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Briefcase className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-semibold text-slate-900">JobPilot</span>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
        <p className="text-slate-500 text-sm">Join thousands of professionals on JobPilot</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Role Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'candidate', label: 'Job Seeker', icon: UserRound },
              { value: 'recruiter', label: 'Recruiter',  icon: Building2 },
            ].map(({ value, label, icon: Icon }) => (
              <label
                key={value}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border cursor-pointer text-sm font-medium transition-all
                  ${selectedRole === value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                <input type="radio" value={value} className="sr-only" {...register('role')} />
                <Icon className="w-4 h-4" />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
            <input
              placeholder="John"
              className={inputClass(errors.first_name)}
              {...register('first_name', { required: 'Required.' })}
            />
            {errors.first_name && (
              <p className="mt-1 text-xs text-red-500">{errors.first_name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
            <input
              placeholder="Doe"
              className={inputClass(errors.last_name)}
              {...register('last_name', { required: 'Required.' })}
            />
            {errors.last_name && (
              <p className="mt-1 text-xs text-red-500">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            className={inputClass(errors.email)}
            {...register('email', {
              required: 'Email is required.',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email.' },
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
              className={`${inputClass(errors.password)} pr-11`}
              {...register('password', {
                required: 'Password is required.',
                minLength: { value: 8, message: 'Minimum 8 characters.' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
            className={inputClass(errors.password_confirm)}
            {...register('password_confirm', {
              required: 'Please confirm your password.',
              validate: val => val === watch('password') || 'Passwords do not match.',
            })}
          />
          {errors.password_confirm && (
            <p className="mt-1 text-xs text-red-500">{errors.password_confirm.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-indigo-200 mt-1"
        >
          {loading ? 'Creating account...' : 'Create Free Account'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
