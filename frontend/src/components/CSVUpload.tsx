import { useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface CSVUploadProps {
  onUpload: (file: File) => Promise<void> | void;
}

export default function CSVUpload({ onUpload }: CSVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-dark-700 bg-dark-900/60 px-3 py-2">
      <input type="file" accept=",.csv,.pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      <button className="btn-secondary flex items-center gap-2" onClick={() => void handleUpload()} disabled={!file || uploading}>
        <UploadCloud size={16} />
        {uploading ? 'Uploading...' : 'Import file'}
      </button>
    </div>
  );
}
