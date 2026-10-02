import { useEffect, useId, useRef, useState } from 'react';
import '../../styles/AccessibleSelect.css';

export interface AccessibleSelectOption {
  value: string;
  text: React.ReactNode;
  disabled?: boolean;
}

interface AccessibleSelectProps {
  id: string;
  value: string;
  options: readonly AccessibleSelectOption[];
  onChange: (value: string) => void;
  error?: boolean;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  'aria-describedby'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Drop-in replacement for a native <select> that keeps its open option list
 * anchored and height-capped below the control, so it can never be clipped
 * by the viewport edge at high browser zoom (a native <select> popup is
 * rendered by the browser/OS and cannot be constrained this way).
 */
const AccessibleSelect: React.FC<AccessibleSelectProps> = ({
  id,
  value,
  options,
  onChange,
  error = false,
  className = '',
  required = false,
  disabled = false,
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const typeahead = useRef({ text: '', time: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const findEnabledIndex = (start: number, direction: 1 | -1): number => {
    for (let offset = 0; offset < options.length; offset += 1) {
      const index = (start + offset * direction + options.length * options.length) % options.length;
      if (!options[index]?.disabled) return index;
    }
    return start;
  };

  const openAt = (index: number) => {
    if (options.length === 0) return;
    const clamped = Math.max(0, Math.min(index, options.length - 1));
    setActiveIndex(options[clamped]?.disabled ? findEnabledIndex(clamped, 1) : clamped);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    document
      .getElementById(`${listboxId}-option-${activeIndex}`)
      ?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex, isOpen, listboxId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const selectOption = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (isOpen) {
        openAt(findEnabledIndex(Math.min(activeIndex + 1, options.length - 1), 1));
      } else {
        openAt(selectedIndex >= 0 ? selectedIndex : 0);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (isOpen) {
        openAt(findEnabledIndex(Math.max(activeIndex - 1, 0), -1));
      } else {
        openAt(selectedIndex >= 0 ? selectedIndex : options.length - 1);
      }
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      openAt(event.key === 'Home' ? 0 : options.length - 1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isOpen) {
        selectOption(activeIndex >= 0 ? activeIndex : selectedIndex);
      } else {
        openAt(selectedIndex >= 0 ? selectedIndex : 0);
      }
      return;
    }

    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      setIsOpen(false);
      return;
    }

    if (
      event.key.length === 1 &&
      event.key !== ' ' &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      const now = Date.now();
      const prefix =
        now - typeahead.current.time < 1000
          ? typeahead.current.text + event.key
          : event.key;
      typeahead.current = { text: prefix, time: now };
      const startIndex = isOpen && activeIndex >= 0 ? activeIndex + 1 : 0;
      const matchingIndex = Array.from({ length: options.length }, (_, offset) =>
        (startIndex + offset) % options.length,
      ).find((index) =>
        !options[index].disabled &&
        String(options[index].text).toLocaleLowerCase().startsWith(prefix.toLocaleLowerCase()),
      );
      if (matchingIndex !== undefined) openAt(matchingIndex);
      event.preventDefault();
    }
  };

  return (
    <div className="accessible-select" ref={containerRef}>
      <button
        id={id}
        type="button"
        className={`govuk-select accessible-select__control ${className} ${
          error ? 'govuk-select--error' : ''
        }`.trim()}
        role="combobox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-activedescendant={
          isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        aria-required={required}
        aria-invalid={error}
        disabled={disabled}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            openAt(selectedIndex >= 0 ? selectedIndex : 0);
          }
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => setIsOpen(false)}
      >
        <span className="accessible-select__value">{selectedOption?.text ?? ''}</span>
      </button>
      <span className="accessible-select__arrow" aria-hidden="true" />
      <ul
        id={listboxId}
        className="accessible-select__listbox"
        role="listbox"
        hidden={!isOpen}
      >
        {options.map((option, index) => (
          <li
            id={`${listboxId}-option-${index}`}
            key={option.value}
            className={`accessible-select__option${
              activeIndex === index ? ' accessible-select__option--active' : ''
            }${option.disabled ? ' accessible-select__option--disabled' : ''}`}
            role="option"
            aria-selected={selectedIndex === index}
            aria-disabled={option.disabled || undefined}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => !option.disabled && setActiveIndex(index)}
            onClick={() => selectOption(index)}
          >
            {option.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AccessibleSelect;
