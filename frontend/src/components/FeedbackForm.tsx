import { useState } from 'react';
import { useFeedback } from '../context/FeedbackContext';
import { Feedback, FeedbackSource, Sentiment } from '../types';

interface FeedbackFormProps {
  onSubmit: (data: Partial<Feedback>) => Promise<void> | void;
  onCancel?: () => void;
}

export default function FeedbackForm({ onSubmit, onCancel }: FeedbackFormProps) {
  const [content, setContent] = useState('');
  const [source, setSource] = useState<FeedbackSource>('SUPPORT_TICKET');
  const [sentiment, setSentiment] = useState<Sentiment>('NEUTRAL');
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);

  const { workspaces } = useFeedback();
  const workspaceId = workspaces[0]?.id ?? 1;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      content,
      source,
      sentiment,
      customerName: customerName || undefined,
      rating,
      workspaceId,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <form className="card space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-dark-300">Feedback</label>
          <textarea className="input-field min-h-[120px]" value={content} onChange={(event) => setContent(event.target.value)} required />
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-dark-300">Source</label>
            <select className="input-field" value={source} onChange={(event) => setSource(event.target.value as FeedbackSource)}>
              <option value="SUPPORT_TICKET">Support Ticket</option>
              <option value="APP_REVIEW">App Review</option>
              <option value="SURVEY">Survey</option>
              <option value="SALES_NOTE">Sales Note</option>
              <option value="COMMUNITY_POST">Community Post</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-dark-300">Sentiment</label>
            <select className="input-field" value={sentiment} onChange={(event) => setSentiment(event.target.value as Sentiment)}>
              <option value="POSITIVE">Positive</option>
              <option value="NEUTRAL">Neutral</option>
              <option value="NEGATIVE">Negative</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-dark-300">Customer name</label>
            <input className="input-field" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-dark-300">Rating</label>
            <input className="input-field" type="number" min="1" max="5" value={rating} onChange={(event) => setRating(Number(event.target.value))} />
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button className="btn-primary" type="submit">Save feedback</button>
        {onCancel ? (
          <button className="btn-secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
