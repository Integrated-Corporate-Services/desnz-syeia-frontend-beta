import { useEffect, useId, useRef, useState } from "react";
import "./CoordinatorCombobox.css";

export interface CoordinatorOption {
  id: string;
  label: string;
  value: string;
}

interface CoordinatorComboboxProps {
  id: string;
  labelId: string;
  describedBy: string;
  value: string;
  options: CoordinatorOption[];
  onChange: (value: string) => void;
  error: boolean;
}

const CoordinatorCombobox: React.FC<CoordinatorComboboxProps> = ({
  id,
  labelId,
  describedBy,
  value,
  options,
  onChange,
  error,
}) => {
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const typeahead = useRef({ text: "", time: 0 });
  const selectedIndex = options.findIndex((option) => option.value === value);

  const openAt = (index: number) => {
    if (options.length === 0) return;
    setActiveIndex(Math.max(0, Math.min(index, options.length - 1)));
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    document
      .getElementById(`${listboxId}-option-${activeIndex}`)
      ?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, isOpen, listboxId]);

  const selectOption = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openAt(
        isOpen
          ? Math.min(activeIndex + 1, options.length - 1)
          : selectedIndex >= 0
            ? selectedIndex
            : 0,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      openAt(
        isOpen
          ? Math.max(activeIndex - 1, 0)
          : selectedIndex >= 0
            ? selectedIndex
            : options.length - 1,
      );
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      openAt(event.key === "Home" ? 0 : options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isOpen) {
        selectOption(activeIndex >= 0 ? activeIndex : selectedIndex);
      } else {
        openAt(selectedIndex >= 0 ? selectedIndex : 0);
      }
      return;
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      setIsOpen(false);
      return;
    }

    if (
      event.key.length === 1 &&
      event.key !== " " &&
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
        options[index].label.toLocaleLowerCase().startsWith(prefix.toLocaleLowerCase()),
      );
      if (matchingIndex !== undefined) openAt(matchingIndex);
      event.preventDefault();
    }
  };

  return (
    <div className="coordinator-combobox">
      <button
        id={id}
        type="button"
        className={`govuk-select coordinator-combobox__control${error ? " govuk-select--error" : ""}`}
        role="combobox"
        aria-labelledby={`${labelId} ${id}-value`}
        aria-describedby={describedBy}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-activedescendant={
          isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        aria-required="true"
        aria-invalid={error}
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
        <span className="coordinator-combobox__value" id={`${id}-value`}>
          {value || "Select option..."}
        </span>
      </button>
      <span className="coordinator-combobox__arrow" aria-hidden="true" />
      <ul
        id={listboxId}
        className="coordinator-combobox__listbox"
        role="listbox"
        aria-labelledby={labelId}
        hidden={!isOpen}
      >
        {options.map((option, index) => (
          <li
            id={`${listboxId}-option-${index}`}
            key={option.id}
            className={`coordinator-combobox__option${
              activeIndex === index ? " coordinator-combobox__option--active" : ""
            }`}
            role="option"
            aria-selected={selectedIndex === index}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => selectOption(index)}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CoordinatorCombobox;