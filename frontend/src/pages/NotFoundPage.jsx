import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-slate-200 mb-4">404</p>
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Page not found</h1>
        <p className="text-slate-500 text-sm mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          to="/"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
