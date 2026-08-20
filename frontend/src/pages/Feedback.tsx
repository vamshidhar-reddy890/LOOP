import { useEffect, useMemo, useState } from 'react';
import { Plus, UploadCloud } from 'lucide-react';
import { useFeedback } from '../context/FeedbackContext';
import FeedbackForm from '../components/FeedbackForm';
import FeedbackTable from '../components/FeedbackTable';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import CSVUpload from '../components/CSVUpload';
import Pagination from '../components/Pagination';
import { FeedbackFilter, Feedback as FeedbackModel, Sentiment, FeedbackSource } from '../types';

const PAGE_SIZE = 6;

export default function FeedbackPage() {
  const { feedbacks, loadFeedback, createFeedback, deleteFeedback, importFeedback, loading, error, workspaces } = useFeedback();
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [sentiment, setSentiment] = useState<Sentiment | ''>('');
  const [source, setSource] = useState<FeedbackSource | ''>('');

  const filters = useMemo<FeedbackFilter>(() => ({ page, size: PAGE_SIZE, search, sentiment: sentiment || undefined, source: source || undefined }), [page, search, sentiment, source]);

  useEffect(() => {
    void loadFeedback(filters);
  }, [filters, loadFeedback]);

  const handleCreate = async (data: Partial<FeedbackModel>) => {
    await createFeedback(data);
    setShowForm(false);
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    await deleteFeedback(id);
  };

  const handleUpload = async (file: File) => {
    const workspaceId = workspaces[0]?.id ?? 1;
    await importFeedback(file, workspaceId);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-400">Feedback workspace</p>
          <h1 className="mt-2 text-3xl font-semibold text-dark-100">Customer conversations</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary flex items-center gap-2" onClick={() => setShowForm((value) => !value)}>
            <Plus size={16} />
            {showForm ? 'Hide form' : 'Add feedback'}
          </button>
          <CSVUpload onUpload={handleUpload} />
        </div>
      </div>

      <div className="rounded-2xl border border-dark-700 bg-dark-800/70 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <SearchBar value={search} onChange={setSearch} placeholder="Search feedback" />
            <FilterDropdown value={sentiment} onChange={setSentiment} options={['POSITIVE', 'NEUTRAL', 'NEGATIVE']} placeholder="Sentiment" />
            <FilterDropdown value={source} onChange={setSource} options={['SUPPORT_TICKET', 'APP_REVIEW', 'SURVEY', 'SALES_NOTE', 'COMMUNITY_POST']} placeholder="Source" />
          </div>
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <UploadCloud size={16} />
            Import CSV or add a new note quickly.
          </div>
        </div>
      </div>

      {showForm ? <FeedbackForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} /> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <FeedbackTable feedbacks={feedbacks} onDelete={handleDelete} />
      <Pagination page={page} totalPages={2} onPageChange={setPage} />
      {loading ? <p className="text-sm text-dark-400">Loading feedback...</p> : null}
    </div>
  );
}
