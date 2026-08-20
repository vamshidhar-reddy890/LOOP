interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button className="btn-secondary" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span className="text-sm text-dark-400">Page {page + 1} of {totalPages}</span>
      <button className="btn-secondary" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </div>
  );
}
