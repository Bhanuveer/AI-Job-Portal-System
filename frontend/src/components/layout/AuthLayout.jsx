import { Briefcase, Sparkles, Zap, TrendingUp } from 'lucide-react'

const MOCK_JOBS = [
  {
    title: 'Senior React Developer',
    company: 'Stripe',
    location: 'Remote',
    salary: '$130k',
    color: 'bg-violet-500',
    highlight: true,
  },
  {
    title: 'Product Designer',
    company: 'Vercel',
    location: 'San Francisco',
    salary: '$115k',
    color: 'bg-slate-600',
    highlight: false,
  },
  {
    title: 'Backend Engineer',
    company: 'Linear',
    location: 'New York',
    salary: '$140k',
    color: 'bg-indigo-500',
    highlight: false,
  },
]

const FEATURES = [
  { icon: Sparkles, text: 'AI-powered job recommendations' },
  { icon: Zap,      text: 'Apply in one click with resume upload' },
  { icon: TrendingUp, text: 'Real-time application status tracking' },
]

const STATS = [
  { value: '2,400+', label: 'Active Jobs' },
  { value: '500+',   label: 'Companies' },
  { value: '50k+',   label: 'Candidates' },
]

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] bg-slate-900 flex-col p-10 xl:p-14 relative overflow-hidden">

        {/* Background glows */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5 mb-12">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">JobPilot</span>
        </div>

        {/* Headline */}
        <div className="relative mb-8">
          <h1 className="text-4xl xl:text-[2.6rem] font-bold text-white leading-[1.2] mb-4">
            Your next great<br />
            opportunity{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              awaits
            </span>
          </h1>
          <p className="text-slate-400 text-[15px] leading-relaxed">
            AI-powered job matching that connects the right talent with the right companies.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative space-y-3.5 mb-10">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500/15 border border-indigo-500/20 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <span className="text-slate-300 text-sm">{text}</span>
            </div>
          ))}
        </div>

        {/* Mock job cards */}
        <div className="relative space-y-2.5 mb-auto">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3">
            Latest Openings
          </p>
          {MOCK_JOBS.map((job) => (
            <div
              key={job.title}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                job.highlight
                  ? 'bg-indigo-600/20 border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                  : 'bg-white/[0.04] border-white/[0.08]'
              }`}
            >
              <div className={`w-9 h-9 ${job.color} rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                {job.company[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium truncate">{job.title}</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {job.company} &middot; {job.location}
                </p>
              </div>
              <span className={`text-xs font-semibold shrink-0 ${job.highlight ? 'text-indigo-300' : 'text-slate-400'}`}>
                {job.salary}
              </span>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="relative flex items-center gap-8 mt-10 pt-8 border-t border-white/10">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-white font-semibold text-base">{stat.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center bg-white overflow-y-auto">
        <div className="w-full max-w-md px-6 sm:px-10 py-12">
          {children}
        </div>
      </div>
    </div>
  )
}
