import React, { useState, useEffect } from "react";
import { useLpas } from "../../hooks/useLpas";
import log from "../../logger";

export interface Lpa {
  lpa_code: string;
  lpa_name: string;
}

interface LpaSelectorProps {
  onLpaSelect?: (lpa: Lpa | null) => void;
  selectedLpa?: Lpa | null;
  selectedLpaCodes?: string[];
  onRemove?: (lpaCode: string) => void;
  showCheckbox?: boolean;
}

const LpaSelector: React.FC<LpaSelectorProps> = ({
  onLpaSelect,
  selectedLpa,
  selectedLpaCodes = [],
  onRemove,
  showCheckbox = true,
}) => {
  const { lpas, loading, error } = useLpas();
  const [selectedLpas, setSelectedLpas] = useState<
    Array<{ code: string; name: string }>
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLpas, setFilteredLpas] = useState(lpas);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasLpaConsultee, setHasLpaConsultee] = useState(!showCheckbox); // Auto-show if no checkbox

  // Initialize selected LPAs from codes or selectedLpa prop
  useEffect(() => {
    if (selectedLpa) {
      // Single LPA mode (for consultation details page)
      log.debug('[LpaSelector] Initializing with single LPA', { lpaCode: selectedLpa.lpa_code, lpaName: selectedLpa.lpa_name });
      setSelectedLpas([
        { code: selectedLpa.lpa_code, name: selectedLpa.lpa_name },
      ]);
    } else if (lpas.length > 0 && selectedLpaCodes.length > 0) {
      // Multiple LPAs mode
      const initialLpas = selectedLpaCodes
        .map((code) => {
          const lpa = lpas.find((l) => l.lpa_code === code);
          return lpa ? { code: lpa.lpa_code, name: lpa.lpa_name } : null;
        })
        .filter((lpa): lpa is { code: string; name: string } => lpa !== null);

      log.debug('[LpaSelector] Initializing with multiple LPAs', { count: initialLpas.length });
      setSelectedLpas(initialLpas);
    }
  }, [lpas, selectedLpaCodes, selectedLpa]);

  // Filter LPAs based on search term
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = lpas.filter((lpa) =>
        lpa.lpa_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLpas(filtered);
      setShowDropdown(true);
    } else {
      setFilteredLpas([]);
      setShowDropdown(false);
    }
  }, [searchTerm, lpas]);

  const handleRemove = (code: string) => {
    log.debug('[LpaSelector] Removing LPA', { lpaCode: code });
    setSelectedLpas((prev) => prev.filter((lpa) => lpa.code !== code));
    // Call parent onRemove if provided
    if (onRemove) {
      onRemove(code);
    }
  };

  const handleAdd = (code: string, name: string) => {
    if (!selectedLpas.some((s) => s.code === code)) {
      log.debug('[LpaSelector] Adding LPA', { lpaCode: code, lpaName: name });
      const newLpa = { code, name };
      setSelectedLpas((prev) => [...prev, newLpa]);
      if (onLpaSelect) {
        // Support both callback signatures
        onLpaSelect({ lpa_code: code, lpa_name: name });
      }
      setSearchTerm("");
      setShowDropdown(false);
    } else {
      log.debug('[LpaSelector] LPA already selected, skipping', { lpaCode: code });
    }
  };

  if (loading) {
    log.debug('[LpaSelector] Loading LPAs...');
    return <p className="govuk-body">Loading local planning authorities...</p>;
  }

  if (error) {
    log.error('[LpaSelector] Error loading LPAs:', error);
    return (
      <div className="govuk-error-message">
        <span className="govuk-visually-hidden">Error:</span> {error}
      </div>
    );
  }

  return (
    <div>
      {/* Only show heading and checkbox if showCheckbox is true */}
      {showCheckbox ? (
        <>

          {/* Checkbox to toggle LPA selector */}
          <div className="govuk-checkboxes govuk-!-margin-bottom-2" data-module="govuk-checkboxes">
            <div className="govuk-checkboxes__item">
              <input
                className="govuk-checkboxes__input"
                id="hasLpaConsultee"
                name="hasLpaConsultee"
                type="checkbox"
                checked={hasLpaConsultee}
                onChange={(e) => setHasLpaConsultee(e.target.checked)}
                aria-controls="hasLpaConsultee-hidden"
                aria-expanded={hasLpaConsultee}
              />
              <label
                className="govuk-label govuk-checkboxes__label"
                htmlFor="hasLpaConsultee"
              >
                                            Local Planning Authority (LPA)
              </label>
            </div>
          </div>
        </>
      ) : (
        <h2 className="govuk-heading-m">Local planning authority</h2>
      )}

    { hasLpaConsultee&& (
                                    <div className="govuk-checkboxes__conditional">
                                        {selectedLpas.length > 0 && (
                                            <div className="govuk-!-margin-bottom-4" style={{ width: '100%' }}>
                                                {selectedLpas.map((entry) => (
                                                    <div key={entry.code} className="govuk-!-padding-bottom-2 govuk-!-padding-top-2" style={{ borderBottom: '1px solid #b1b4b6', width: '100%' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '1rem' }}>
                                                            <span className="govuk-body" style={{ margin: 0, flex: '1 1 auto', minWidth: 0, wordBreak: 'break-word' }}>{entry.name}</span>
                                                            <a
                                                                href="#"
                                                                className="govuk-link"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleRemove(entry.code);
                                                                }}
                                                                style={{ whiteSpace: 'nowrap' }}
                                                            >
                                                                Remove
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                               
          {/* Hidden input to store selected LPA codes */}
          <input
            type="hidden"
            id="lpaConsultees"
            name="lpaConsultees"
            value={selectedLpas.map((l) => l.code).join(",")}
          />

          {/* Search selector */}
          <div className="govuk-form-group govuk-!-margin-top-4">
            <label
              className="govuk-label"
              htmlFor="lpaConsulteeSelect"
              id="selector-lpaConsulteeSelect-label"
            >
              Start typing an LPA's name
            </label>

            <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="lpaConsulteeSelect"
                  name="lpaConsulteeSelect"
                  className="govuk-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder=""
                  autoComplete="off"
                />

                {/* Dropdown results */}
                {showDropdown && filteredLpas.length > 0 && (
                  <ul 
                    className="govuk-list" 
                    style={{
                     
                      backgroundColor: 'white',
                      border: '1px solid',
                     
                    }}
                  >
                    {filteredLpas.map((lpa) => (
                      <li key={lpa.lpa_code} style={{ borderBottom: '1px solid #b1b4b6' }}>
                        <a
                          href="#"
                          className="govuk-link"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAdd(lpa.lpa_code, lpa.lpa_name);
                          }}
                          style={{
                            display: 'block',
                            padding: '0.75rem 1rem',
                            textDecoration: 'none'
                          }}
                        >
                          {lpa.lpa_name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                {showDropdown &&
                  filteredLpas.length === 0 &&
                  searchTerm.length > 0 && (
                    <div className="govuk-body govuk-!-margin-top-2">
                      No results found
                    </div>
                  )}

                <span
                  id="selector-lpaConsulteeSelect-aria"
                  className="govuk-visually-hidden"
                ></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LpaSelector;
