interface FilterDropdownProps<T extends string> {
  value: T | '';
  onChange: (value: T | '') => void;
  options: T[];
  placeholder?: string;
}

export default function FilterDropdown<T extends string>({ value, onChange, options, placeholder = 'Filter' }: FilterDropdownProps<T>) {
  return (
    <select className="input-field md:w-48" value={value} onChange={(event) => onChange(event.target.value as T | '')}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
