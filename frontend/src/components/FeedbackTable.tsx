import { Trash2 } from 'lucide-react';
import { Feedback } from '../types';

interface FeedbackTableProps {
  feedbacks: Feedback[];
  onDelete: (id: number) => Promise<void> | void;
}

export default function FeedbackTable({ feedbacks, onDelete }: FeedbackTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-dark-700 bg-dark-800/70">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-dark-300">
          <thead className="bg-dark-900/80 text-xs uppercase tracking-[0.2em] text-dark-400">
            <tr>
              <th className="px-4 py-3">Feedback</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Sentiment</th>
              <th className="px-4 py-3">Theme</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((item) => (
              <tr key={item.id} className="border-t border-dark-700/70">
                <td className="px-4 py-3 text-dark-100">{item.content}</td>
                <td className="px-4 py-3">{item.source}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-primary-600/15 px-2.5 py-1 text-xs uppercase tracking-[0.2em] text-primary-300">
                    {item.sentiment}
                  </span>
                </td>
                <td className="px-4 py-3">{item.themes[0] ?? 'General'}</td>
                <td className="px-4 py-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10" onClick={() => void onDelete(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
