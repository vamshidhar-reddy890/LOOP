import { useEffect, useMemo } from 'react';
import { ArrowUpRight, MessageSquare, Sparkles, TrendingUp } from 'lucide-react';
import { useFeedback } from '../context/FeedbackContext';
import PieChart from '../components/PieChart';
import LineChart from '../components/LineChart';
import BarChart from '../components/BarChart';
import StatsCard from '../components/StatsCard';

export default function Dashboard() {
  const { stats, feedbacks, loadStats, loadFeedback, loadWorkspaces, workspaces } = useFeedback();

  useEffect(() => {
    void loadStats();
    void loadFeedback({ page: 0, size: 5 });
    void loadWorkspaces();
  }, [loadFeedback, loadStats, loadWorkspaces]);

  const topThemes = useMemo(() => (stats?.themeDistribution ?? []).slice(0, 4), [stats]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-400">Operations center</p>
          <h1 className="mt-2 text-3xl font-semibold text-dark-100">Customer feedback intelligence</h1>
        </div>
        <div className="rounded-xl border border-dark-700 bg-dark-800/80 px-4 py-3 text-sm text-dark-400">
          <span className="font-medium text-dark-200">{workspaces[0]?.name ?? 'Northstar Workspace'}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total feedback" value={stats?.totalFeedback ?? 0} icon={MessageSquare} trend="Live" />
        <StatsCard title="Positive" value={stats?.positiveCount ?? 0} icon={TrendingUp} trend="Momentum" />
        <StatsCard title="Neutral" value={stats?.neutralCount ?? 0} icon={Sparkles} trend="Steady" />
        <StatsCard title="Negative" value={stats?.negativeCount ?? 0} icon={ArrowUpRight} trend="Needs attention" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-dark-100">Sentiment mix</h2>
              <p className="mt-1 text-sm text-dark-400">A quick look at how customer sentiment is trending.</p>
            </div>
          </div>
          <div className="mt-6 h-72">
            <PieChart data={stats?.sentimentDistribution ?? []} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-dark-100">Volume over time</h2>
              <p className="mt-1 text-sm text-dark-400">Recent activity and momentum.</p>
            </div>
          </div>
          <div className="mt-6 h-72">
            <LineChart data={stats?.feedbackTrend ?? []} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="card">
          <h2 className="text-xl font-semibold text-dark-100">Top themes</h2>
          <div className="mt-6">
            <BarChart data={topThemes} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-dark-100">Latest feedback</h2>
              <p className="mt-1 text-sm text-dark-400">The most recent customer notes from your workspace.</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {feedbacks.length === 0 ? (
              <p className="text-sm text-dark-400">No feedback yet. Import or create some to populate this view.</p>
            ) : (
              feedbacks.map((item) => (
                <div key={item.id} className="rounded-xl border border-dark-700 bg-dark-900/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-dark-100">{item.content}</p>
                    <span className="rounded-full bg-primary-600/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-300">
                      {item.sentiment}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-dark-400">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
