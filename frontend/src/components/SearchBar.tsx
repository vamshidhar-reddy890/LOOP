import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search' }: SearchBarProps) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-dark-700 bg-dark-900/80 px-3 py-2 text-sm text-dark-400 md:min-w-[260px]">
      <Search size={16} />
      <input
        className="w-full bg-transparent outline-none placeholder:text-dark-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
