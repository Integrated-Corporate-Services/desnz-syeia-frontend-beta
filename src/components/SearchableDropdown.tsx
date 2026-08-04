import React, { useState, useRef } from 'react';

export interface SearchableDropdownOption {
  label: string;
  value: string;
}

export interface SearchableDropdownProps {
  label: string;
  hint?: string;
  value: string | null;
  onChange: (value: string | null, option?: SearchableDropdownOption) => void;
  fetchOptions: (input: string) => Promise<SearchableDropdownOption[]>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  hint,
  onChange,
  fetchOptions,
  placeholder = '',
  disabled = false,
  error,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<SearchableDropdownOption[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch options when input changes
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setShowDropdown(true);
    setLoading(true);
    setHighlightedIdx(null);
    try {
      const opts = await fetchOptions(val);
      setOptions(opts);
    } finally {
      setLoading(false);
    }
  };

  // Select option
  const handleSelect = (option: SearchableDropdownOption) => {
    setInputValue(option.label);
    setShowDropdown(false);
    setHighlightedIdx(null);
    onChange(option.value, option);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || options.length === 0) return;
    if (e.key === 'ArrowDown') {
      setHighlightedIdx(idx => idx === null ? 0 : Math.min(idx + 1, options.length - 1));
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setHighlightedIdx(idx => idx === null ? options.length - 1 : Math.max(idx - 1, 0));
      e.preventDefault();
    } else if (e.key === 'Enter' && highlightedIdx !== null) {
      handleSelect(options[highlightedIdx]);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      e.preventDefault();
    }
  };

  // Hide dropdown on blur
  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 100);
  };

  return (
    <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`} style={{ position: 'relative', maxWidth: 700 }}>
      <label className="govuk-label" htmlFor="searchable-dropdown-input">{label}</label>
      {hint && <div className="govuk-hint">{hint}</div>}
      {error && <p className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {error}</p>}
      <input
        id="searchable-dropdown-input"
        ref={inputRef}
        className={`govuk-input${error ? ' govuk-input--error' : ''}`}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-controls="searchable-dropdown-list"
        style={{ width: '100%' }}
      />
      {showDropdown && (
        <ul
          id="searchable-dropdown-list"
          className="govuk-list"
          style={{
            position: 'absolute',
            zIndex: 10,
            width: '100%',
            background: '#fff',
            border: '2px solid #b1b4b6',
            marginTop: 2,
            maxHeight: 220,
            overflowY: 'auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: 0,
            listStyle: 'none',
          }}
        >
          {loading && (
            <li style={{ padding: 8, color: '#505a5f' }}>Searching...</li>
          )}
          {!loading && options.length === 0 && (
            <li style={{ padding: 8, color: '#505a5f' }}>No results found</li>
          )}
          {options.map((opt, idx) => (
            <li
              key={opt.value}
              onMouseDown={() => handleSelect(opt)}
              style={{
                padding: 8,
                background: highlightedIdx === idx ? '#1d70b8' : '#fff',
                color: highlightedIdx === idx ? '#fff' : '#0b0c0c',
                cursor: 'pointer',
                fontWeight: highlightedIdx === idx ? 700 : 400,
              }}
              aria-selected={highlightedIdx === idx}
              tabIndex={-1}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchableDropdown;
