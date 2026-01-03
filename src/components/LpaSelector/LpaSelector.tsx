import React, { useState, useEffect } from "react";
import { useLpas } from "../../hooks/useLpas";

export interface Lpa {
  lpa_code: string;
  lpa_name: string;
}

interface LpaSelectorProps {
  onLpaSelect?: (lpa: Lpa | null) => void;
  selectedLpa?: Lpa | null;
  selectedLpaCodes?: string[];
  onRemove?: (lpaCode: string) => void;
  showRemoveButton?: boolean;
  showCheckbox?: boolean;
}

const LpaSelector: React.FC<LpaSelectorProps> = ({
  onLpaSelect,
  selectedLpa,
  selectedLpaCodes = [],
  onRemove,
  showRemoveButton = false,
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
    setSelectedLpas((prev) => prev.filter((lpa) => lpa.code !== code));
    // Call parent onRemove if provided
    if (onRemove) {
      onRemove(code);
    }
  };

  const handleAdd = (code: string, name: string) => {
    if (!selectedLpas.some((s) => s.code === code)) {
      const newLpa = { code, name };
      setSelectedLpas((prev) => [...prev, newLpa]);
      if (onLpaSelect) {
        // Support both callback signatures
        onLpaSelect({ lpa_code: code, lpa_name: name });
      }
      setSearchTerm("");
      setShowDropdown(false);
    }
  };

  if (loading) {
    return <p className="govuk-body">Loading local planning authorities...</p>;
  }

  if (error) {
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
          <h2 className="govuk-heading-l">Select consultees</h2>

          {/* Checkbox to toggle LPA selector */}
          <div className="govuk-checkboxes" data-module="govuk-checkboxes">
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
                Local planning authority
              </label>
            </div>
          </div>
        </>
      ) : (
        <h2 className="govuk-heading-m">Local planning authority</h2>
      )}

      {/* Conditional content - shown when checkbox is checked OR when no checkbox */}
      {hasLpaConsultee && (
        <div
          className={showCheckbox ? "govuk-checkboxes__conditional" : ""}
          id={showCheckbox ? "hasLpaConsultee-hidden" : undefined}
        >
          {/* Table showing selected LPAs */}
          {selectedLpas.length > 0 && (
            <table className="govuk-table" id="fds-add-to-list-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th
                    className="govuk-table__header govuk-!-width-three-quarters"
                    scope="col"
                  >
                    Consultee
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {selectedLpas.map((lpa) => (
                  <tr key={lpa.code} className="govuk-table__row">
                    <td className="govuk-table__cell">{lpa.name}</td>
                    <td className="govuk-table__cell">
                      {showRemoveButton && (
                        <button
                          type="button"
                          className="govuk-link"
                          onClick={() => handleRemove(lpa.code)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#1d70b8",
                            textDecoration: "underline",
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Empty state inset text */}
          {selectedLpas.length === 0 && (
            <div id="fds-add-to-list-table-inset">
              <div className="govuk-inset-text">
                No items have been added yet.
              </div>
            </div>
          )}

          {/* Hidden input to store selected LPA codes */}
          <div id="fds-add-to-list-table-input">
            <input
              type="hidden"
              id="lpaConsultees"
              name="lpaConsultees"
              value={selectedLpas.map((l) => l.code).join(",")}
            />
          </div>

          {/* Search selector */}
          <div className="govuk-form-group">
            <label
              className="govuk-label"
              htmlFor="lpaConsulteeSelect"
              id="selector-lpaConsulteeSelect-label"
            >
              Select a local planning authority
            </label>

            {/* Instruction text */}
            {searchTerm.length === 0 && (
              <div
                className="govuk-body"
                style={{ marginTop: "10px", marginBottom: "10px" }}
              >
                Please enter 1 or more characters
              </div>
            )}

            <div
              className="fds-search-selector__input"
              style={{ position: "relative" }}
            >
              <input
                type="text"
                id="lpaConsulteeSelect"
                name="lpaConsulteeSelect"
                className="govuk-input"
                style={{ width: "100%" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder=""
                autoComplete="off"
              />

              {/* Dropdown results */}
              {showDropdown && filteredLpas.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    maxHeight: "300px",
                    overflowY: "auto",
                    backgroundColor: "white",
                    border: "2px solid #0b0c0c",
                    zIndex: 1000,
                    marginTop: "2px",
                  }}
                >
                  {filteredLpas.map((lpa) => (
                    <div
                      key={lpa.lpa_code}
                      onClick={() => handleAdd(lpa.lpa_code, lpa.lpa_name)}
                      style={{
                        padding: "12px",
                        cursor: "pointer",
                        borderBottom: "1px solid #b1b4b6",
                        fontSize: "19px",
                        fontFamily: '"GDS Transport", arial, sans-serif',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#1d70b8";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.color = "#0b0c0c";
                      }}
                    >
                      {lpa.lpa_name}
                    </div>
                  ))}
                </div>
              )}

              {showDropdown &&
                filteredLpas.length === 0 &&
                searchTerm.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "white",
                      border: "2px solid #0b0c0c",
                      padding: "10px",
                      zIndex: 1000,
                      marginTop: "2px",
                    }}
                  >
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
