import { useEffect, useState } from 'react';
import { CalendarDays, FileText, PlusCircle } from 'lucide-react';
import { useFeedback } from '../context/FeedbackContext';
import { ReportType } from '../types';

export default function Reports() {
  const { reports, loadReports, generateReport } = useFeedback();
  const [type, setType] = useState<ReportType>('WEEKLY');
  const [start, setStart] = useState('2026-07-20');
  const [end, setEnd] = useState('2026-07-27');

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await generateReport(1, type, start, end);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-400">Executive reports</p>
          <h1 className="mt-2 text-3xl font-semibold text-dark-100">Snapshot your customer story</h1>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form className="card space-y-4" onSubmit={handleGenerate}>
          <div className="flex items-center gap-2 text-primary-400">
            <PlusCircle size={18} />
            <h2 className="text-xl font-semibold text-dark-100">Generate a new report</h2>
          </div>
          <div>
            <label className="mb-2 block text-sm text-dark-300">Report type</label>
            <select className="input-field" value={type} onChange={(event) => setType(event.target.value as ReportType)}>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-dark-300">Start date</label>
              <input className="input-field" type="date" value={start} onChange={(event) => setStart(event.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm text-dark-300">End date</label>
              <input className="input-field" type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
            </div>
          </div>
          <button className="btn-primary w-full" type="submit">
            Generate report
          </button>
        </form>

        <div className="card space-y-4">
          <div className="flex items-center gap-2 text-primary-400">
            <FileText size={18} />
            <h2 className="text-xl font-semibold text-dark-100">Recent reports</h2>
          </div>
          {reports.length === 0 ? (
            <p className="text-sm text-dark-400">No reports yet. Generate one to share with your team.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="rounded-xl border border-dark-700 bg-dark-900/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-dark-100">{report.title}</p>
                      <p className="mt-1 text-sm text-dark-400">{report.summary}</p>
                    </div>
                    <span className="rounded-full bg-primary-600/15 px-2.5 py-1 text-xs uppercase tracking-[0.2em] text-primary-300">
                      {report.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-dark-400">
                    <CalendarDays size={14} />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
