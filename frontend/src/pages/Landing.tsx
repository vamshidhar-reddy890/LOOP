import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const highlights = [
  'Centralize customer feedback from every source',
  'Surface themes with AI-powered sentiment insights',
  'Share executive-ready reports in seconds',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.2),_transparent_40%)] bg-dark-950 text-dark-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-6 py-10 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xl font-semibold">
            <div className="rounded-xl bg-primary-600/20 p-2 text-primary-400">
              <Sparkles size={18} />
            </div>
            LOOP
          </div>
          <div className="flex gap-3">
            <Link to="/login" className="btn-secondary">
              Sign in
            </Link>
            <Link to="/signup" className="btn-primary">
              Start free
            </Link>
          </div>
        </header>

        <main className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-600/10 px-3 py-1 text-sm text-primary-300">
              <Sparkles size={14} />
              AI-powered customer feedback intelligence
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
              Turn every customer signal into a clear product decision.
            </h1>
            <p className="mt-6 text-lg text-dark-400 sm:text-xl">
              LOOP brings together support tickets, app reviews, survey responses, and sales notes into one live command center.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary flex items-center gap-2">
                Create your workspace
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-secondary">
                Explore the demo
              </Link>
            </div>
            <div className="mt-8 space-y-3">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-3 text-dark-300">
                  <CheckCircle2 className="text-primary-400" size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card animate-pulse-glow">
            <div className="rounded-2xl border border-dark-700 bg-dark-900/80 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">Live snapshot</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-dark-700 bg-dark-800 p-4">
                  <p className="text-sm text-dark-400">Total feedback</p>
                  <p className="mt-2 text-3xl font-semibold">1.2k</p>
                </div>
                <div className="rounded-xl border border-dark-700 bg-dark-800 p-4">
                  <p className="text-sm text-dark-400">Positive sentiment</p>
                  <p className="mt-2 text-3xl font-semibold">76%</p>
                </div>
              </div>
              <div className="mt-6 rounded-xl border border-dark-700 bg-dark-800 p-4">
                <p className="text-sm text-dark-400">Top themes</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Reliability', 'Onboarding', 'Value'].map((theme) => (
                    <span key={theme} className="rounded-full bg-primary-600/15 px-3 py-1 text-sm text-primary-300">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
